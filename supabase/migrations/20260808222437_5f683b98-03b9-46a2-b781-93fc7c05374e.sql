-- 1. Nueva función: ¿el usuario actual es owner de ESTA barbería puntual?
CREATE OR REPLACE FUNCTION public.is_owner_of(_barbershop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'owner'
      AND barbershop_id = _barbershop_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_owner_of(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_owner_of(uuid) TO authenticated;

-- 2. Lectura: reforzar con is_owner_of además de current_barbershop_id
DROP POLICY IF EXISTS barbershops_read ON public.barbershops;
CREATE POLICY barbershops_read ON public.barbershops
  FOR SELECT TO authenticated
  USING (id = public.current_barbershop_id() OR public.is_owner_of(id));

DROP POLICY IF EXISTS services_read ON public.services;
CREATE POLICY services_read ON public.services
  FOR SELECT TO authenticated
  USING (barbershop_id = public.current_barbershop_id() OR public.is_owner_of(barbershop_id));

DROP POLICY IF EXISTS settings_read ON public.barbershop_settings;
CREATE POLICY settings_read ON public.barbershop_settings
  FOR SELECT TO authenticated
  USING (barbershop_id = public.current_barbershop_id() OR public.is_owner_of(barbershop_id));

DROP POLICY IF EXISTS availability_read ON public.availability;
CREATE POLICY availability_read ON public.availability
  FOR SELECT TO authenticated
  USING (barbershop_id = public.current_barbershop_id() OR public.is_owner_of(barbershop_id));

DROP POLICY IF EXISTS time_blocks_read ON public.time_blocks;
CREATE POLICY time_blocks_read ON public.time_blocks
  FOR SELECT TO authenticated
  USING (barbershop_id = public.current_barbershop_id() OR public.is_owner_of(barbershop_id));

-- 3. Escritura: antes usaban has_role() sin filtrar por tenant
DROP POLICY IF EXISTS barbershops_admin_write ON public.barbershops;
CREATE POLICY barbershops_admin_write ON public.barbershops
  FOR ALL TO authenticated
  USING (public.is_owner_of(id))
  WITH CHECK (public.is_owner_of(id));

DROP POLICY IF EXISTS services_admin_write ON public.services;
CREATE POLICY services_admin_write ON public.services
  FOR ALL TO authenticated
  USING (public.is_owner_of(barbershop_id))
  WITH CHECK (public.is_owner_of(barbershop_id));

DROP POLICY IF EXISTS settings_admin_write ON public.barbershop_settings;
CREATE POLICY settings_admin_write ON public.barbershop_settings
  FOR ALL TO authenticated
  USING (public.is_owner_of(barbershop_id))
  WITH CHECK (public.is_owner_of(barbershop_id));

DROP POLICY IF EXISTS availability_admin_write ON public.availability;
CREATE POLICY availability_admin_write ON public.availability
  FOR ALL TO authenticated
  USING (public.is_owner_of(barbershop_id))
  WITH CHECK (public.is_owner_of(barbershop_id));

DROP POLICY IF EXISTS time_blocks_admin_write ON public.time_blocks;
CREATE POLICY time_blocks_admin_write ON public.time_blocks
  FOR ALL TO authenticated
  USING (public.is_owner_of(barbershop_id))
  WITH CHECK (public.is_owner_of(barbershop_id));

-- 4. Appointments: la tabla más sensible, no estaba tocada
DROP POLICY IF EXISTS appointments_select_own_or_admin ON public.appointments;
CREATE POLICY appointments_select_own_or_admin ON public.appointments
  FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR public.is_owner_of(barbershop_id));

DROP POLICY IF EXISTS appointments_insert_own ON public.appointments;
CREATE POLICY appointments_insert_own ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid() OR public.is_owner_of(barbershop_id));

DROP POLICY IF EXISTS appointments_update_own_or_admin ON public.appointments;
CREATE POLICY appointments_update_own_or_admin ON public.appointments
  FOR UPDATE TO authenticated
  USING (client_id = auth.uid() OR public.is_owner_of(barbershop_id))
  WITH CHECK (client_id = auth.uid() OR public.is_owner_of(barbershop_id));

DROP POLICY IF EXISTS appointments_delete_admin ON public.appointments;
CREATE POLICY appointments_delete_admin ON public.appointments
  FOR DELETE TO authenticated
  USING (public.is_owner_of(barbershop_id));

-- 5. Profiles: también sensible, tampoco estaba tocada
DROP POLICY IF EXISTS profiles_select_own_or_admin ON public.profiles;
CREATE POLICY profiles_select_own_or_admin ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_owner_of(barbershop_id));

DROP POLICY IF EXISTS profiles_update_own_or_admin ON public.profiles;
CREATE POLICY profiles_update_own_or_admin ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_owner_of(barbershop_id))
  WITH CHECK (id = auth.uid() OR public.is_owner_of(barbershop_id));

-- 6. user_roles: un owner solo debe ver los roles de SU barbería, no de todas
DROP POLICY IF EXISTS user_roles_select_own_or_admin ON public.user_roles;
CREATE POLICY user_roles_select_own_or_admin ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_owner_of(barbershop_id));