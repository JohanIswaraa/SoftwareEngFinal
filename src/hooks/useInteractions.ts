import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Interaction {
  internship_id: string;
  is_starred: boolean;
  is_viewed: boolean;
}

export const useInteractions = () => {
  const [interactions, setInteractions] = useState<Map<string, Interaction>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchInteractions = async () => {
    if (!user) {
      setInteractions(new Map());
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_internship_interactions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const interactionMap = new Map<string, Interaction>();
      data?.forEach(item => {
        interactionMap.set(item.internship_id, {
          internship_id: item.internship_id,
          is_starred: item.is_starred,
          is_viewed: item.is_viewed,
        });
      });

      setInteractions(interactionMap);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInteractions();

    if (user) {
      // Set up realtime subscription
      const channel = supabase
        .channel('interactions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_internship_interactions',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Interaction change detected:', payload);
            // Immediately refetch to get latest data
            fetchInteractions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const toggleStar = async (internshipId: string) => {
    if (!user) return;

    try {
      const existing = interactions.get(internshipId);
      
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('user_internship_interactions')
          .update({ is_starred: !existing.is_starred })
          .eq('user_id', user.id)
          .eq('internship_id', internshipId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('user_internship_interactions')
          .insert({
            user_id: user.id,
            internship_id: internshipId,
            is_starred: true,
            is_viewed: false,
          });

        if (error) throw error;
      }

      await fetchInteractions();
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const markAsViewed = async (internshipId: string) => {
    if (!user) return;

    try {
      const existing = interactions.get(internshipId);
      
      if (existing && existing.is_viewed) {
        return; // Already marked as viewed
      }

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('user_internship_interactions')
          .update({ is_viewed: true })
          .eq('user_id', user.id)
          .eq('internship_id', internshipId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('user_internship_interactions')
          .insert({
            user_id: user.id,
            internship_id: internshipId,
            is_starred: false,
            is_viewed: true,
          });

        if (error) throw error;
      }

      await fetchInteractions();
    } catch (error) {
      console.error('Error marking as viewed:', error);
    }
  };

  return {
    interactions,
    isLoading,
    toggleStar,
    markAsViewed,
    isStarred: (internshipId: string) => interactions.get(internshipId)?.is_starred || false,
    isViewed: (internshipId: string) => interactions.get(internshipId)?.is_viewed || false,
  };
};