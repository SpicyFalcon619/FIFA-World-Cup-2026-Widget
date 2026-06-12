import { useWC2026Store } from '../../store/wc2026Store';
import { formatTime, formatDate } from '../../lib/timeUtils';

export function CountdownBadge({ utcKickoff, stadiumId }: { utcKickoff: string, stadiumId: number }) {
  const timezone = useWC2026Store(s => s.timezone);

  return (
    <div className="flex flex-col items-center mt-1">
      <span className="text-[11px] font-bold text-white/80">
        {formatTime(utcKickoff, stadiumId, timezone)}
      </span>
      <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider mt-0.5">
        {formatDate(utcKickoff, stadiumId, timezone)}
      </span>
    </div>
  );
}
