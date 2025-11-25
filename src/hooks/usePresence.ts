import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Generate a persistent session ID for anonymous users
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('presence_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('presence_session_id', sessionId);
  }
  return sessionId;
};

export const usePresence = () => {
  const [activeUsers, setActiveUsers] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    // Use user ID if authenticated, otherwise use session ID
    const presenceKey = user?.id || getSessionId();

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: presenceKey,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setActiveUsers(Object.keys(state).length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user?.id || null,
            session_id: presenceKey,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Send heartbeat every 30 seconds
    const heartbeatInterval = setInterval(async () => {
      if (channel.state === 'joined') {
        await channel.track({
          user_id: user?.id || null,
          session_id: presenceKey,
          online_at: new Date().toISOString(),
        });
      }
    }, 30000);

    return () => {
      clearInterval(heartbeatInterval);
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { activeUsers };
};
