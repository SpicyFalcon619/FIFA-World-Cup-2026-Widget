import { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';
import { getAbsoluteDate } from '../lib/timeUtils';

export function useCountdown(targetISO: string, stadiumId: number) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetISO, stadiumId));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetISO, stadiumId));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetISO, stadiumId]);

  return timeLeft;
}

function calculateTimeLeft(targetISO: string, stadiumId: number) {
  if (!targetISO) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  try {
    const target = getAbsoluteDate(targetISO, stadiumId);
    const now = new Date();
    const diff = differenceInSeconds(target, now);

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    return {
      days: Math.floor(diff / (24 * 3600)),
      hours: Math.floor((diff % (24 * 3600)) / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60,
      isPast: false,
    };
  } catch (e) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
}
