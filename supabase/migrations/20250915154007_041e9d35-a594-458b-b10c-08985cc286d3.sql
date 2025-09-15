-- Fix search path for existing functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.users WHERE auth_user_id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_ward()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT ward_id FROM public.users WHERE auth_user_id = auth.uid();
$function$;