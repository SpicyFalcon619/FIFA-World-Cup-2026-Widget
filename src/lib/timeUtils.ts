import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const STADIUM_TIMEZONES: Record<number, string> = {
  1: 'America/Mexico_City', // Mexico City
  2: 'America/Mexico_City', // Guadalajara
  3: 'America/Monterrey',   // Monterrey
  4: 'America/Chicago',     // Dallas
  5: 'America/Chicago',     // Houston
  6: 'America/Chicago',     // Kansas City
  7: 'America/New_York',    // Atlanta
  8: 'America/New_York',    // Miami
  9: 'America/New_York',    // Boston
  10: 'America/New_York',   // Philadelphia
  11: 'America/New_York',   // NY/NJ
  12: 'America/Toronto',    // Toronto
  13: 'America/Vancouver',  // Vancouver
  14: 'America/Los_Angeles', // Seattle
  15: 'America/Los_Angeles', // San Francisco
  16: 'America/Los_Angeles', // Los Angeles
};

// Takes "MM/DD/YYYY HH:mm" stadium local time, and returns absolute Date
export function getAbsoluteDate(localDateStr: string, stadiumId: number): Date {
  if (!localDateStr) return new Date();
  
  try {
    const parts = localDateStr.split(' ');
    const datePart = parts[0] || '';
    const timePart = parts[1] || '00:00';
    
    const [mm, dd, yyyy] = datePart.split('/');
    if (!mm || !dd || !yyyy) return new Date(localDateStr);

    const [hh, min] = timePart.split(':');
    
    const isoStr = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T${(hh||'0').padStart(2, '0')}:${(min||'0').padStart(2, '0')}:00`;
    
    const stadiumTz = STADIUM_TIMEZONES[stadiumId] || 'UTC';
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: stadiumTz,
      timeZoneName: 'longOffset',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
    
    const tempDate = new Date(`${yyyy}-${mm}-${dd}T12:00:00Z`);
    const formattedParts = formatter.formatToParts(tempDate);
    const tzName = formattedParts.find(p => p.type === 'timeZoneName')?.value || 'GMT+0000';
    const offset = tzName.replace('GMT', '').replace('0000', '+00:00');
    
    return new Date(`${isoStr}${offset === '' ? 'Z' : offset}`);
  } catch (e) {
    return new Date(localDateStr || Date.now());
  }
}

export function formatTime(localDateStr: string, stadiumId: number, userTimezone: string): string {
  if (!localDateStr) return '';
  try {
    const absDate = getAbsoluteDate(localDateStr, stadiumId);
    return formatInTimeZone(absDate, userTimezone, 'h:mm a');
  } catch (e) {
    return format(new Date(localDateStr), 'h:mm a');
  }
}

export function formatDate(localDateStr: string, stadiumId: number, userTimezone: string): string {
  if (!localDateStr) return '';
  try {
    const absDate = getAbsoluteDate(localDateStr, stadiumId);
    return formatInTimeZone(absDate, userTimezone, 'dd MMM');
  } catch (e) {
    return format(new Date(localDateStr), 'dd MMM');
  }
}
