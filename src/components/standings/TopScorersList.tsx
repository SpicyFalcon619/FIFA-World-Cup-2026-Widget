import { useState, useMemo } from 'react';
import { useWC2026Store, parseScorers } from '../../store/wc2026Store';
import { Target, TrendingUp } from 'lucide-react';

interface PlayerStat {
  player: string;
  team: string;
  flag: string;
  count: number;
}

const STAT_TABS = [
  { key: 'goals' as const, label: 'Goals', icon: <Target size={11} /> },
  { key: 'assists' as const, label: 'Assists', icon: <TrendingUp size={11} /> },
];

type StatKey = 'goals' | 'assists';

function StatRow({ rank, player, team, flag, count, label }: {
  rank: number; player: string; team: string; flag: string; count: number; label: string;
}) {
  const setSelectedTeam = useWC2026Store(s => s.setSelectedTeam);

  return (
    <div
      onClick={() => setSelectedTeam(team)}
      className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/5 cursor-pointer"
      style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}
    >
      <span className="text-sm font-mono font-bold text-white/25 w-4 text-center shrink-0">{rank}</span>
      {flag
        ? <img src={flag} alt={team} className="w-8 h-8 object-contain drop-shadow-md shrink-0" />
        : <div className="w-8 h-6 rounded-md bg-white/10 shrink-0" />
      }
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-semibold text-sm truncate">{player}</span>
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] truncate">{team}</span>
      </div>
      <div className="flex flex-col items-center shrink-0 min-w-[40px]">
        <span className="text-xl font-black text-[var(--accent-gold)] tabular-nums">{count}</span>
        <span className="text-[9px] uppercase text-white/25 tracking-wider">{label}</span>
      </div>
    </div>
  );
}

export function TopScorersList() {
  const [activeTab, setActiveTab] = useState<StatKey>('goals');
  const { matches, groups } = useWC2026Store();

  // Build team → flag lookup from groups
  const teamFlagMap = useMemo(() => {
    const map: Record<string, string> = {};
    groups.forEach(g => g.standings.forEach(t => { map[t.team] = t.flag; }));
    return map;
  }, [groups]);

  // Also build flag from matches directly
  const matchTeamMap = useMemo(() => {
    const map: Record<string, string> = {};
    matches.forEach(m => {
      if (m.homeTeam && m.homeFlag) map[m.homeTeam] = m.homeFlag;
      if (m.awayTeam && m.awayFlag) map[m.awayTeam] = m.awayFlag;
    });
    return map;
  }, [matches]);

  const getFlag = (team: string) => teamFlagMap[team] ?? matchTeamMap[team] ?? '';

  // Aggregate goals from finished matches by parsing scorer strings
  const goalStats: PlayerStat[] = useMemo(() => {
    const map: Record<string, { team: string; count: number }> = {};
    matches.filter(m => m.status === 'FINISHED').forEach(m => {
      parseScorers(m.homeScorers).forEach(({ name }) => {
        if (!name || name.length < 2) return;
        if (!map[name]) map[name] = { team: m.homeTeam, count: 0 };
        map[name].count++;
      });
      parseScorers(m.awayScorers).forEach(({ name }) => {
        if (!name || name.length < 2) return;
        if (!map[name]) map[name] = { team: m.awayTeam, count: 0 };
        map[name].count++;
      });
    });
    return Object.entries(map)
      .map(([player, { team, count }]) => ({ player, team, flag: getFlag(team), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 25);
  }, [matches, teamFlagMap, matchTeamMap]);

  const stats = activeTab === 'goals' ? goalStats : [];

  return (
    <div className="flex flex-col gap-3">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
        {STAT_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-wider rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-[var(--bg-glass)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats list */}
      {activeTab === 'assists' ? (
        <div className="text-center text-[var(--text-muted)] mt-8 text-sm px-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-3">
            <TrendingUp size={18} className="text-white/20" />
          </div>
          Assist data is not provided by the API source.
        </div>
      ) : stats.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-8 text-sm">
          No goals scored yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {stats.map((s, i) => (
            <StatRow
              key={`${s.player}-${i}`}
              rank={i + 1}
              player={s.player}
              team={s.team}
              flag={s.flag}
              count={s.count}
              label="goals"
            />
          ))}
        </div>
      )}
    </div>
  );
}
