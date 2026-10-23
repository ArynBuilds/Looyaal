-- Image upload buckets + RLS
-- org-assets:  <org_id>/logo.webp, <org_id>/banner.webp
-- menu-items:  <org_id>/<menu_item_id>.webp

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('org-assets', 'org-assets', true),
  ('menu-items', 'menu-items', true)
ON CONFLICT (id) DO NOTHING;

-- Run policies as storage admin (required on self-hosted where storage.objects is owned by supabase_storage_admin)
SET ROLE supabase_storage_admin;

-- Public read — PWA customers are anonymous
CREATE POLICY "Public read org-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'org-assets');

CREATE POLICY "Public read menu-items"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-items');

-- Authenticated write restricted to caller's org.
-- Path convention: first path segment is the org_id.
CREATE POLICY "Org owners write org-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'org-assets'
    AND (storage.foldername(name))[1] = get_user_org_id()::text
  );

CREATE POLICY "Org owners update org-assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'org-assets'
    AND (storage.foldername(name))[1] = get_user_org_id()::text
  );

CREATE POLICY "Org owners delete org-assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'org-assets'
    AND (storage.foldername(name))[1] = get_user_org_id()::text
  );

CREATE POLICY "Org owners write menu-items"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'menu-items'
    AND (storage.foldername(name))[1] = get_user_org_id()::text
  );

CREATE POLICY "Org owners update menu-items"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'menu-items'
    AND (storage.foldername(name))[1] = get_user_org_id()::text
  );

CREATE POLICY "Org owners delete menu-items"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'menu-items'
    AND (storage.foldername(name))[1] = get_user_org_id()::text
  );

RESET ROLE;
