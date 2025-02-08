import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (requireAuth && !session) {
        // If auth is required and user is not authenticated, redirect to login
        navigate('/login', { replace: true });
      } else if (!requireAuth && session) {
        // If auth is not required (login/register pages) and user is authenticated, redirect to dashboard
        navigate('/', { replace: true });
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (requireAuth && !session) {
        navigate('/login', { replace: true });
      } else if (!requireAuth && session) {
        navigate('/', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, requireAuth]);

  return <>{children}</>;
}
