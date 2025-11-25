-- Ensure email cannot be changed after registration at database level
CREATE OR REPLACE FUNCTION public.prevent_email_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    RAISE EXCEPTION 'Email cannot be changed after registration';
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prevent_profile_email_change ON public.profiles;

-- Create trigger on profiles table
CREATE TRIGGER prevent_profile_email_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_email_change();