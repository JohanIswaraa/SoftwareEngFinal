-- Create storage bucket for internship images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'internship-images',
  'internship-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policies for internship images
CREATE POLICY "Public can view internship images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'internship-images');

CREATE POLICY "Admins can upload internship images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'internship-images' 
  AND auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update internship images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'internship-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete internship images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'internship-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Add realtime support for internships and interactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.internships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_internship_interactions;