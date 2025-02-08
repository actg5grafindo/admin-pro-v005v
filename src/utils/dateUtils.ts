import axios from 'axios';
import { format } from 'date-fns';

export async function getHijriDate(date?: Date): Promise<{
  fullDate: string;
  dayName: string;
}> {
  try {
    const targetDate = date || new Date();
    const formattedDate = format(targetDate, 'dd-MM-yyyy');

    const response = await axios.get(
      `https://api.aladhan.com/v1/gToH/${formattedDate}`
    );

    const hijriDate = response.data.data.hijri;
    
    // Log the exact weekday name from the API
    console.log('API Weekday:', hijriDate.weekday);

    // Manually map weekday names to Arabic Hijri names
    const weekdayMapping: { [key: string]: string } = {
      'Al Ahad': 'Aḥad',
      'Al Ithnain': 'Ithnayn',
      'Al Thulatha': 'Tsalatsah',
      'Al Arba\'a': 'Arba\'a',
      'Al Khamees': 'Khamsatun',
      'Al Jumu\'ah': 'Jumu\'ah',
      'Al Sabt': 'Sabat'
    };

    const originalWeekday = hijriDate.weekday.en;
    const arabicWeekday = weekdayMapping[originalWeekday] || originalWeekday;

    console.log('Mapped Weekday:', {
      original: originalWeekday,
      mapped: arabicWeekday
    });

    return {
      fullDate: `${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year}`,
      dayName: arabicWeekday
    };
  } catch (error) {
    console.error('Error converting to Hijri date:', error);
    return {
      fullDate: 'Hijri date unavailable',
      dayName: ''
    };
  }
}
