import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useThrottledAction } from './useThrottledAction';

interface TrackActivityParams {
  internshipId: string;
  event: 'apply';
  method?: 'external_link' | 'copied_email';
}

export const useActivityTracking = () => {
  const { user } = useAuth();
  const { throttle } = useThrottledAction({ delay: 3000 }); // 3 second throttle

  const trackActivity = async ({ internshipId, event, method }: TrackActivityParams) => {
    try {
      // Insert into activity_logs
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user?.id || null,
          internship_id: internshipId,
          event,
          method,
          metadata: {},
        });

      if (error) {
        console.error('Error tracking activity:', error);
        return;
      }

      console.log(`Tracked ${event} for internship ${internshipId}`);
    } catch (error) {
      console.error('Error in trackActivity:', error);
    }
  };

  const trackApply = async (internshipId: string, method: 'external_link' | 'copied_email') => {
    // Use throttle to prevent duplicate clicks within 3 seconds
    throttle(internshipId, async () => {
      await trackActivity({ internshipId, event: 'apply', method });
    });
  };

  return {
    trackApply,
  };
};
