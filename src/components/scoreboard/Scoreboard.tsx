import { useWC2026Store, getComputedLiveGames } from '../../store/wc2026Store';
import { LiveMatchCard } from './LiveMatchCard';
import { GoalFlash } from './GoalFlash';
import { CalendarX } from 'lucide-react';
import { useMemo } from 'react';

export function Scoreboard() {
  const matches = useWC2026Store(s => s.matches);
  const liveGamesState = useWC2026Store(s => s.liveGames);
  const liveGames = useMemo(() => getComputedLiveGames(matches, liveGamesState), [matches, liveGamesState]);

  return (
    <div className="flex flex-col h-full relative">
      <GoalFlash />
      
      {liveGames.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <CalendarX size={48} className="mb-4 text-[var(--text-muted)] opacity-50" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Matches Live</h3>
          <p className="text-sm text-[var(--text-muted)]">
            Check the Schedule tab for upcoming fixtures.
          </p>
        </div>
      ) : (
        <div className="flex-1">
          {liveGames.map(m => (
            <LiveMatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}
