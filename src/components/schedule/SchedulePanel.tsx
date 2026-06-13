import { useWC2026Store } from '../../store/wc2026Store';
import { FilterBar } from './FilterBar';
import { MatchCard } from './MatchCard';
import { getAbsoluteDate } from '../../lib/timeUtils';

export function SchedulePanel() {
  const { matches, filterStage, filterGroup } = useWC2026Store();

  const filteredMatches = matches.filter(m => {
    if (filterStage !== 'ALL' && m.stage !== filterStage) return false;
    if (filterGroup !== 'ALL' && m.group !== filterGroup) return false;
    return true;
  }).sort((a, b) => {
    const dateA = getAbsoluteDate(a.utcKickoff, a.stadiumId).getTime();
    const dateB = getAbsoluteDate(b.utcKickoff, b.stadiumId).getTime();
    return dateA - dateB;
  });

  return (
    <div className="flex flex-col h-full relative">
      <FilterBar />
      <div className="flex-1 pb-4">
        {filteredMatches.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] mt-10 text-sm">
            No matches found for this filter.
          </div>
        ) : (
          filteredMatches.map(m => (
            <MatchCard key={m.id} match={m} />
          ))
        )}
      </div>
    </div>
  );
}
