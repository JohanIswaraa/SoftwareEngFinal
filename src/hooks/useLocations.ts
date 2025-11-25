import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useLocations = () => {
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      // Fetch distinct locations from active internships
      const { data, error } = await supabase
        .from('internships')
        .select('location')
        .is('deleted_at', null)
        .order('location');

      if (error) throw error;

      // Extract unique locations
      const uniqueLocations = [...new Set(data?.map(item => item.location) || [])];
      setLocations(uniqueLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('locations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'internships'
        },
        () => {
          fetchLocations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { locations, isLoading };
};
