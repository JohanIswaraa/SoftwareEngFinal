-- Fix storage RLS policies for avatar uploads
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;

-- Create comprehensive RLS policies for avatars in internship-images bucket
CREATE POLICY "Users can upload own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'internship-images' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can read own avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'internship-images'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'internship-images'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'internship-images'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow public read access to all avatar images for profile display
CREATE POLICY "Public avatar read access"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'internship-images'
  AND (storage.foldername(name))[1] = 'avatars'
);