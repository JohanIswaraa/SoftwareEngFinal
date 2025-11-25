import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const PreviewBanner: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBackToAdmin = () => {
    const returnPath = sessionStorage.getItem('adminReturnPath') || '/';
    sessionStorage.removeItem('adminReturnPath');
    navigate(returnPath.replace('?preview=student', ''));
  };

  return (
    <div className="bg-primary text-primary-foreground py-3 px-6 border-b border-primary/20 shadow-md">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium text-sm">
            Previewing Student view — signed in as <strong className="font-semibold">{user?.email}</strong>
          </span>
        </div>
        <Button
          size="sm"
          onClick={handleBackToAdmin}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
        >
          <X className="h-4 w-4" />
          Back to Admin
        </Button>
      </div>
    </div>
  );
};
