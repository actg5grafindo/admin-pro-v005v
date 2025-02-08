import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Get the user's profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;
          setProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">
            {t('Dashboard')}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {profile?.email}
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
            >
              {t('Sign Out')}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('Profile Information')}
            </h2>
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground">{t('Username')}:</span>{' '}
                <span className="font-medium">{profile?.username}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('Email')}:</span>{' '}
                <span className="font-medium">{profile?.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('Phone')}:</span>{' '}
                <span className="font-medium">{profile?.phone}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('Role')}:</span>{' '}
                <span className="font-medium">{t(`roles.${profile?.role}`)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
