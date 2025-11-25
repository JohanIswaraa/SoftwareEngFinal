import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, MousePointer, Copy, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ActivityLog {
  id: string;
  user_id: string;
  internship_id: string;
  is_viewed: boolean;
  is_starred: boolean;
  created_at: string;
  updated_at: string;
  internship: {
    title: string;
    company: string;
  };
  profile: {
    name: string;
  };
}

type FilterType = 'all' | 'views' | 'applies' | 'copies';

export const RecentActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  useEffect(() => {
    fetchActivities();
    setupRealtimeSubscription();
  }, [filter, page]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('user_internship_interactions')
        .select(`
          *,
          internship:internships!inner(title, company),
          profile:profiles!inner(name)
        `)
        .order('updated_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      const { data, error } = await query;

      if (error) throw error;

      setActivities(prev => page === 1 ? (data || []) : [...prev, ...(data || [])]);
      setHasMore((data || []).length === pageSize);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('activity-log-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_internship_interactions'
        },
        (payload) => {
          console.log('Activity change detected:', payload);
          // Refetch to get the latest data with joins
          if (page === 1) {
            fetchActivities();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getActivityIcon = (activity: ActivityLog) => {
    if (activity.is_viewed) {
      return <Eye className="h-4 w-4 text-blue-500" />;
    }
    return <MousePointer className="h-4 w-4 text-green-500" />;
  };

  const getActivityText = (activity: ActivityLog) => {
    const name = activity.profile?.name || 'Someone';
    const internship = activity.internship?.title || 'Unknown internship';
    
    if (activity.is_viewed) {
      return `${name} viewed "${internship}"`;
    }
    return `${name} interacted with "${internship}"`;
  };

  const getTimeText = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, h:mm a');
    } catch {
      return 'Recently';
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'views') return activity.is_viewed;
    if (filter === 'applies') return activity.is_starred; // Using starred as proxy for applies
    return false;
  });

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
        <Filter className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="views">Views</TabsTrigger>
            <TabsTrigger value="applies">Applies</TabsTrigger>
            <TabsTrigger value="copies">Copies</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {isLoading && activities.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Loading activities...
            </p>
          ) : filteredActivities.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No activities found
            </p>
          ) : (
            <>
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-0.5">
                    {getActivityIcon(activity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {getActivityText(activity)}
                    </p>
                    {activity.internship?.company && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        at {activity.internship.company}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {getTimeText(activity.updated_at)}
                    </p>
                  </div>
                  {activity.is_starred && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                      Starred
                    </Badge>
                  )}
                </div>
              ))}
              
              {hasMore && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
