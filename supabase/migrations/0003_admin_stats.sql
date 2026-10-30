-- Phase 5: one function that returns the admin's business numbers.
-- It refuses anyone who is not an admin, even if they call it directly. Run once in SQL Editor.
CREATE OR REPLACE FUNCTION public.admin_stats() RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.current_user_role() IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  RETURN json_build_object(
    'revenue_total', COALESCE((SELECT SUM(amount_ngn) FROM payments WHERE payment_status = 'Success'), 0),
    'revenue_30d',   COALESCE((SELECT SUM(amount_ngn) FROM payments
                               WHERE payment_status = 'Success' AND paid_at >= now() - interval '30 days'), 0),
    'jobs_total',    (SELECT COUNT(*) FROM jobs),
    'by_status',     COALESCE((SELECT json_object_agg(status, c)
                               FROM (SELECT status, COUNT(*) AS c FROM jobs GROUP BY status) s), '{}'::json)
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.admin_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated;
