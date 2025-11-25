import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StudentDashboard } from '@/components/StudentDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { PreviewBanner } from '@/components/PreviewBanner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const Index: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  const isPreview = searchParams.get('preview') === 'student';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/auth');
      } else {
        // Redirect admin to /admin if not in preview mode
        if (isAdmin && !isPreview && window.location.pathname === '/') {
          navigate('/admin', { replace: true });
        }
      }
      setIsInitializing(false);
    }
  }, [user, isLoading, isAdmin, isPreview, navigate]);

  if (isLoading || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleBackToAdmin = () => {
    const returnPath = sessionStorage.getItem('adminReturnPath') || '/admin';
    sessionStorage.removeItem('adminReturnPath');
    navigate(returnPath, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      {isPreview && isAdmin && <PreviewBanner />}
      <main className="flex-1">
        {isAdmin && !isPreview ? <AdminDashboard /> : <StudentDashboard />}
      </main>
      <Footer />
    </div>
  );
};
