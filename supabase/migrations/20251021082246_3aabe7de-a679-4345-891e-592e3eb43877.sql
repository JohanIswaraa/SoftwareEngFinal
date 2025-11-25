-- Add functional index for location filtering performance
CREATE INDEX IF NOT EXISTS idx_internships_location_lower 
ON public.internships (lower(location));

-- Add deleted_at column for soft deletes
ALTER TABLE public.internships 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update existing RLS policies to exclude soft-deleted records
DROP POLICY IF EXISTS "Anyone can view internships" ON public.internships;

CREATE POLICY "Anyone can view active internships"
ON public.internships
FOR SELECT
USING (deleted_at IS NULL);

-- Add policy for admins to view all internships including deleted ones
CREATE POLICY "Admins can view all internships including deleted"
ON public.internships
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime updates for profiles table (for student count)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;