import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UserSession, Profile, UserRole } from '@/types/user';

export const useAuth = () => {
  const [session, setSession] = useState<UserSession>({ user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id).then((profile) => {
          setSession({
            user: session.user,
            profile,
          });
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setSession({
          user: session.user,
          profile,
        });
      } else {
        setSession({ user: null });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string): Promise<Profile | undefined> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return undefined;
    }

    return data;
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!session.profile) return false;

    const roleHierarchy: { [key in UserRole]: number } = {
      superadmin: 3,
      admin: 2,
      user: 1,
    };

    const userRoleLevel = roleHierarchy[session.profile.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    return userRoleLevel >= requiredRoleLevel;
  };

  const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
    // Only superadmin can change roles to admin, and admin/superadmin can change to user
    if (!session.profile) return false;
    
    if (
      (newRole === 'admin' && session.profile.role !== 'superadmin') ||
      (newRole === 'superadmin')
    ) {
      return false;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    return !error;
  };

  return {
    session,
    loading,
    hasRole,
    updateUserRole,
  };
};
