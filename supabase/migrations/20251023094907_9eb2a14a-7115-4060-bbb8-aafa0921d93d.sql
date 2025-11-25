-- Add RLS policies for OTP tables (no direct access needed by users)
-- Only backend Edge Functions should access these tables

-- Drop all existing policies if any
DROP POLICY IF EXISTS "No direct access to OTP verifications" ON public.otp_verifications;
DROP POLICY IF EXISTS "No direct access to rate limits" ON public.otp_rate_limits;

-- Create restrictive policies (backend only via service role)
CREATE POLICY "No direct access to OTP verifications"
  ON public.otp_verifications
  FOR ALL
  USING (false);

CREATE POLICY "No direct access to rate limits"
  ON public.otp_rate_limits
  FOR ALL
  USING (false);