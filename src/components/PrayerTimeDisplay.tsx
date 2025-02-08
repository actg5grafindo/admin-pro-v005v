import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentPrayerTime, FullPrayerTimesResponse } from '@/utils/prayerTimeUtils';
import { parse, differenceInSeconds } from 'date-fns';

// Relative path to the bell sound in public folder
const BELL_SOUND_PATH = '/sounds/bell.mp3';

// Static prayer times for fallback
const STATIC_PRAYER_TIMES = {
  'Jakarta': {
    'imsak': '04:30',
    'subuh': '04:45',
    'terbit': '05:54',
    'dhuha': '06:00',
    'dzuhur': '11:45',
    'ashar': '15:04',
    'maghrib': '17:43',
    'isya': '19:03'
  }
};

interface PrayerTimeDisplayProps {
  className?: string;
}

export function PrayerTimeDisplay({ 
  className = 'font-montserrat font-normal text-[14px] leading-[20px] text-[#d1d5db]' 
}: PrayerTimeDisplayProps) {
  const { t, i18n } = useTranslation();
  const [prayerTime, setPrayerTime] = useState<FullPrayerTimesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlinking, setIsBlinking] = useState(false);
  
  // Ref for audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPrayerTime = async () => {
      try {
        setLoading(true);
        const prayerTimes = await getCurrentPrayerTime();
        
        if (prayerTimes) {
          setPrayerTime(prayerTimes);
          setError(null);
        } else {
          // Fallback to static times
          setPrayerTime({
            currentPrayer: determineCurrentPrayer(STATIC_PRAYER_TIMES['Jakarta'], new Date()),
            fullSchedule: STATIC_PRAYER_TIMES['Jakarta'],
            city: 'Jakarta'
          });
          console.warn('Using static prayer times due to API failure');
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        
        // Fallback to static times
        setPrayerTime({
          currentPrayer: determineCurrentPrayer(STATIC_PRAYER_TIMES['Jakarta'], new Date()),
          fullSchedule: STATIC_PRAYER_TIMES['Jakarta'],
          city: 'Jakarta'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTime();
    const intervalId = setInterval(fetchPrayerTime, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  // Function to determine current prayer based on time
  function determineCurrentPrayer(prayerTimes: { [key: string]: string }, currentTime: Date): { name: string; time: string; remaining: string } {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    const prayerTimeEntries = Object.entries(prayerTimes);
    let currentPrayer: { name: string; time: string; remaining: string } | null = null;

    for (let i = 0; i < prayerTimeEntries.length; i++) {
      const [prayerName, prayerTime] = prayerTimeEntries[i];
      const [hour, minute] = prayerTime.split(':').map(Number);

      if (currentHour > hour || (currentHour === hour && currentMinute >= minute)) {
        currentPrayer = {
          name: prayerName,
          time: prayerTime,
          remaining: ''
        };
      } else {
        break;
      }
    }

    if (!currentPrayer) {
      currentPrayer = {
        name: prayerTimeEntries[0][0],
        time: prayerTimeEntries[0][1],
        remaining: ''
      };
    }

    return currentPrayer;
  }

  // Blinking animation styles
  const blinkingStyle = {
    animation: isBlinking ? 'blink 1s infinite' : 'none'
  };

  // Add global style for blinking
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Memoize hover content for performance
  const HoverContent = useMemo(() => {
    if (!prayerTime?.fullSchedule) return null;
    
    // Define translations
    const translations = {
      id: {
        title: 'Jadwal Sholat Hari Ini',
        city: 'Kota: ',
        prayers: {
          'imsak': 'Imsak',
          'subuh': 'Subuh',
          'terbit': 'Terbit',
          'dhuha': 'Dhuha',
          'dzuhur': 'Dzuhur',
          'ashar': 'Ashar',
          'maghrib': 'Maghrib',
          'isya': 'Isya\''
        }
      },
      en: {
        title: "Today's Prayer Time",
        city: 'City: ',
        prayers: {
          'imsak': 'Imsak',
          'subuh': 'Fajar',
          'terbit': 'Sunrise',
          'dhuha': 'Dhuha',
          'dzuhur': 'Dhuhur',
          'ashar': 'Asr',
          'maghrib': 'Maghrib',
          'isya': 'Isha'
        }
      }
    };

    const currentLang = i18n.language === 'id' ? 'id' : 'en';
    const currentTranslations = translations[currentLang];
    
    return (
      <div className="absolute left-0 top-full z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 shadow-lg">
        <div className="font-bold mb-1">{currentTranslations.title}</div>
        <div className="font-semibold mb-2">
          {currentTranslations.city}{prayerTime.city}
        </div>
        {Object.entries(prayerTime.fullSchedule).map(([name, time]) => (
          <div key={name} className="flex justify-between">
            <span>{currentTranslations.prayers[name.toLowerCase()]}</span>
            <span className="ml-2">{time}</span>
          </div>
        ))}
      </div>
    );
  }, [prayerTime?.fullSchedule, i18n.language]);

  if (loading) return <div className={className}>{t('Memuat...')}</div>;
  if (error) return <div className={className}>{error}</div>;
  if (!prayerTime) return null;

  return (
    <div className="group relative">
      <div 
        className={`${className} ${isBlinking ? 'animate-blinking' : ''}`}
        style={blinkingStyle}
      >
        | {prayerTime.currentPrayer.name} {prayerTime.currentPrayer.time} {prayerTime.currentPrayer.remaining ? 
          (i18n.language === 'id' 
            ? `Masih ${formatRemainingTime(prayerTime.currentPrayer.remaining)}` 
            : `Remaining ${formatRemainingTime(prayerTime.currentPrayer.remaining)}`) 
          : ''}
      </div>
      {HoverContent}
    </div>
  );
}

// Helper function to format remaining time as HH:mm
function formatRemainingTime(remainingTime: string): string {
  // Check if the input is in the format of minutes
  const minutes = parseInt(remainingTime.replace(' menit', ''), 10);
  
  if (isNaN(minutes)) return remainingTime;

  // Convert minutes to HH:mm format
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  // Pad with leading zeros if needed
  return hours > 0 
    ? `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}` 
    : `00:${mins.toString().padStart(2, '0')}`;
}
