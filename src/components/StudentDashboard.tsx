import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { FilterSidebar } from './FilterSidebar';
import { MobileFilterSheet } from './MobileFilterSheet';
import { InternshipCard } from './InternshipCard';
import { InternshipModal } from './InternshipModal';
import { FilterState, Internship } from '@/types';
import { useInternshipsData } from '@/hooks/useInternships';
import { useInteractions } from '@/hooks/useInteractions';
import { useRealtimeInternshipStats } from '@/hooks/useRealtimeInternshipStats';
import { toast } from 'sonner';

export const StudentDashboard: React.FC = () => {
  const { internships, incrementViews, incrementApplyClicks, isLoading } = useInternshipsData();
  const { isStarred, isViewed, toggleStar, markAsViewed } = useInteractions();
  const { stats } = useRealtimeInternshipStats();
  
  const [filters, setFilters] = useState<FilterState>({
    majors: [],
    industries: [],
    timePosted: 'all',
    location: 'all'
  });
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const internshipsWithInteractions = useMemo(() => {
    return internships.map(internship => ({
      ...internship,
      isStarred: isStarred(internship.id),
      isViewed: isViewed(internship.id),
    }));
  }, [internships, isStarred, isViewed]);

  const filteredInternships = useMemo(() => {
    let filtered = internshipsWithInteractions;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(internship =>
        internship.title.toLowerCase().includes(query) ||
        internship.company.toLowerCase().includes(query) ||
        internship.location.toLowerCase().includes(query) ||
        internship.description.toLowerCase().includes(query) ||
        internship.major.some(major => major.toLowerCase().includes(query)) ||
        internship.industry.some(ind => ind.toLowerCase().includes(query))
      );
    }

    // Apply major filter
    if (filters.majors.length > 0) {
      filtered = filtered.filter(internship =>
        internship.major.some(major => filters.majors.includes(major))
      );
    }

    // Apply industry filter
    if (filters.industries.length > 0) {
      filtered = filtered.filter(internship =>
        internship.industry.some(industry => filters.industries.includes(industry))
      );
    }

    // Apply time posted filter
    if (filters.timePosted !== 'all') {
      const now = new Date();

      filtered = filtered.filter(internship => {
        if (!internship.createdAt) return false;
        const posted = new Date(internship.createdAt);
        const daysDiff = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));

        switch (filters.timePosted) {
          case '24h':
            return daysDiff <= 1;
          case '7d':
            return daysDiff <= 7;
          case '30d':
            return daysDiff <= 30;
          default:
            return true;
        }
      });
    }

    // Apply location filter
    if (filters.location && filters.location !== 'all') {
      filtered = filtered.filter(internship =>
        internship.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Apply tab-specific filters
    if (activeTab === 'starred') {
      filtered = filtered.filter(internship => internship.isStarred);
    } else if (activeTab === 'viewed') {
      filtered = filtered.filter(internship => internship.isViewed);
    }

    return filtered;
  }, [internshipsWithInteractions, filters, activeTab, searchQuery]);

  const handleToggleStar = async (id: string) => {
    await toggleStar(id);
  };

  const handleViewDetails = async (internship: Internship) => {
    await markAsViewed(internship.id);
    await incrementViews(internship.id);
    setSelectedInternship(internship);
    setIsModalOpen(true);
  };

  const handleApplyClick = async (internshipId: string) => {
    await incrementApplyClicks(internshipId);
    toast.success('Application link opened!', {
      description: 'Good luck with your application!',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3">Internship Opportunities</h1>
        <p className="text-muted-foreground text-lg">
          Discover and apply to internships that match your interests and qualifications
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title, company, location, major, or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Mobile Filter Button - shown only on small screens */}
      <div className="block lg:hidden mb-6">
        <MobileFilterSheet filters={filters} onFilterChange={setFilters} />
      </div>

      <div className="flex gap-8">
        {/* Desktop Filter Sidebar - hidden on small screens */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <FilterSidebar filters={filters} onFilterChange={setFilters} />
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 h-11">
              <TabsTrigger value="all">
                All Internships
              </TabsTrigger>
              <TabsTrigger value="starred">
                Starred
              </TabsTrigger>
              <TabsTrigger value="viewed">
                Viewed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-5">
              {filteredInternships.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <p className="text-muted-foreground text-xl font-medium mb-2">
                    {searchQuery.trim() 
                      ? 'No internships match your search.' 
                      : 'No internships found matching your filters.'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery.trim() 
                      ? 'Try different keywords or adjust your filters.' 
                      : 'Try adjusting your filter criteria.'}
                  </p>
                </div>
              ) : (
                filteredInternships.map((internship) => (
                  <InternshipCard
                    key={internship.id}
                    internship={internship}
                    onToggleStar={handleToggleStar}
                    onViewDetails={handleViewDetails}
                    applicantsCount={stats[internship.id]?.applies || 0}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="starred" className="space-y-5">
              {filteredInternships.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <p className="text-muted-foreground text-xl font-medium mb-2">No starred internships yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Star internships you're interested in to save them for later.
                  </p>
                </div>
              ) : (
                filteredInternships.map((internship) => (
                  <InternshipCard
                    key={internship.id}
                    internship={internship}
                    onToggleStar={handleToggleStar}
                    onViewDetails={handleViewDetails}
                    applicantsCount={stats[internship.id]?.applies || 0}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="viewed" className="space-y-5">
              {filteredInternships.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <p className="text-muted-foreground text-xl font-medium mb-2">No viewed internships yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Internships you view in detail will appear here.
                  </p>
                </div>
              ) : (
                filteredInternships.map((internship) => (
                  <InternshipCard
                    key={internship.id}
                    internship={internship}
                    onToggleStar={handleToggleStar}
                    onViewDetails={handleViewDetails}
                    applicantsCount={stats[internship.id]?.applies || 0}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <InternshipModal
        internship={selectedInternship}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApplyClick={handleApplyClick}
        applicantsCount={selectedInternship ? (stats[selectedInternship.id]?.applies || 0) : 0}
      />
    </div>
  );
};