-- Refresh PostgREST schema cache
-- Run this after creating new tables to immediately refresh the schema cache
-- This ensures PostgREST recognizes new tables without waiting 1-5 minutes

NOTIFY pgrst, 'reload schema';

-- Verify the notification was sent
SELECT 'PostgREST schema cache refresh notification sent' AS status;





