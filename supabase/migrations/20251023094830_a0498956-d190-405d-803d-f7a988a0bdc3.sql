-- Create OTP verification table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp_code text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('signup', 'password_change')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified_at timestamp with time zone,
  attempts integer NOT NULL DEFAULT 0,
  CONSTRAINT otp_expires_check CHECK (expires_at > created_at)
);

-- Enable RLS on OTP table
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_email_purpose ON public.otp_verifications(email, purpose);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON public.otp_verifications(expires_at);

-- OTP rate limiting table
CREATE TABLE IF NOT EXISTS public.otp_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  attempt_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  locked_until timestamp with time zone
);

-- Enable RLS on rate limit table
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create index for rate limiting
CREATE INDEX IF NOT EXISTS idx_rate_limit_email ON public.otp_rate_limits(email);

-- Function to clean up expired OTPs (can be called by a cron job)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_verifications
  WHERE expires_at < now() - interval '1 hour';
  
  DELETE FROM public.otp_rate_limits
  WHERE window_start < now() - interval '1 day';
END;
$$;

-- Function to check if user has admin role (server-side)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = 'admin'
  )
$$;

-- Add whitelisted_email flag to profiles for grandfathered accounts
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whitelisted_email boolean DEFAULT false;

-- Whitelist existing accounts that don't match the domain requirement
UPDATE public.profiles
SET whitelisted_email = true
WHERE email NOT LIKE '%@my.sampoernauniversity.ac.id';

-- Make email immutable after creation via trigger
CREATE OR REPLACE FUNCTION public.prevent_email_change()
RETURNS trigger
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

-- Create trigger to prevent email changes
DROP TRIGGER IF EXISTS prevent_profile_email_change ON public.profiles;
CREATE TRIGGER prevent_profile_email_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_email_change();