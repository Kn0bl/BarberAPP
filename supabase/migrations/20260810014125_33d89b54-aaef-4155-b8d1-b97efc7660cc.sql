UPDATE public.barbershop_settings SET cancellation_window_hours = 2;
ALTER TABLE public.barbershop_settings ALTER COLUMN cancellation_window_hours SET DEFAULT 2;