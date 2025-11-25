import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMonthlyApplications = () => {
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMonthlyCount = async () => {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

      const { data, error } = await supabase
        .from('monthly_application_stats')
        .select('count')
        .eq('year', currentYear)
        .eq('month', currentMonth)
        .maybeSingle();

      if (error) throw error;

      setMonthlyCount(data?.count || 0);
    } catch (error) {
      console.error('Error fetching monthly applications:', error);
      setMonthlyCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyCount();

    // Subscribe to real-time updates on activity_logs to refresh count
    const channel = supabase
      .channel('monthly-applications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: 'event=eq.apply',
        },
        () => {
          fetchMonthlyCount();
        }
      )
      .subscribe();

    // Refresh at the start of each month
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
    const timeUntilNextMonth = nextMonth.getTime() - now.getTime();
    
    const monthTimeout = setTimeout(() => {
      fetchMonthlyCount();
      // Set up monthly refresh
      setInterval(fetchMonthlyCount, 30 * 24 * 60 * 60 * 1000); // ~30 days
    }, timeUntilNextMonth);

    return () => {
      clearTimeout(monthTimeout);
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    monthlyCount,
    isLoading,
  };
};
