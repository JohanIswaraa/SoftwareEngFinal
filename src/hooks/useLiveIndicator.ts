import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LiveIndicatorState {
  lastUpdated?: Date;
  affectedTables: Set<string>;
}

export const useLiveIndicator = () => {
  const [state, setState] = useState<LiveIndicatorState>({
    affectedTables: new Set(),
  });
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const notifyUpdate = useCallback((tableName: string) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce updates to avoid too many UI pings
    debounceTimerRef.current = setTimeout(() => {
      setState((prev) => ({
        lastUpdated: new Date(),
        affectedTables: new Set([...prev.affectedTables, tableName]),
      }));

      // Clear affected tables after showing indicator
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          affectedTables: new Set(),
        }));
      }, 3000);
    }, 300);
  }, []);

  useEffect(() => {
    // Subscribe to internships changes
    const internshipsChannel = supabase
      .channel('internships-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'internships',
        },
        () => {
          notifyUpdate('internships');
        }
      )
      .subscribe();

    // Subscribe to user interactions changes
    const interactionsChannel = supabase
      .channel('interactions-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_internship_interactions',
        },
        () => {
          notifyUpdate('user_internship_interactions');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(internshipsChannel);
      supabase.removeChannel(interactionsChannel);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [notifyUpdate]);

  return {
    lastUpdated: state.lastUpdated,
    isTableAffected: (tableName: string) => state.affectedTables.has(tableName),
  };
};
