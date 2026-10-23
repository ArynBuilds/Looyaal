-- Schema parity: columns, tables and functions the application uses that the
-- earlier migrations never declared. Safe to re-run.

-- Organizations: Instagram connection + dead-hour offer depth + surprise pool
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS instagram_access_token text,
  ADD COLUMN IF NOT EXISTS instagram_user_id text,
  ADD COLUMN IF NOT EXISTS instagram_page_id text,
  ADD COLUMN IF NOT EXISTS instagram_connected_at timestamptz,
  ADD COLUMN IF NOT EXISTS dead_hour_discount numeric(5,2) DEFAULT 15,
  ADD COLUMN IF NOT EXISTS surprise_pool text[] DEFAULT '{}'::text[];

-- Locations: Google Business Profile connection
ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS google_access_token text,
  ADD COLUMN IF NOT EXISTS google_refresh_token text,
  ADD COLUMN IF NOT EXISTS google_account_id text,
  ADD COLUMN IF NOT EXISTS google_location_id text,
  ADD COLUMN IF NOT EXISTS google_connected_at timestamptz;

-- Customers: last Google review nudge
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS review_nudge_sent_at timestamptz;

-- Customer offers: item a dead-hour offer applies to
ALTER TABLE customer_offers
  ADD COLUMN IF NOT EXISTS applies_to_item text;

-- Dead-hour slots the learner gave up on
ALTER TABLE dead_hour_suggestions
  ADD COLUMN IF NOT EXISTS abandoned_at timestamptz;

-- Influencer scoring components
ALTER TABLE influencers
  ADD COLUMN IF NOT EXISTS accessibility_score numeric,
  ADD COLUMN IF NOT EXISTS impact_score numeric,
  ADD COLUMN IF NOT EXISTS free_coffee_score numeric,
  ADD COLUMN IF NOT EXISTS discovered_via_hashtag text;

-- Hashtag search performance for influencer discovery
CREATE TABLE IF NOT EXISTS hashtag_performance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  hashtag text NOT NULL,
  search_count integer NOT NULL DEFAULT 0,
  influencers_found integer NOT NULL DEFAULT 0,
  influencers_qualified integer NOT NULL DEFAULT 0,
  influencers_active integer NOT NULL DEFAULT 0,
  last_searched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, hashtag)
);
ALTER TABLE hashtag_performance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their org data" ON hashtag_performance;
CREATE POLICY "Users can only access their org data" ON hashtag_performance
  FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
GRANT ALL ON hashtag_performance TO anon, authenticated, service_role;

-- POS webhook: add a matched transaction to the customer's lifetime spend
CREATE OR REPLACE FUNCTION public.increment_customer_spent(p_customer_id uuid, p_amount numeric)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  UPDATE public.customers
     SET total_spent = COALESCE(total_spent, 0) + COALESCE(p_amount, 0)
   WHERE id = p_customer_id;
$function$;

-- Manual RFM run from the dashboard (same work as the weekly cron)
CREATE OR REPLACE FUNCTION public.run_rfm_segmentation()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT public.compute_rfm_segments();
$function$;

-- Birthday campaign: customers whose birth_date falls on the given day
CREATE OR REPLACE FUNCTION public.find_birthday_customers(p_month integer, p_day integer)
 RETURNS SETOF public.customers
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT *
    FROM public.customers
   WHERE birth_date IS NOT NULL
     AND EXTRACT(MONTH FROM birth_date) = p_month
     AND EXTRACT(DAY FROM birth_date) = p_day;
$function$;

REVOKE EXECUTE ON FUNCTION public.increment_customer_spent(uuid, numeric) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.run_rfm_segmentation() FROM anon;
REVOKE EXECUTE ON FUNCTION public.find_birthday_customers(integer, integer) FROM anon, authenticated;
