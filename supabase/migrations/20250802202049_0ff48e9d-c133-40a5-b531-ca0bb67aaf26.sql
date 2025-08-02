-- Fix remaining functions by setting search_path
CREATE OR REPLACE FUNCTION public.seed_initial_categories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  -- Function body is empty since we've already inserted the initial categories
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_contents_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  -- Function body is empty since we've already created the table
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_categories_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  -- Function body is empty since we've already created the table
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_category_contents_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  -- Function body is empty since we've already created the table
  RETURN;
END;
$function$;