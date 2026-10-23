-- Track which dead-hour-targeted audits have been processed by the learning
-- loop, independent of outcome. Previously the learning loop only scanned
-- rows with outcome='pending', but resolveAttributionOnVisit flips the
-- outcome to 'visited' in real time, so successful conversions never got
-- their propensity alpha credited. Using a dedicated column means we can
-- process any audit row exactly once without clobbering the user-facing
-- outcome that the resolver set.
ALTER TABLE notification_audit
  ADD COLUMN IF NOT EXISTS dead_hour_learned_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_notif_audit_dh_learning
  ON notification_audit (org_id, action_chosen, dead_hour_learned_at, decision_date)
  WHERE action_chosen = 'dead_hour_targeted';
