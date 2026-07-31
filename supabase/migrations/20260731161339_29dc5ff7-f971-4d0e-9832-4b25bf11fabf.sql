DELETE FROM public.appointments WHERE client_name = 'Test Cliente';
DELETE FROM public.time_blocks WHERE reason IS NULL AND created_at > now() - interval '1 hour';