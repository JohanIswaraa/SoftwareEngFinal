import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useStudentCount = () => {
  const [studentCount, setStudentCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudentCount = async () => {
    try {
      // Count distinct students from user_roles table
      const { count, error } = await supabase
        .from('user_roles')
        .select('user_id', { count: 'exact', head: true })
        .eq('role', 'student');

      if (error) throw error;
      setStudentCount(count || 0);
    } catch (error) {
      console.error('Error fetching student count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentCount();

    // Subscribe to realtime updates on user_roles table
    const channel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: 'role=eq.student'
        },
        () => {
          fetchStudentCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { studentCount, isLoading };
};
