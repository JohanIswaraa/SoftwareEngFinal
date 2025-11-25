-- Create activity_logs table for tracking all user interactions
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  event TEXT NOT NULL CHECK (event IN ('view', 'apply')),
  method TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_logs
CREATE POLICY "Users can insert their own activity logs"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_internship_id ON public.activity_logs(internship_id);
CREATE INDEX idx_activity_logs_event ON public.activity_logs(event);
CREATE INDEX idx_activity_logs_user_event ON public.activity_logs(user_id, event);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;