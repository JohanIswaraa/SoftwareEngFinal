import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { supabase } from '@/integrations/supabase/client';
import suLogo from '@/assets/su-logo-2.png';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchAvatar();
      
      // Subscribe to profile changes for realtime avatar updates
      const channel = supabase
        .channel('profile-avatar-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            const newProfile = payload.new as any;
            setAvatarUrl(newProfile.avatar_url || '');
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchAvatar = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setAvatarUrl((data as any).avatar_url || '');
    }
  };

  return (
    <>
      <header className="site-header bg-gradient-to-r from-background to-background/95 border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <img 
              src={suLogo} 
              alt="Sampoerna University" 
              className="h-20 w-auto filter drop-shadow-sm hover:drop-shadow-md transition-all duration-300"
            />
            <div className="flex items-center gap-4">
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-crimson font-semibold text-accent tracking-wide">
                  Career Center
                </span>
                <span className="text-xs text-muted-foreground font-inter tracking-wider uppercase">
                  Internship Portal
                </span>
              </div>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-sm">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">Welcome, {user.name}</span>
                <Badge variant="secondary" className="text-xs px-2.5 py-1">
                  {user.role === 'admin' ? 'Admin' : 'Student'}
                </Badge>
              </button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      <ProfileSettingsModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </>
  );
};