import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, MapPin, Clock } from 'lucide-react';
import { Internship } from '@/types';

interface InternshipCardProps {
  internship: Internship;
  onToggleStar: (id: string) => void;
  onViewDetails: (internship: Internship) => void;
  applicantsCount?: number;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({
  internship,
  onToggleStar,
  onViewDetails,
  applicantsCount = 0,
}) => {
  return (
    <Card className="internship-card">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground mb-1.5 line-clamp-2">
              {internship.title}
            </CardTitle>
            <p className="text-primary font-medium text-sm">{internship.company}</p>
          </div>
          <button
            className="star-button p-1.5 flex-shrink-0"
            onClick={() => onToggleStar(internship.id)}
            aria-label={internship.isStarred ? 'Remove from starred' : 'Add to starred'}
          >
            <Star
              className={`h-5 w-5 ${
                internship.isStarred ? 'star-active fill-current' : 'star-default'
              }`}
            />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-1">
          {internship.major.map((major) => (
            <Badge key={major} className="text-xs bg-accent/10 text-accent border-accent/20 hover:bg-accent/20">
              {major}
            </Badge>
          ))}
          {internship.industry.map((industry, index) => (
            <Badge key={index} className="text-xs bg-accent/10 text-accent border-accent/20 hover:bg-accent/20">
              {industry}
            </Badge>
          ))}
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1 break-words">{internship.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="break-words">{internship.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>{applicantsCount} applicants</span>
          </div>
        </div>
        
        <Button 
          onClick={() => onViewDetails(internship)}
          className="w-full"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};