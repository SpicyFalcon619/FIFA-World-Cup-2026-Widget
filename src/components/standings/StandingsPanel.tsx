import { useWC2026Store } from '../../store/wc2026Store';
import { GroupTable } from './GroupTable';
import { TopScorersList } from './TopScorersList';
import { KnockoutGrid } from './KnockoutGrid';
import { useState } from 'react';

export function StandingsPanel() {
  const { groups, knockoutView, toggleKnockoutView } = useWC2026Store();
  const [tab, setTab] = useState<'GROUPS' | 'SCORERS'>('GROUPS');

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
          <button
            onClick={() => setTab('GROUPS')}
            className={`px-4 py-1 text-xs font-bold tracking-wider rounded-md transition-colors ${
              tab === 'GROUPS' ? 'bg-[var(--bg-glass)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            TEAMS
          </button>
          <button
            onClick={() => setTab('SCORERS')}
            className={`px-4 py-1 text-xs font-bold tracking-wider rounded-md transition-colors ${
              tab === 'SCORERS' ? 'bg-[var(--bg-glass)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            STATS
          </button>
        </div>

        {tab === 'GROUPS' && (
          <button
            onClick={toggleKnockoutView}
            className={`px-3 py-1.5 text-xs font-bold tracking-wider rounded-lg border transition-colors ${
              knockoutView 
                ? 'bg-[var(--accent-gold)] text-black border-[var(--accent-gold)]' 
                : 'bg-[var(--bg-glass)] text-[var(--text-muted)] border-[var(--border-glass)] hover:text-white'
            }`}
          >
            {knockoutView ? 'GROUP STAGE' : 'KNOCKOUTS'}
          </button>
        )}
      </div>

      <div className="flex-1">
        {tab === 'SCORERS' ? (
          <TopScorersList />
        ) : knockoutView ? (
          <KnockoutGrid />
        ) : (
          <div className="flex flex-col gap-2">
            {groups.length === 0 ? (
              <div className="text-center text-[var(--text-muted)] mt-10 text-sm">No group data available.</div>
            ) : (
              groups.map(g => <GroupTable key={g.name} group={g} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
