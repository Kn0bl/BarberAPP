CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_no_overlap
  EXCLUDE USING gist (
    barbershop_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  )
  WHERE (status <> 'cancelled');