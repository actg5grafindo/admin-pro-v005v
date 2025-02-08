import axios from 'axios';
import { format, parse, differenceInMinutes } from 'date-fns';

// Hardcoded prayer times as fallback with manual adjustment
const STATIC_PRAYER_TIMES = {
  'Jakarta': {
    'Imsak': '04:23', // Adjusted slightly before Fajr
    'Subuh': '04:33', // Exact Fajr time
    'Terbit': '05:55', // Sunrise time
    'Dhuha': calculateDhuhaTime('05:55'),
    'Dzuhur': '12:06', // Exact Dhuhr time
    'Ashar': '15:26',  // Exact Asr time
    'Maghrib': '18:18', // Exact Maghrib time
    'Isya': '19:31'    // Exact Isha time
  }
};

function calculateDhuhaTime(terbitTime: string): string {
  // Parse the Terbit time
  const [terbitHours, terbitMinutes] = terbitTime.split(':').map(Number);
  
  // Add 20 minutes
  let dhuhaMinutes = terbitMinutes + 20;
  let dhuhaHours = terbitHours;

  // Handle minute overflow
  if (dhuhaMinutes >= 60) {
    dhuhaHours += 1;
    dhuhaMinutes -= 60;
  }

  // Format back to HH:mm
  return `${dhuhaHours.toString().padStart(2, '0')}:${dhuhaMinutes.toString().padStart(2, '0')}`;
}

export interface PrayerTimes {
  name: string;
  time: string;
  remaining?: string;
}

export interface FullPrayerTimesResponse {
  currentPrayer: PrayerTimes;
  fullSchedule: { [key: string]: string };
  city: string;
}

async function fetchPrayerTimesFromApi(date: Date): Promise<FullPrayerTimesResponse | null> {
  try {
    console.warn('Using hardcoded prayer times as fallback');
    
    const currentTime = new Date();
    const currentPrayer = determineCurrentPrayer(STATIC_PRAYER_TIMES['Jakarta'], currentTime);

    return {
      currentPrayer: currentPrayer,
      fullSchedule: STATIC_PRAYER_TIMES['Jakarta'],
      city: 'Jakarta'
    };

    // Uncomment the original implementation when internet is available
    // const year = date.getFullYear();
    // const month = String(date.getMonth() + 1).padStart(2, '0');
    // const day = String(date.getDate()).padStart(2, '0');

    // const response = await fetch(
    //   `https://api.myquran.com/v1/sholat/jadwal/Jakarta/${year}/${month}/${day}`
    // );

    // if (!response.ok) {
    //   console.error('Prayer times API response not OK:', response.status, response.statusText);
    //   return null;
    // }

    // const data = await response.json();
    
    // if (!data || !data.data || !data.data.jadwal) {
    //   console.error('Invalid prayer times data structure', data);
    //   return null;
    // }

    // const jadwal = data.data.jadwal;
    // const currentTime = new Date();

    // // Manual adjustment of prayer times
    // const adjustPrayerTime = (time: string, minuteOffset: number = 0): string => {
    //   const [hours, minutes] = time.split(':').map(Number);
    //   const adjustedMinutes = minutes + minuteOffset;
    //   const adjustedHours = hours + Math.floor(adjustedMinutes / 60);
    //   const finalMinutes = adjustedMinutes % 60;

    //   return `${adjustedHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
    // };

    // // Calculate Dhuha time 20 minutes after Terbit
    // const dhuhaTime = calculateDhuhaTime(jadwal.terbit);

    // const prayerSchedule = {
    //   'Imsak': adjustPrayerTime(jadwal.imsak, -10), // Slight adjustment
    //   'Subuh': adjustPrayerTime(jadwal.subuh, 0),
    //   'Terbit': adjustPrayerTime(jadwal.terbit, 0),
    //   'Dhuha': dhuhaTime,
    //   'Dzuhur': adjustPrayerTime(jadwal.dzuhur, 0),
    //   'Ashar': adjustPrayerTime(jadwal.ashar, 0),
    //   'Maghrib': adjustPrayerTime(jadwal.maghrib, 0),
    //   'Isya': adjustPrayerTime(jadwal.isya, 0)
    // };

    // const currentPrayer = determineCurrentPrayer(prayerSchedule, currentTime);

    // return {
    //   currentPrayer: currentPrayer,
    //   fullSchedule: prayerSchedule,
    //   city: 'Jakarta'
    // };
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return null;
  }
}

function determineCurrentPrayer(
  schedule: { [key: string]: string }, 
  currentTime: Date
): PrayerTimes {
  const prayerOrder = [
    'Imsak', 'Subuh', 'Terbit', 'Dhuha', 
    'Dzuhur', 'Ashar', 'Maghrib', 'Isya'
  ];

  for (const prayerName of prayerOrder) {
    const prayerTime = parse(schedule[prayerName], 'HH:mm', currentTime);
    
    prayerTime.setFullYear(
      currentTime.getFullYear(), 
      currentTime.getMonth(), 
      currentTime.getDate()
    );

    if (prayerTime > currentTime) {
      const remainingMinutes = differenceInMinutes(prayerTime, currentTime);
      
      return {
        name: prayerName,
        time: schedule[prayerName],
        remaining: `${remainingMinutes} menit`
      };
    }
  }

  // If all prayers are done, return last prayer
  return {
    name: 'Isya',
    time: schedule['Isya'],
    remaining: '0 menit'
  };
}

export async function getCurrentPrayerTime(): Promise<FullPrayerTimesResponse | null> {
  try {
    const currentDate = new Date();
    
    // First try to fetch from API
    const apiResult = await fetchPrayerTimesFromApi(currentDate);
    if (apiResult) return apiResult;

    // Fallback to static times if API fails
    return {
      currentPrayer: determineCurrentPrayer(STATIC_PRAYER_TIMES['Jakarta'], currentDate),
      fullSchedule: STATIC_PRAYER_TIMES['Jakarta'],
      city: 'Jakarta'
    };
  } catch (error) {
    console.warn('Failed to get prayer times:', error);
    return null;
  }
}

async function detectUserCity(): Promise<string> {
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    // For now, always return Jakarta due to API limitations
    return 'Jakarta';
  } catch (error) {
    console.warn('Gagal mendapatkan lokasi:', error);
    return 'Jakarta';
  }
}
