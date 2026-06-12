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
function getAbsoluteDate(localDateStr: string, stadiumId: number): Date {
  if (!localDateStr) return new Date();
  
  // Parse "06/11/2026 13:00" to components
  const [datePart, timePart] = localDateStr.split(' ');
  const [mm, dd, yyyy] = datePart.split('/');
  const [hh, min] = timePart.split(':');
  
  // Format as ISO string without Z: "2026-06-11T13:00:00"
  const isoStr = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T${hh.padStart(2, '0')}:${min.padStart(2, '0')}:00`;
  
  const stadiumTz = STADIUM_TIMEZONES[stadiumId] || 'UTC';
  
  // We can construct the absolute date by using Intl or trying to offset it.
  // Actually, standard Date parsing evaluates local machine time.
  // A clean hack: Calculate the offset difference. But it's easier:
  // "2026-06-11T13:00:00-06:00" if we know the offset.
  // Wait, date-fns-tz has a proper way to do this without `fromZonedTime` if it's missing.
  // Let's use standard Date with the offset if possible.
  // Wait! formatInTimeZone parses an ISO string IF it has an offset.
  // Actually, we can just use `new Date(new Date(isoStr).toLocaleString("en-US", {timeZone: stadiumTz}))` hack?
  // Let's just do standard string manipulation to add the offset? No, DST applies.
  // We'll just rely on `date-fns-tz` or standard Intl to find the timezone offset.
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: stadiumTz,
    timeZoneName: 'longOffset',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  
  // Find the offset (e.g. GMT-0600) for this specific date
  // Wait, to find the offset for this specific date, we must parse it first.
  const tempDate = new Date(`${yyyy}-${mm}-${dd}T12:00:00Z`);
  const parts = formatter.formatToParts(tempDate);
  const tzName = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+0000';
  // tzName is like "GMT-06:00" or "GMT-05:00"
  const offset = tzName.replace('GMT', '').replace('0000', '+00:00');
  
  // Combine ISO with offset: 2026-06-11T13:00:00-06:00
  return new Date(`${isoStr}${offset === '' ? 'Z' : offset}`);
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
