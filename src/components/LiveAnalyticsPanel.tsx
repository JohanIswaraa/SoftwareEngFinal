import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, MousePointer, Eye, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePresence } from '@/hooks/usePresence';

interface ActivityEvent {
  id: string;
  type: 'apply' | 'view' | 'copy_email';
  internship_title: string;
  timestamp: Date;
}

export const LiveAnalyticsPanel: React.FC = () => {
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);
  const { activeUsers } = usePresence();
  const [activityCounts, setActivityCounts] = useState({
    applies: 0,
    views: 0,
  });
  const [viewsActivity, setViewsActivity] = useState<ActivityEvent[]>([]);
  const [appliesActivity, setAppliesActivity] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    // Subscribe to real-time changes in internships table
    const channel = supabase
      .channel('analytics-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'internships'
        },
        (payload) => {
          const oldRecord = payload.old as any;
          const newRecord = payload.new as any;

          // Check if views increased
          if (newRecord.views > oldRecord.views) {
            const event = {
              id: `view-${Date.now()}`,
              type: 'view' as const,
              internship_title: newRecord.title,
              timestamp: new Date(),
            };
            addActivity(event);
            setViewsActivity(prev => [event, ...prev].slice(0, 3));
            setActivityCounts(prev => ({ ...prev, views: prev.views + 1 }));
          }

          // Check if apply_clicks increased (includes both applies and email copies)
          if (newRecord.apply_clicks > oldRecord.apply_clicks) {
            const event = {
              id: `apply-${Date.now()}-${Math.random()}`,
              type: 'apply' as const,
              internship_title: newRecord.title,
              timestamp: new Date(),
            };
            addActivity(event);
            setAppliesActivity(prev => [event, ...prev].slice(0, 3));
            setActivityCounts(prev => ({ ...prev, applies: prev.applies + 1 }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addActivity = (event: ActivityEvent) => {
    setRecentActivity(prev => [event, ...prev].slice(0, 10));
  };

  const getActivityIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'apply':
        return <MousePointer className="h-3.5 w-3.5 text-green-500" />;
      case 'view':
        return <Eye className="h-3.5 w-3.5 text-blue-500" />;
      case 'copy_email':
        return <MousePointer className="h-3.5 w-3.5 text-green-500" />;
    }
  };

  const getActivityText = (event: ActivityEvent) => {
    switch (event.type) {
      case 'apply':
        return `Applied to ${event.internship_title}`;
      case 'view':
        return `Viewed ${event.internship_title}`;
      case 'copy_email':
        return `Applied to ${event.internship_title}`;
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">Live Analytics</CardTitle>
        <Activity className="h-5 w-5 text-muted-foreground animate-pulse" />
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Active Users */}
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-foreground">Active Users</span>
          </div>
          <span className="text-2xl font-bold text-primary">{activeUsers}</span>
        </div>

        {/* Activity Summary */}
        <div className="grid grid-cols-2 gap-3">
          {/* Views */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-muted-foreground">Views</div>
              <div className="text-xl font-bold text-blue-600">{activityCounts.views}</div>
            </div>
            <div className="space-y-1.5">
              {viewsActivity.length === 0 ? (
                <p className="text-[10px] text-muted-foreground/60 italic">No recent views</p>
              ) : (
                viewsActivity.map((event) => (
                  <div key={event.id} className="text-[10px] text-muted-foreground">
                    <p className="truncate">{event.internship_title}</p>
                    <p className="text-[9px] opacity-70">{getTimeAgo(event.timestamp)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Applies (merged with copies) */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-muted-foreground">Applies</div>
              <div className="text-xl font-bold text-green-600">{activityCounts.applies}</div>
            </div>
            <div className="space-y-1.5">
              {appliesActivity.length === 0 ? (
                <p className="text-[10px] text-muted-foreground/60 italic">No recent applies</p>
              ) : (
                appliesActivity.map((event) => (
                  <div key={event.id} className="text-[10px] text-muted-foreground">
                    <p className="truncate">{event.internship_title}</p>
                    <p className="text-[9px] opacity-70">{getTimeAgo(event.timestamp)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Recent Activity</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Waiting for activity...
              </p>
            ) : (
              recentActivity.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-2 p-2 bg-muted/30 rounded text-xs animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  {getActivityIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate">{getActivityText(event)}</p>
                    <p className="text-muted-foreground text-[10px]">{getTimeAgo(event.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};