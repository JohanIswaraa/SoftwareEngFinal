-- Fix profiles RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Ensure profiles table has avatar_url column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Fix storage policies for internship-images bucket
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to internship-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read internship images" ON storage.objects;

-- Create secure storage policies
CREATE POLICY "Authenticated users can upload to internship-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'internship-images');

CREATE POLICY "Users can update their own content"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'internship-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own content"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'internship-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read access for internship-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'internship-images');

-- Create validation function for internship data
CREATE OR REPLACE FUNCTION public.validate_internship_data(
  p_title text,
  p_company text,
  p_location text,
  p_description text,
  p_application_value text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate title
  IF p_title IS NULL OR length(trim(p_title)) < 1 OR length(p_title) > 200 THEN
    RAISE EXCEPTION 'Title must be between 1 and 200 characters';
  END IF;
  
  -- Validate company
  IF p_company IS NULL OR length(trim(p_company)) < 1 OR length(p_company) > 200 THEN
    RAISE EXCEPTION 'Company must be between 1 and 200 characters';
  END IF;
  
  -- Validate location
  IF p_location IS NULL OR length(trim(p_location)) < 1 OR length(p_location) > 200 THEN
    RAISE EXCEPTION 'Location must be between 1 and 200 characters';
  END IF;
  
  -- Validate description
  IF p_description IS NULL OR length(trim(p_description)) < 10 OR length(p_description) > 5000 THEN
    RAISE EXCEPTION 'Description must be between 10 and 5000 characters';
  END IF;
  
  -- Validate application value (email or URL)
  IF p_application_value IS NULL OR length(trim(p_application_value)) < 1 THEN
    RAISE EXCEPTION 'Application value is required';
  END IF;
  
  RETURN true;
END;
$$;

-- Add trigger for validation on internship inserts/updates
CREATE OR REPLACE FUNCTION public.validate_internship_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.validate_internship_data(
    NEW.title,
    NEW.company,
    NEW.location,
    NEW.description,
    NEW.application_value
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_internship_before_insert ON public.internships;
CREATE TRIGGER validate_internship_before_insert
BEFORE INSERT ON public.internships
FOR EACH ROW
EXECUTE FUNCTION public.validate_internship_trigger();

DROP TRIGGER IF EXISTS validate_internship_before_update ON public.internships;
CREATE TRIGGER validate_internship_before_update
BEFORE UPDATE ON public.internships
FOR EACH ROW
EXECUTE FUNCTION public.validate_internship_trigger();