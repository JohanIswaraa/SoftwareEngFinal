-- Allow admins to delete activity logs
CREATE POLICY "Admins can delete activity logs"
ON activity_logs
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()::text
    AND user_roles.role = 'admin'::app_role
  )
);