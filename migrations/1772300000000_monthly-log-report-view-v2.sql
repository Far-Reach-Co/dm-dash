-- Up Migration
DROP VIEW IF EXISTS "public"."monthly_log_events_overview";
DROP VIEW IF EXISTS "public"."monthly_log_events_summary";

CREATE VIEW "public"."monthly_log_events_summary" AS
WITH normalized AS (
  SELECT
    DATE_TRUNC('month', created_at) AS month,
    event_type,
    COALESCE(
      NULLIF(event_data->>'feature', ''),
      NULLIF(SPLIT_PART(event_type, '.', 1), ''),
      'event'
    ) AS feature,
    COALESCE(
      NULLIF(event_data->>'action', ''),
      CASE
        WHEN POSITION('.' IN event_type) > 0
          THEN SUBSTRING(event_type FROM POSITION('.' IN event_type) + 1)
        ELSE 'event'
      END
    ) AS action,
    COALESCE(NULLIF(event_data->>'outcome', ''), 'success') AS outcome,
    NULLIF(event_data->>'reason', '') AS reason,
    user_id,
    project_id
  FROM "public"."LogEvent"
)
SELECT
  month,
  event_type,
  feature,
  action,
  outcome,
  reason,
  COUNT(*)::int AS event_count,
  COUNT(DISTINCT user_id)::int AS unique_users,
  COUNT(DISTINCT project_id)::int AS unique_projects
FROM normalized
GROUP BY month, event_type, feature, action, outcome, reason
ORDER BY month DESC, event_count DESC, event_type ASC;

CREATE VIEW "public"."monthly_log_events_overview" AS
SELECT
  month,
  SUM(event_count)::int AS total_events,
  COUNT(DISTINCT event_type)::int AS unique_event_types,
  SUM(CASE WHEN outcome = 'success' THEN event_count ELSE 0 END)::int AS success_events,
  SUM(CASE WHEN outcome = 'denied' THEN event_count ELSE 0 END)::int AS denied_events,
  SUM(CASE WHEN outcome = 'error' THEN event_count ELSE 0 END)::int AS error_events
FROM "public"."monthly_log_events_summary"
GROUP BY month
ORDER BY month DESC;

-- Down Migration
DROP VIEW IF EXISTS "public"."monthly_log_events_overview";
DROP VIEW IF EXISTS "public"."monthly_log_events_summary";

CREATE VIEW "public"."monthly_log_events_summary" AS
SELECT
  DATE_TRUNC('month', created_at) AS month,
  event_type,
  COUNT(*) AS event_count,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(DISTINCT project_id) AS unique_projects
FROM "public"."LogEvent"
GROUP BY DATE_TRUNC('month', created_at), event_type
ORDER BY month DESC, event_count DESC;
