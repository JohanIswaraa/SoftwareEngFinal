import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  Briefcase, 
  MousePointer, 
  Plus, 
  Eye,
  Pencil,
  Trash2,
  Loader2
} from 'lucide-react';
import { Internship } from '@/types';
import { AddInternshipForm } from './AddInternshipForm';
import { DeleteInternshipDialog } from './DeleteInternshipDialog';
import { useInternshipsData } from '@/hooks/useInternships';
import { useStudentCount } from '@/hooks/useStudentCount';
import { LiveUpdateIndicator } from './LiveUpdateIndicator';
import { useLiveIndicator } from '@/hooks/useLiveIndicator';
import { AnalyticsSection } from './AnalyticsSection';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTodayAnalytics } from '@/hooks/useTodayAnalytics';
import { useRealtimeInternshipStats } from '@/hooks/useRealtimeInternshipStats';
import { useMonthlyApplications } from '@/hooks/useMonthlyApplications';

export const AdminDashboard: React.FC = () => {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const [deletingInternship, setDeletingInternship] = useState<Internship | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { addInternship, updateInternship, deleteInternship, internships } = useInternshipsData();
  const { studentCount } = useStudentCount();
  const { lastUpdated } = useLiveIndicator();
  const { todayData } = useTodayAnalytics();
  const { stats } = useRealtimeInternshipStats();
  const { monthlyCount } = useMonthlyApplications();
  const navigate = useNavigate();

  const handleAddInternship = async (internshipData: Omit<Internship, 'id' | 'views' | 'applyClicks' | 'isStarred' | 'isViewed'>) => {
    if (editingInternship) {
      await updateInternship(editingInternship.id, internshipData);
      setEditingInternship(null);
    } else {
      await addInternship(internshipData);
    }
    setIsAddFormOpen(false);
  };

  const handleEditInternship = (internship: Internship) => {
    setEditingInternship(internship);
    setIsAddFormOpen(true);
  };

  const handleViewStudentPortal = () => {
    setIsNavigating(true);
    sessionStorage.setItem('adminReturnPath', window.location.pathname);
    
    startTransition(() => {
      navigate('/?preview=student');
      setIsNavigating(false);
    });
  };

  const handleDeleteInternship = (internship: Internship) => {
    setDeletingInternship(internship);
  };

  const handleConfirmDelete = async (permanent: boolean) => {
    if (!deletingInternship) return;
    
    const success = await deleteInternship(deletingInternship.id, permanent);
    if (success) {
      setDeletingInternship(null);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-3">Admin Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Manage internship listings and monitor platform analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LiveUpdateIndicator lastUpdated={lastUpdated} />
            <Button 
              onClick={handleViewStudentPortal}
              disabled={isNavigating || isPending}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              {isNavigating || isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              View Student Portal
            </Button>
          </div>
        </div>
      </div>

      {/* Total Overview Cards - Centered */}
      <div className="flex justify-center mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Internships</CardTitle>
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold transition-all duration-500">{internships.length}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Active listings on platform
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications This Month</CardTitle>
              <MousePointer className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-primary transition-all duration-500">{monthlyCount}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Applications this month (persistent)
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold transition-all duration-500">{studentCount}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Registered users
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Section (Combined Live Analytics + Recent Activity) */}
      <div className="mb-10">
        <AnalyticsSection />
      </div>

      {/* Manage Listings */}
      <Card>
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Manage Listings</CardTitle>
            <Button 
              className="flex items-center gap-2"
              onClick={() => {
                setEditingInternship(null);
                setIsAddFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add New Internship
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {internships.length === 0 ? (
            <div className="text-center py-16 px-6 text-muted-foreground">
              <Briefcase className="h-16 w-16 mx-auto mb-6 opacity-40" />
              <p className="text-xl font-medium mb-3">No Internships Yet</p>
              <p className="text-sm">Click "Add New Internship" to create your first listing.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Company</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold text-center">Applicants</TableHead>
                    <TableHead className="font-semibold">Last Updated</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internships.map((internship) => {
                    const todayStats = stats[internship.id] || { views: 0, applies: 0 };
                    return (
                      <TableRow key={internship.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{internship.title}</TableCell>
                        <TableCell className="text-muted-foreground">{internship.company}</TableCell>
                        <TableCell className="text-muted-foreground">{internship.location}</TableCell>
                        <TableCell className="text-center tabular-nums text-primary font-medium">
                          {todayStats.applies}
                        </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {internship.createdAt ? format(internship.createdAt, 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditInternship(internship)}
                            className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInternship(internship)}
                            className="flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddInternshipForm
        isOpen={isAddFormOpen}
        onClose={() => {
          setIsAddFormOpen(false);
          setEditingInternship(null);
        }}
        onSubmit={handleAddInternship}
        editingInternship={editingInternship}
      />

      <DeleteInternshipDialog
        isOpen={!!deletingInternship}
        onClose={() => setDeletingInternship(null)}
        onConfirm={handleConfirmDelete}
        internshipTitle={deletingInternship?.title || ''}
      />
    </div>
  );
};