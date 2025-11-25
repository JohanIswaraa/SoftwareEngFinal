-- Create table for monthly application statistics
CREATE TABLE IF NOT EXISTS public.monthly_application_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  month integer NOT NULL,
  count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(year, month)
);

-- Enable RLS
ALTER TABLE public.monthly_application_stats ENABLE ROW LEVEL SECURITY;

-- Allow admins to read monthly stats
CREATE POLICY "Admins can view monthly stats"
  ON public.monthly_application_stats
  FOR SELECT
  USING (has_role(auth.uid()::text, 'admin'::app_role));

-- Function to increment monthly application count
CREATE OR REPLACE FUNCTION public.increment_monthly_application_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year integer;
  current_month integer;
BEGIN
  -- Only count 'apply' events
  IF NEW.event = 'apply' THEN
    -- Extract year and month from the created_at timestamp
    current_year := EXTRACT(YEAR FROM NEW.created_at);
    current_month := EXTRACT(MONTH FROM NEW.created_at);
    
    -- Insert or update the monthly count
    INSERT INTO public.monthly_application_stats (year, month, count)
    VALUES (current_year, current_month, 1)
    ON CONFLICT (year, month)
    DO UPDATE SET 
      count = monthly_application_stats.count + 1,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for activity_logs
DROP TRIGGER IF EXISTS increment_monthly_applications ON public.activity_logs;
CREATE TRIGGER increment_monthly_applications
  AFTER INSERT ON public.activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_monthly_application_count();