-- AI v2 Phase A: Safety constraints + new columns

-- CHECK constraints on discount/offer values
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_optimal_discount_range') THEN
    ALTER TABLE customers ADD CONSTRAINT check_optimal_discount_range
      CHECK (optimal_discount IS NULL OR (optimal_discount >= 0 AND optimal_discount <= 100));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_offer_value_range') THEN
    ALTER TABLE auto_campaign_settings ADD CONSTRAINT check_offer_value_range
      CHECK (default_offer_value >= 0 AND default_offer_value <= 100);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_nq_offer_value_range') THEN
    ALTER TABLE notification_queue ADD CONSTRAINT check_nq_offer_value_range
      CHECK (offer_value IS NULL OR (offer_value >= 0 AND offer_value <= 100));
  END IF;
END $$;

-- Org-level discount bounds (replaces hardcoded 10/30)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS min_discount DECIMAL(5,2) DEFAULT 5;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS max_discount DECIMAL(5,2) DEFAULT 30;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS estimated_daily_customers INTEGER;

-- Customer automation status + hero offer tracking
ALTER TABLE customers ADD COLUMN IF NOT EXISTS hero_offer_count INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS automation_status TEXT DEFAULT 'active';

-- Streak columns (needed in Phase C but cheap to add now)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS streak_last_visit_date DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS streak_grace_used BOOLEAN DEFAULT FALSE;

-- Notification audit table (needed from Phase B but create now for clean migration)
CREATE TABLE IF NOT EXISTS notification_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  decision_date DATE NOT NULL,
  action_chosen TEXT NOT NULL,
  action_reason TEXT,
  tier SMALLINT,
  discount_used DECIMAL(5,2),
  scores_json JSONB,
  was_holdback BOOLEAN DEFAULT FALSE,
  scheduled_for TIMESTAMPTZ,
  outcome TEXT DEFAULT 'pending',
  outcome_visit_id UUID,
  outcome_resolved_at TIMESTAMPTZ,
  attribution_window_hours INTEGER,
  customer_state_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_audit_org_date ON notification_audit(org_id, decision_date);
CREATE INDEX IF NOT EXISTS idx_notification_audit_customer ON notification_audit(customer_id, decision_date);
CREATE INDEX IF NOT EXISTS idx_notification_audit_holdback ON notification_audit(org_id, was_holdback, decision_date);
CREATE INDEX IF NOT EXISTS idx_notification_audit_outcome ON notification_audit(customer_id, outcome);

-- Challenges table (needed in Phase D but create now)
CREATE TABLE IF NOT EXISTS customer_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_count INTEGER NOT NULL,
  current_count INTEGER DEFAULT 0,
  reward_type TEXT NOT NULL DEFAULT 'bonus_stamp',
  reward_value INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_customer ON customer_challenges(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_challenges_org ON customer_challenges(org_id, status);

-- Shop intelligence new columns
ALTER TABLE shop_intelligence ADD COLUMN IF NOT EXISTS incremental_visits_this_week INTEGER DEFAULT 0;
ALTER TABLE shop_intelligence ADD COLUMN IF NOT EXISTS incremental_revenue_this_week DECIMAL(12,2) DEFAULT 0;
ALTER TABLE shop_intelligence ADD COLUMN IF NOT EXISTS discount_cost_this_week DECIMAL(12,2) DEFAULT 0;
ALTER TABLE shop_intelligence ADD COLUMN IF NOT EXISTS net_roi_this_week DECIMAL(12,2) DEFAULT 0;
ALTER TABLE shop_intelligence ADD COLUMN IF NOT EXISTS best_performing_tier SMALLINT;
ALTER TABLE shop_intelligence ADD COLUMN IF NOT EXISTS best_performing_action TEXT;

-- RLS on new tables
ALTER TABLE notification_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access_notification_audit" ON notification_audit
  FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "org_access_customer_challenges" ON customer_challenges
  FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
