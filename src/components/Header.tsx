import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { PrayerTimeDisplay } from './PrayerTimeDisplay';
import { getHijriDate } from '@/utils/dateUtils';

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hijriDate, setHijriDate] = useState<{
    fullDate: string;
    dayName: string;
  } | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Fetch Hijri date
  useEffect(() => {
    const fetchHijriDate = async () => {
      try {
        const dateInfo = await getHijriDate();
        setHijriDate(dateInfo);
      } catch (error) {
        console.error('Error fetching Hijri date:', error);
      }
    };

    fetchHijriDate();
  }, [currentTime]);

  // Session management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch last login
  const { data: lastLogin } = useQuery({
    queryKey: ['lastLogin', session?.user?.id ?? 'no-user'],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('login_activity')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('transaction_type', 'login')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    enabled: !!session?.user?.id,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleLanguageChange = (lang: string) => {
    // Change language using i18n
    i18n.changeLanguage(lang);
    
    // Store language preference in localStorage
    localStorage.setItem('language', lang);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#007bbf] text-white px-4 flex justify-between items-center" style={{paddingTop: '0.35rem', paddingBottom: '0.35rem'}}>
      <div className="flex items-center">
        <span className="font-montserrat text-[16px] font-[400] mr-4">Admin Pro</span>
        <div className="flex space-x-2 bg-white/20 rounded-full p-1">
          <button 
            onClick={() => handleLanguageChange('en')}
            className={`px-2 py-1 rounded-full text-[11px] ${i18n.language === 'en' ? 'bg-white text-[#007bbf]' : 'text-white'}`}
          >
            EN
          </button>
          <button 
            onClick={() => handleLanguageChange('id')}
            className={`px-2 py-1 rounded-full text-[11px] ${i18n.language === 'id' ? 'bg-white text-[#007bbf]' : 'text-white'}`}
          >
            ID
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="hover:bg-gray-700 text-white flex items-center space-x-2"
              >
                <User size={20} />
                <span>{session.user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#374151] text-white border-gray-700">
              <DropdownMenuLabel>{t('My Account')}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem 
                onSelect={() => navigate('/dashboard')}
                className="hover:bg-gray-700 cursor-pointer"
              >
                {t('Dashboard')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={handleLogout}
                className="hover:bg-gray-700 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('Logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <></>
        )}
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center space-x-2">
          <div 
            className="text-sm text-gray-300 font-montserrat group relative cursor-pointer"
            title={hijriDate?.fullDate || 'Hijri Date'}
          >
            {format(currentTime, 'EEE, dd MMM HH:mm', {
              locale: i18n.language === 'id' ? id : enUS
            })}
            {hijriDate && (
              <div className="absolute left-0 top-full z-10 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                {hijriDate.dayName}, {hijriDate.fullDate}
              </div>
            )}
          </div>
          <PrayerTimeDisplay className="font-montserrat font-normal text-[14px] leading-[20px] text-[#d1d5db]" />
        </div>
      </div>
    </header>
  );
};

export default Header;