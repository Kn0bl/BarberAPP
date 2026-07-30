ALTER TYPE public.app_role RENAME VALUE 'admin' TO 'owner';
ALTER TYPE public.app_role RENAME VALUE 'client' TO 'customer';

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  VALUES (NEW.id, default_shop, 'customer')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;