-- customer_offers: single source of truth for redeemable offers
CREATE TABLE IF NOT EXISTS customer_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  offer_type TEXT NOT NULL,
  offer_value DECIMAL(10,2),
  free_item_name TEXT,
  notification_id UUID,
  campaign_id UUID,
  status TEXT DEFAULT 'active',
  expires_at TIMESTAMPTZ NOT NULL,
  claimed_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_offers_active ON customer_offers(customer_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_customer_offers_org ON customer_offers(org_id);
CREATE INDEX IF NOT EXISTS idx_customer_offers_type ON customer_offers(customer_id, type, status);

ALTER TABLE customer_offers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "org_access_customer_offers" ON customer_offers
    FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- notification_type column for dead hour push tracking
ALTER TABLE notification_queue ADD COLUMN IF NOT EXISTS notification_type TEXT;
