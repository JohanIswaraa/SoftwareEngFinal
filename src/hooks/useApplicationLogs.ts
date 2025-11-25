import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toZonedTime } from 'date-fns-tz';

interface ApplicationLog {
  id: string;
  created_at: string;
  user_id: string | null;
  method: string | null;
  user_name: string | null;
  internship: {
    title: string;
    company: string;
  } | null;
}

interface FilterOptions {
  jobTitle?: string;
  username?: string;
  startDate?: string;
  endDate?: string;
}

export const useApplicationLogs = (filters?: FilterOptions) => {
  const [applications, setApplications] = useState<ApplicationLog[]>([]);
  const [totalApplies, setTotalApplies] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const INDONESIA_TIMEZONE = 'Asia/Jakarta';
      
      // Build query for logs
      let logsQuery = supabase
        .from('activity_logs')
        .select(`
          id,
          created_at,
          user_id,
          method,
          internship:internships(title, company)
        `)
        .eq('event', 'apply');

      // Apply date filters using UTC+7 timezone
      if (filters?.startDate) {
        // Parse the filter date as Indonesia time (UTC+7)
        // Create start of day in Indonesia timezone
        const [year, month, day] = filters.startDate.split('-').map(Number);
        const startOfDayIndonesia = new Date(year, month - 1, day, 0, 0, 0, 0);
        
        // Convert to UTC by subtracting 7 hours
        const startOfDayUTC = new Date(startOfDayIndonesia.getTime() - (7 * 60 * 60 * 1000));
        const startDateTime = startOfDayUTC.toISOString();
        logsQuery = logsQuery.gte('created_at', startDateTime);
      }
      
      if (filters?.endDate) {
        // Parse the filter date as Indonesia time (UTC+7)
        // Create end of day in Indonesia timezone
        const [year, month, day] = filters.endDate.split('-').map(Number);
        const endOfDayIndonesia = new Date(year, month - 1, day, 23, 59, 59, 999);
        
        // Convert to UTC by subtracting 7 hours
        const endOfDayUTC = new Date(endOfDayIndonesia.getTime() - (7 * 60 * 60 * 1000));
        const endDateTime = endOfDayUTC.toISOString();
        logsQuery = logsQuery.lte('created_at', endDateTime);
      }

      const { data: logs, error: logsError } = await logsQuery
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Fetch user names for all user_ids
      const userIds = logs
        ?.filter(log => log.user_id)
        .map(log => log.user_id) || [];

      const uniqueUserIds = [...new Set(userIds)];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', uniqueUserIds);

      if (profilesError) throw profilesError;

      // Create a map of user_id to name
      const userNameMap = new Map(
        profiles?.map(profile => [profile.id, profile.name]) || []
      );

      // Combine logs with user names
      let logsWithNames = logs?.map(log => ({
        ...log,
        user_name: log.user_id ? userNameMap.get(log.user_id) || 'Unknown User' : null,
      })) || [];

      // Apply client-side filters
      if (filters?.jobTitle) {
        const jobTitleLower = filters.jobTitle.toLowerCase();
        logsWithNames = logsWithNames.filter(log => 
          log.internship?.title?.toLowerCase().includes(jobTitleLower)
        );
      }

      if (filters?.username) {
        const usernameLower = filters.username.toLowerCase();
        logsWithNames = logsWithNames.filter(log => 
          log.user_name?.toLowerCase().includes(usernameLower)
        );
      }

      setApplications(logsWithNames as any);

      // Get total count of all applies (unfiltered)
      const { count, error: countError } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('event', 'apply');

      if (countError) throw countError;

      setTotalApplies(count || 0);
    } catch (error) {
      console.error('Error fetching application logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      // Refetch to ensure accurate data
      await fetchApplications();
      
      return true;
    } catch (error) {
      console.error('Error deleting log:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchApplications();

    // Subscribe to real-time updates for apply events
    const channel = supabase
      .channel('application-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: 'event=eq.apply',
        },
        (payload) => {
          console.log('New application detected:', payload);
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters?.jobTitle, filters?.username, filters?.startDate, filters?.endDate]);

  return {
    applications,
    totalApplies,
    isLoading,
    deleteLog,
    refetch: fetchApplications,
  };
};
