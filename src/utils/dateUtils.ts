export const formatDate = (date: Date, locale: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', options);
};

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};