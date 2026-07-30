-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'client');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');

-- UPDATED_AT HELPER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- BARBERSHOPS (multi-tenant ready)
CREATE TABLE public.barbershops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  phone text,
  email text,
  address text,
  timezone text NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  logo_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.barbershops TO authenticated;
GRANT ALL ON public.barbershops TO service_role;
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  barbershop_id uuid REFERENCES public.barbershops(id) ON DELETE SET NULL,
  full_name text NOT NULL DEFAULT '',
  phone text,
  email text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  barbershop_id uuid REFERENCES public.barbershops(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'client',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, barbershop_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- SERVICES
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id uuid NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 30,
  price_cents integer NOT NULL DEFAULT 0,
  color text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- APPOINTMENTS
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id uuid NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  price_cents integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX appointments_shop_start_idx ON public.appointments (barbershop_id, starts_at);
CREATE INDEX appointments_client_idx ON public.appointments (client_id, starts_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- SETTINGS
CREATE TABLE public.barbershop_settings (
  barbershop_id uuid PRIMARY KEY REFERENCES public.barbershops(id) ON DELETE CASCADE,
  slot_interval_minutes integer NOT NULL DEFAULT 30,
  booking_window_days integer NOT NULL DEFAULT 30,
  min_notice_minutes integer NOT NULL DEFAULT 60,
  cancellation_window_hours integer NOT NULL DEFAULT 12,
  currency text NOT NULL DEFAULT 'ARS',
  auto_confirm boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.barbershop_settings TO authenticated;
GRANT ALL ON public.barbershop_settings TO service_role;
ALTER TABLE public.barbershop_settings ENABLE ROW LEVEL SECURITY;

-- AVAILABILITY
CREATE TABLE public.availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id uuid NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  weekday smallint NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT availability_weekday_range CHECK (weekday BETWEEN 0 AND 6),
  CONSTRAINT availability_time_order CHECK (end_time > start_time)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability TO authenticated;
GRANT ALL ON public.availability TO service_role;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- TIME BLOCKS
CREATE TABLE public.time_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id uuid NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT time_blocks_range CHECK (ends_at > starts_at)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_blocks TO authenticated;
GRANT ALL ON public.time_blocks TO service_role;
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "barbershops_read" ON public.barbershops FOR SELECT TO authenticated USING (true);
CREATE POLICY "barbershops_admin_write" ON public.barbershops FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "services_read" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "services_admin_write" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "appointments_select_own_or_admin" ON public.appointments FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "appointments_insert_own" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "appointments_update_own_or_admin" ON public.appointments FOR UPDATE TO authenticated
  USING (client_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (client_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "appointments_delete_admin" ON public.appointments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "settings_read" ON public.barbershop_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_admin_write" ON public.barbershop_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "availability_read" ON public.availability FOR SELECT TO authenticated USING (true);
CREATE POLICY "availability_admin_write" ON public.availability FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "time_blocks_read" ON public.time_blocks FOR SELECT TO authenticated USING (true);
CREATE POLICY "time_blocks_admin_write" ON public.time_blocks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- TRIGGERS
CREATE TRIGGER barbershops_updated_at BEFORE UPDATE ON public.barbershops FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON public.barbershop_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER availability_updated_at BEFORE UPDATE ON public.availability FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER time_blocks_updated_at BEFORE UPDATE ON public.time_blocks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- NEW USER HANDLER: profile + default client role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_shop uuid;
BEGIN
  SELECT id INTO default_shop FROM public.barbershops ORDER BY created_at LIMIT 1;

  INSERT INTO public.profiles (id, barbershop_id, full_name, phone, email)
  VALUES (
    NEW.id,
    default_shop,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, barbershop_id, role)
  VALUES (NEW.id, default_shop, 'client')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SEED: single barbershop + defaults
INSERT INTO public.barbershops (id, name, slug, phone, email, address)
VALUES ('11111111-1111-1111-1111-111111111111', 'Barbería Central', 'barberia-central', '+54 11 5555-5555', 'hola@barberiacentral.com', 'Av. Siempre Viva 742');

INSERT INTO public.barbershop_settings (barbershop_id) VALUES ('11111111-1111-1111-1111-111111111111');

INSERT INTO public.availability (barbershop_id, weekday, start_time, end_time) VALUES
  ('11111111-1111-1111-1111-111111111111', 1, '09:00', '19:00'),
  ('11111111-1111-1111-1111-111111111111', 2, '09:00', '19:00'),
  ('11111111-1111-1111-1111-111111111111', 3, '09:00', '19:00'),
  ('11111111-1111-1111-1111-111111111111', 4, '09:00', '19:00'),
  ('11111111-1111-1111-1111-111111111111', 5, '09:00', '20:00'),
  ('11111111-1111-1111-1111-111111111111', 6, '10:00', '16:00');

INSERT INTO public.services (barbershop_id, name, description, duration_minutes, price_cents, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Corte clásico', 'Corte a tijera y máquina con acabado prolijo.', 30, 800000, 1),
  ('11111111-1111-1111-1111-111111111111', 'Corte + Barba', 'Corte completo más perfilado y arreglo de barba.', 45, 1200000, 2),
  ('11111111-1111-1111-1111-111111111111', 'Arreglo de barba', 'Perfilado, navaja y toalla caliente.', 20, 500000, 3);