import axios from 'axios';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Prayer Times API
export const prayerTimeService = {
  async getTodaysPrayerTimes(city = 'Jakarta') {
    try {
      const response = await apiClient.get(`/prayer-times/today`, {
        params: { city }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      throw error;
    }
  },
};
