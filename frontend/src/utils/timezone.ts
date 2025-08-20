/**
 * Timezone utilities for handling IST (Indian Standard Time)
 */

// IST offset: UTC+5:30
const IST_OFFSET_HOURS = 5;
const IST_OFFSET_MINUTES = 30;

/**
 * Convert a date to IST timezone
 */
export const toIST = (date: Date | string): Date => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // If the date doesn't have timezone info, assume it's already in IST from the backend
  if (typeof date === 'string' && !date.includes('Z') && !date.includes('+') && !date.includes('-')) {
    return d;
  }
  
  // Convert UTC to IST
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const istTime = new Date(utc + (IST_OFFSET_HOURS * 3600000) + (IST_OFFSET_MINUTES * 60000));
  
  return istTime;
};

/**
 * Format a date/timestamp for display with IST consideration
 */
export const formatISTTimestamp = (timestamp: string | Date, formatStr: string = 'MMM dd, yyyy HH:mm:ss'): string => {
  // Import format function from date-fns here to avoid circular dependencies
  const { format } = require('date-fns');
  
  const date = toIST(timestamp);
  return format(date, formatStr) + ' IST';
};

/**
 * Get current IST time
 */
export const nowIST = (): Date => {
  const now = new Date();
  return toIST(now);
};