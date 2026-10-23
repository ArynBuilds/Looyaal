CREATE TABLE IF NOT EXISTS action_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  segment TEXT NOT NULL,
  action TEXT NOT NULL,
  context_key TEXT DEFAULT 'default',
  attempts INTEGER DEFAULT 0,
  successes INTEGER DEFAULT 0,
  score DECIMAL(5,4) DEFAULT 0.5,
  alpha DECIMAL(10,2) DEFAULT 1,
  beta DECIMAL(10,2) DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, segment, action, context_key)
);

CREATE TABLE IF NOT EXISTS dead_hour_propensity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  dead_hour_attempts INTEGER DEFAULT 0,
  dead_hour_successes INTEGER DEFAULT 0,
  alpha DECIMAL(10,2) DEFAULT 1,
  beta DECIMAL(10,2) DEFAULT 1,
  visits_during_dead_hour INTEGER DEFAULT 0,
  preferred_dead_hour INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_action_scores_org ON action_scores(org_id, segment);
CREATE INDEX IF NOT EXISTS idx_dead_hour_propensity_org ON dead_hour_propensity(org_id, customer_id);

ALTER TABLE action_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE dead_hour_propensity ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "org_access_action_scores" ON action_scores
    FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "org_access_dead_hour_propensity" ON dead_hour_propensity
    FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
