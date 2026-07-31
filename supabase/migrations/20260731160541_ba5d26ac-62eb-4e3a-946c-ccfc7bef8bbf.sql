-- Método de pago para turnos manuales
DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('cash','transfer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.appointments
  ALTER COLUMN client_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS client_name text,
  ADD COLUMN IF NOT EXISTS client_phone text,
  ADD COLUMN IF NOT EXISTS payment_method public.payment_method NOT NULL DEFAULT 'cash';

-- Un turno debe identificar al cliente por cuenta o por nombre manual
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_client_identity_check;
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_client_identity_check
  CHECK (client_id IS NOT NULL OR (client_name IS NOT NULL AND length(btrim(client_name)) > 0));

-- Políticas: contemplar turnos manuales sin cuenta (client_id nulo)
DROP POLICY IF EXISTS appointments_insert_own ON public.appointments;
CREATE POLICY appointments_insert_own ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK ((client_id = auth.uid()) OR public.has_role(auth.uid(), 'owner'::app_role));

DROP POLICY IF EXISTS appointments_select_own_or_admin ON public.appointments;
CREATE POLICY appointments_select_own_or_admin ON public.appointments
  FOR SELECT TO authenticated
  USING ((client_id = auth.uid()) OR public.has_role(auth.uid(), 'owner'::app_role));

-- Servicios iniciales de la barbería
INSERT INTO public.services (barbershop_id, name, duration_minutes, price_cents, sort_order)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Corte común', 30, 800000, 1),
  ('11111111-1111-1111-1111-111111111111', 'Corte + barba', 30, 1100000, 2),
  ('11111111-1111-1111-1111-111111111111', 'Barba', 30, 500000, 3),
  ('11111111-1111-1111-1111-111111111111', 'Corte con color', 30, 1500000, 4);