import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toZonedTime, format } from 'date-fns-tz';

interface TodayAnalytics {
  views: number;
  applies: number;
}

interface ActivityEvent {
  id: string;
  created_at: string;
  event: 'view' | 'apply';
  method?: string;
  user_id: string | null;
  internship?: {
    title: string;
    company: string;
  };
}

const JAKARTA_TZ = 'Asia/Jakarta';

const getTodayBounds = () => {
  const now = new Date();
  const jakartaNow = toZonedTime(now, JAKARTA_TZ);
  
  // Start of today in Jakarta
  const startOfDay = new Date(jakartaNow);
  startOfDay.setHours(0, 0, 0, 0);
  
  // End of today in Jakarta
  const endOfDay = new Date(jakartaNow);
  endOfDay.setHours(23, 59, 59, 999);
  
  return {
    start: startOfDay.toISOString(),
    end: endOfDay.toISOString(),
  };
};

export const useTodayAnalytics = () => {
  const [todayData, setTodayData] = useState<TodayAnalytics>({ views: 0, applies: 0 });
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTodayData = async () => {
    try {
      const { start, end } = getTodayBounds();

      // Fetch counts for today
      const { count: viewCount } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('event', 'view')
        .gte('created_at', start)
        .lte('created_at', end);

      const { count: applyCount } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('event', 'apply')
        .gte('created_at', start)
        .lte('created_at', end);

      setTodayData({
        views: viewCount || 0,
        applies: applyCount || 0,
      });

      // Fetch recent activity with internship details
      const { data: activities, error } = await supabase
        .from('activity_logs')
        .select(`
          id,
          created_at,
          event,
          method,
          user_id,
          internship:internships(title, company)
        `)
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setRecentActivity(activities as any || []);
    } catch (error) {
      console.error('Error fetching today analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('activity-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_logs',
        },
        (payload) => {
          console.log('Activity log change detected:', payload);
          fetchTodayData();
        }
      )
      .subscribe();

    // Refresh at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    const midnightTimeout = setTimeout(() => {
      fetchTodayData();
      // Set up daily refresh
      setInterval(fetchTodayData, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);

    return () => {
      clearTimeout(midnightTimeout);
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    todayData,
    recentActivity,
    isLoading,
  };
};
