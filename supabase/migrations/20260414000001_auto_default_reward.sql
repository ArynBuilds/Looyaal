-- Auto-create a default "Bedava Kahve" reward when the cafe is created, so
-- /api/public/{slug}/reward/claim works without any reward configuration.
-- Every org gets a 10-stamp card + free coffee reward.

-- Owner sign-up (POST /api/setup) passes org_name in user metadata and gets an
-- organization, an owner row, the loyalty program and the default reward.
-- Staff accounts are created without org_name and are skipped here; the staff
-- API inserts their public.users row itself.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  org_name TEXT;
  org_slug TEXT;
  new_org_id UUID;
  program_id UUID;
BEGIN
  org_name := NEW.raw_user_meta_data ->> 'org_name';

  IF org_name IS NULL OR org_name = '' THEN
    RETURN NEW;
  END IF;

  org_slug := lower(regexp_replace(regexp_replace(org_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  IF org_slug = '' THEN
    org_slug := 'cafe';
  END IF;

  INSERT INTO public.organizations (name, slug, email)
  VALUES (org_name, org_slug, NEW.email)
  RETURNING id INTO new_org_id;

  INSERT INTO public.users (id, org_id, email, full_name, role)
  VALUES (
    NEW.id,
    new_org_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'owner'
  );

  INSERT INTO public.loyalty_programs (org_id, name, type, stamps_required)
  VALUES (new_org_id, 'Sadakat Kartı', 'stamp', 10)
  RETURNING id INTO program_id;

  INSERT INTO public.rewards (org_id, program_id, name, description, type, is_active)
  VALUES (new_org_id, program_id, 'Bedava Kahve', 'Sadakat kartın doldu! Kahvenin senden.', 'free_item', true);

  RETURN NEW;
END;
$function$;
