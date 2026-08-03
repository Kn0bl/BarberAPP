-- 1. Restrict SECURITY DEFINER functions that should not be callable by clients
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
-- has_role must stay executable: it is used inside RLS policies evaluated as the caller.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 2. Tenant scoping helper
CREATE OR REPLACE FUNCTION public.current_barbershop_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT barbershop_id FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.current_barbershop_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_barbershop_id() TO authenticated;

-- 3. Scope tenant-wide SELECT policies to the user's own barbershop
DROP POLICY IF EXISTS barbershops_read ON public.barbershops;
CREATE POLICY barbershops_read ON public.barbershops
  FOR SELECT TO authenticated
  USING (id = public.current_barbershop_id());

DROP POLICY IF EXISTS services_read ON public.services;
CREATE POLICY services_read ON public.services
  FOR SELECT TO authenticated
  USING (barbershop_id = public.current_barbershop_id());

DROP POLICY IF EXISTS settings_read ON public.barbershop_settings;
CREATE POLICY settings_read ON public.barbershop_settings
  FOR SELECT TO authenticated
  USING (barbershop_id = public.current_barbershop_id());

DROP POLICY IF EXISTS availability_read ON public.availability;
CREATE POLICY availability_read ON public.availability
  FOR SELECT TO authenticated
  USING (barbershop_id = public.current_barbershop_id());

DROP POLICY IF EXISTS time_blocks_read ON public.time_blocks;
CREATE POLICY time_blocks_read ON public.time_blocks
  FOR SELECT TO authenticated
  USING (barbershop_id = public.current_barbershop_id());

-- 4. Make role escalation impossible from the client: no write privileges at all
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
