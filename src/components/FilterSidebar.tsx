import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterState } from '@/types';
import { useLocations } from '@/hooks/useLocations';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const MAJORS = [
  'Computer Science',
  'Mechanical Engineering',
  'Business Administration',
  'Visual Communication',
  'Psychology',
  'International Relations'
];

const INDUSTRIES = [
  'Finance',
  'Technology',
  'Machinery',
  'Consulting',
  'Healthcare',
  'Education',
  'Marketing',
  'Manufacturing'
];

const TIME_FILTERS = [
  { value: 'all', label: 'All Time' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' }
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange }) => {
  const { locations, isLoading: locationsLoading } = useLocations();
  const handleMajorChange = (major: string, checked: boolean) => {
    const newMajors = checked 
      ? [...filters.majors, major]
      : filters.majors.filter(m => m !== major);
    
    onFilterChange({ ...filters, majors: newMajors });
  };

  const handleIndustryChange = (industry: string, checked: boolean) => {
    const newIndustries = checked 
      ? [...filters.industries, industry]
      : filters.industries.filter(i => i !== industry);
    
    onFilterChange({ ...filters, industries: newIndustries });
  };

  const handleTimeFilterChange = (value: string) => {
    onFilterChange({ ...filters, timePosted: value });
  };

  const handleLocationFilterChange = (value: string) => {
    onFilterChange({ ...filters, location: value });
  };

  return (
    <div className="w-80 pr-6 flex-shrink-0">
      <Card className="filter-sidebar">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Filter Internships</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-4 text-foreground">Major</h3>
            <div className="space-y-3">
              {MAJORS.map((major) => (
                <div key={major} className="flex items-center space-x-2.5">
                  <Checkbox
                    id={`major-${major}`}
                    checked={filters.majors.includes(major)}
                    onCheckedChange={(checked) => handleMajorChange(major, checked as boolean)}
                  />
                  <Label
                    htmlFor={`major-${major}`}
                    className="text-sm font-normal cursor-pointer leading-none"
                  >
                    {major}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4 text-foreground">Industry</h3>
            <div className="space-y-3">
              {INDUSTRIES.map((industry) => (
                <div key={industry} className="flex items-center space-x-2.5">
                  <Checkbox
                    id={`industry-${industry}`}
                    checked={filters.industries.includes(industry)}
                    onCheckedChange={(checked) => handleIndustryChange(industry, checked as boolean)}
                  />
                  <Label
                    htmlFor={`industry-${industry}`}
                    className="text-sm font-normal cursor-pointer leading-none"
                  >
                    {industry}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4 text-foreground">Time Posted</h3>
            <Select value={filters.timePosted} onValueChange={handleTimeFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                {TIME_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="font-medium mb-4 text-foreground">Location</h3>
            <Select 
              value={filters.location} 
              onValueChange={handleLocationFilterChange}
              disabled={locationsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={locationsLoading ? "Loading..." : "All locations"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
