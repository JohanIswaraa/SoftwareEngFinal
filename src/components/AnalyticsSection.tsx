import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MousePointerClick, Trash2, Filter, RotateCcw, Trash } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApplicationLogs } from '@/hooks/useApplicationLogs';
import { formatDistanceToNow } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const AnalyticsSection: React.FC = () => {
  const INDONESIA_TIMEZONE = 'Asia/Jakarta';

  // Get today's date in UTC+7 (Indonesia timezone)
  const getTodayInIndonesia = () => {
    const nowUTC = new Date();
    const nowIndonesia = toZonedTime(nowUTC, INDONESIA_TIMEZONE);
    return nowIndonesia;
  };

  const getTodayISODate = () => {
    const today = getTodayInIndonesia();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [jobTitleFilter, setJobTitleFilter] = useState('');
  const [usernameFilter, setUsernameFilter] = useState('');
  const [startDate, setStartDate] = useState(getTodayISODate());
  const [endDate, setEndDate] = useState(getTodayISODate());

  const { applications, totalApplies, isLoading, deleteLog, refetch } = useApplicationLogs({
    jobTitle: jobTitleFilter,
    username: usernameFilter,
    startDate: startDate,
    endDate: endDate,
  });

  const handleDeleteLog = async (logId: string) => {
    const success = await deleteLog(logId);
    if (success) {
      toast.success('Log deleted successfully');
    } else {
      toast.error('Failed to delete log');
    }
  };

  const handleResetFilters = () => {
    setJobTitleFilter('');
    setUsernameFilter('');
    setStartDate(getTodayISODate());
    setEndDate(getTodayISODate());
    toast.success('Filters reset');
  };

  const handleDeleteFilteredLogs = async () => {
    if (applications.length === 0) {
      toast.error('No logs to delete');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${applications.length} log(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const logIds = applications.map(log => log.id);
      
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .in('id', logIds);

      if (error) throw error;

      toast.success(`Successfully deleted ${logIds.length} log(s)`);
      
      // Refetch to update the list immediately
      await refetch();
    } catch (error) {
      console.error('Error deleting logs:', error);
      toast.error('Failed to delete logs');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Application Logs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Applies Counter */}
        <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-lg border border-secondary/10">
          <MousePointerClick className="h-5 w-5 text-secondary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">Total Applications</p>
            <p className="text-2xl font-bold text-foreground">{applications.length}</p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="space-y-4 p-5 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Filter Application Logs</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="flex items-center gap-2 h-8"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteFilteredLogs}
                disabled={applications.length === 0}
                className="flex items-center gap-2 h-8"
              >
                <Trash className="h-3.5 w-3.5" />
                Delete Logs ({applications.length})
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job-title-filter" className="text-xs font-medium text-muted-foreground">
                Job Title
              </Label>
              <Input
                id="job-title-filter"
                placeholder="Search by job title..."
                value={jobTitleFilter}
                onChange={(e) => setJobTitleFilter(e.target.value)}
                className="h-9"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username-filter" className="text-xs font-medium text-muted-foreground">
                Username
              </Label>
              <Input
                id="username-filter"
                placeholder="Search by username..."
                value={usernameFilter}
                onChange={(e) => setUsernameFilter(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date-filter" className="text-xs font-medium text-muted-foreground">
                Start Date
              </Label>
              <Input
                id="start-date-filter"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date-filter" className="text-xs font-medium text-muted-foreground">
                End Date
              </Label>
              <Input
                id="end-date-filter"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </div>

        {/* Application Logs */}
        <div className="space-y-3">
          <ScrollArea className="h-[500px] w-full pr-4">
            <div className="space-y-3">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">
                  Loading applications...
                </p>
              ) : applications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No applications found
                </p>
              ) : (
                applications.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <MousePointerClick className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm text-foreground font-medium break-words">
                        <span className="font-semibold">
                          {log.user_name || 'Anonymous'}
                        </span>{' '}
                        <span className="text-muted-foreground">applied to</span>{' '}
                        "{log.internship?.title}"
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLog(log.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
