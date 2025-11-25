import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface LiveUpdateIndicatorProps {
  lastUpdated?: Date;
}

export const LiveUpdateIndicator: React.FC<LiveUpdateIndicatorProps> = ({ lastUpdated }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (lastUpdated) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdated]);

  if (!show) return null;

  return (
    <Badge 
      variant="outline" 
      className="animate-fade-in-up bg-accent/10 text-accent border-accent/30 flex items-center gap-2 px-3 py-1.5"
    >
      <Clock className="h-3.5 w-3.5" />
      <span className="text-sm font-medium">Updated just now</span>
    </Badge>
  );
};
