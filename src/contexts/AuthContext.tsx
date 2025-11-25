import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer profile and role fetching with timeout to prevent deadlock
          setTimeout(() => {
            fetchUserData(session.user);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (authUser: SupabaseUser) => {
    try {
      // Fetch profile and role in parallel
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authUser.id)
          .single()
      ]);

      const profile = profileResult.data;
      const roleData = roleResult.data;

      if (profile && roleData) {
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: roleData.role as 'student' | 'admin'
        });
      } else if (profile) {
        // Profile exists but no role - default to student
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: 'student'
        });
      } else {
        // No profile or role - clear user state
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // On error, still set loading to false to prevent infinite loading
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      // The ProtectedRoute will handle the redirect to /auth
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};