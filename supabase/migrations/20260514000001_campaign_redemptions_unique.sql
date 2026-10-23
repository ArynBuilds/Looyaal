-- Enforce one redemption per (campaign, customer) at the DB level.
-- Even with parallel barista scans / two-tab abuse, only one INSERT can win;
-- the loser surfaces a 23505 unique_violation that the API maps to a friendly error.
--
-- Dedupe first (in case prod already has duplicate rows from the unguarded path),
-- keeping the earliest redemption per (campaign, customer).

WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY campaign_id, customer_id
           ORDER BY redeemed_at ASC NULLS LAST, created_at ASC
         ) AS rn
  FROM public.campaign_redemptions
)
DELETE FROM public.campaign_redemptions
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

ALTER TABLE public.campaign_redemptions
  ADD CONSTRAINT campaign_redemptions_campaign_customer_unique
  UNIQUE (campaign_id, customer_id);
