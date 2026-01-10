-- Up Migration
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

-- Down Migration
DROP VIEW "public"."monthly_log_events_summary";
