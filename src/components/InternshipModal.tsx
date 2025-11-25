import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, Users, Building, Copy } from 'lucide-react';
import { Internship } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface InternshipModalProps {
  internship: Internship | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyClick: (internshipId: string) => void;
  applicantsCount?: number;
}

export const InternshipModal: React.FC<InternshipModalProps> = ({
  internship,
  isOpen,
  onClose,
  onApplyClick,
  applicantsCount = 0,
}) => {
  const { toast } = useToast();
  const { trackApply } = useActivityTracking();
  
  if (!internship) return null;

  const handleApplyClick = () => {
    trackApply(internship.id, 'external_link');
    onApplyClick(internship.id);
  };

  const handleCopyEmail = async () => {
    if (internship.applicationMethod === 'email') {
      navigator.clipboard.writeText(internship.applicationValue);
      
      // Track copy email as an apply
      await trackApply(internship.id, 'copied_email');
      await onApplyClick(internship.id);
      
      toast({
        title: "Email copied!",
        description: "The email address has been copied to your clipboard.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-content max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-2">
          <DialogTitle className="text-2xl font-bold text-foreground pr-8">
            {internship.title}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-primary">{internship.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{internship.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{internship.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>{applicantsCount} applicants</span>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Required Majors</h3>
            <div className="flex flex-wrap gap-2">
              {internship.major.map((major) => (
                <Badge key={major} variant="secondary" className="text-sm">
                  {major}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">Industry</h3>
            <div className="flex flex-wrap gap-2">
              {internship.industry.map((ind, index) => (
                <Badge key={index} variant="outline" className="text-sm">{ind}</Badge>
              ))}
            </div>
          </div>

          {internship.imageUrl && (
            <div>
              <h3 className="font-semibold mb-3 text-foreground">Internship Flyer</h3>
              <img 
                src={internship.imageUrl} 
                alt={`${internship.title} flyer`}
                className="w-full max-w-lg h-auto max-h-96 object-contain rounded-lg border border-border shadow-sm"
              />
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-3 text-foreground">Description</h3>
            <div className="prose prose-sm max-w-none">
              <DialogDescription className="text-base leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {internship.description}
              </DialogDescription>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div>
          <h3 className="font-semibold mb-3 text-foreground">How to Apply</h3>
          {internship.applicationMethod === 'external' ? (
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose} size="lg">
                Close
              </Button>
              <Button 
                variant="default"
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={handleApplyClick}
                asChild
              >
                <a href={internship.applicationValue} target="_blank" rel="noopener noreferrer">
                  Apply Online
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To apply, send your CV to:
              </p>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <a 
                  href={`mailto:${internship.applicationValue}`}
                  className="text-primary hover:underline font-medium flex-1"
                >
                  {internship.applicationValue}
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyEmail}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Email
                </Button>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={onClose} size="lg">
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
