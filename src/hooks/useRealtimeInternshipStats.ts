import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toZonedTime } from 'date-fns-tz';

const JAKARTA_TZ = 'Asia/Jakarta';

interface InternshipStats {
  [internshipId: string]: {
    views: number;
    applies: number;
  };
}

const getTodayBounds = () => {
  const now = new Date();
  const jakartaNow = toZonedTime(now, JAKARTA_TZ);
  
  const startOfDay = new Date(jakartaNow);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(jakartaNow);
  endOfDay.setHours(23, 59, 59, 999);
  
  return {
    start: startOfDay.toISOString(),
    end: endOfDay.toISOString(),
  };
};

export const useRealtimeInternshipStats = () => {
  const [stats, setStats] = useState<InternshipStats>({});

  const fetchStats = async () => {
    try {
      const { start, end } = getTodayBounds();

      // Fetch today's views and applies per internship
      const { data: activities, error } = await supabase
        .from('activity_logs')
        .select('internship_id, event')
        .gte('created_at', start)
        .lte('created_at', end);

      if (error) throw error;

      // Aggregate by internship
      const newStats: InternshipStats = {};
      activities?.forEach((activity) => {
        const id = activity.internship_id;
        if (!newStats[id]) {
          newStats[id] = { views: 0, applies: 0 };
        }
        if (activity.event === 'view') {
          newStats[id].views++;
        } else if (activity.event === 'apply') {
          newStats[id].applies++;
        }
      });

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching realtime stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('internship-stats-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
        },
        () => {
          fetchStats();
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
      fetchStats();
      setInterval(fetchStats, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);

    return () => {
      clearTimeout(midnightTimeout);
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats };
};
