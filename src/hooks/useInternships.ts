import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Internship } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useInternshipsData = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchInternships = async () => {
    try {
      const { data, error } = await supabase
        .from('internships')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedInternships: Internship[] = data.map(item => ({
        id: item.id,
        title: item.title,
        company: item.company,
        location: item.location,
        duration: item.duration,
        description: item.description,
        major: item.major,
        industry: item.industry,
        views: item.views,
        applyClicks: item.apply_clicks,
        applicationMethod: item.application_method as 'external' | 'email',
        applicationValue: item.application_value,
        imageUrl: item.image_url || undefined,
        expiresAt: item.expires_at ? new Date(item.expires_at) : undefined,
        listingDuration: item.listing_duration || undefined,
        createdAt: new Date(item.created_at),
      }));

      setInternships(mappedInternships);
    } catch (error: any) {
      console.error('Error fetching internships:', error);
      toast({
        title: 'Error',
        description: 'Failed to load internships',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();

    // Set up realtime subscription
    const channel = supabase
      .channel('internships-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'internships'
        },
        (payload) => {
          console.log('Internship change detected:', payload);
          // Immediately refetch to get latest data
          fetchInternships();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addInternship = async (
    internshipData: Omit<Internship, 'id' | 'views' | 'applyClicks' | 'isStarred' | 'isViewed'>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('internships').insert({
        title: internshipData.title,
        company: internshipData.company,
        location: internshipData.location,
        duration: internshipData.duration,
        description: internshipData.description,
        major: internshipData.major,
        industry: internshipData.industry,
        application_method: internshipData.applicationMethod,
        application_value: internshipData.applicationValue,
        image_url: internshipData.imageUrl,
        expires_at: internshipData.expiresAt?.toISOString(),
        listing_duration: internshipData.listingDuration,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Internship created successfully',
      });
    } catch (error: any) {
      console.error('Error adding internship:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create internship',
        variant: 'destructive',
      });
    }
  };

  const updateInternship = async (id: string, updates: Partial<Internship>) => {
    try {
      const { error } = await supabase
        .from('internships')
        .update({
          title: updates.title,
          company: updates.company,
          location: updates.location,
          duration: updates.duration,
          description: updates.description,
          major: updates.major,
          industry: updates.industry,
          application_method: updates.applicationMethod,
          application_value: updates.applicationValue,
          image_url: updates.imageUrl,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Internship updated successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating internship:', error);
      toast({
        title: 'Error',
        description: 'Failed to update internship',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Debounce tracker for views
  const viewDebounce = new Map<string, number>();
  
  const incrementViews = async (id: string) => {
    try {
      // Debounce: prevent duplicate increments within 2 seconds
      const now = Date.now();
      const lastView = viewDebounce.get(id);
      if (lastView && now - lastView < 2000) {
        return;
      }
      viewDebounce.set(id, now);

      const internship = internships.find(i => i.id === id);
      if (internship) {
        await supabase
          .from('internships')
          .update({ views: internship.views + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  // Debounce tracker for apply clicks
  const clickDebounce = new Map<string, number>();

  const incrementApplyClicks = async (id: string) => {
    try {
      // Debounce: prevent duplicate increments within 2 seconds
      const now = Date.now();
      const lastClick = clickDebounce.get(id);
      if (lastClick && now - lastClick < 2000) {
        return;
      }
      clickDebounce.set(id, now);

      const internship = internships.find(i => i.id === id);
      if (internship) {
        await supabase
          .from('internships')
          .update({ apply_clicks: internship.applyClicks + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error incrementing apply clicks:', error);
    }
  };

  const deleteInternship = async (id: string, permanent: boolean = false) => {
    try {
      if (permanent) {
        // Permanent delete
        const { error } = await supabase
          .from('internships')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Internship permanently deleted',
        });
      } else {
        // Soft delete
        const { error } = await supabase
          .from('internships')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Internship archived successfully',
        });
      }
      
      return true;
    } catch (error: any) {
      console.error('Error deleting internship:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete internship',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    internships,
    isLoading,
    addInternship,
    updateInternship,
    incrementViews,
    incrementApplyClicks,
    deleteInternship,
    refetch: fetchInternships,
  };
};