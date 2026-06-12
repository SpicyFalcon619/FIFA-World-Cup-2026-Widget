import { useState, useMemo } from 'react';
import { useWC2026Store, parseScorers } from '../../store/wc2026Store';
import { Target, TrendingUp, Shield } from 'lucide-react';
import { generateMatchStats } from '../../lib/matchStatsGenerator';
import { PlayerAvatar } from '../layout/PlayerAvatar';

const YellowCardIcon = () => (
  <div className="w-2 h-3 bg-amber-400 rounded-[1px] shadow-sm shrink-0" />
);

const RedCardIcon = () => (
  <div className="w-2 h-3 bg-red-500 rounded-[1px] shadow-sm shrink-0" />
);

const STAT_TABS = [
  { key: 'goals' as const, label: 'Goals', icon: <Target size={11} /> },
  { key: 'assists' as const, label: 'Assists', icon: <TrendingUp size={11} /> },
  { key: 'yellows' as const, label: 'Yellows', icon: <YellowCardIcon /> },
  { key: 'reds' as const, label: 'Reds', icon: <RedCardIcon /> },
  { key: 'saves' as const, label: 'Saves', icon: <Shield size={11} /> },
];

type StatKey = 'goals' | 'assists' | 'yellows' | 'reds' | 'saves';

function StatRow({ rank, player, team, flag, count, label }: {
  rank: number; player: string; team: string; flag: string; count: number; label: string;
}) {
  const setSelectedTeam = useWC2026Store(s => s.setSelectedTeam);

  return (
    <div
      onClick={() => setSelectedTeam(team)}
      className="flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-white/5 cursor-pointer"
      style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}
    >
      <span className="text-xs font-mono font-bold text-white/25 w-4 text-center shrink-0">{rank}</span>
      
      <PlayerAvatar name={player} size="sm" />
      
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-semibold text-xs truncate text-white/95">{player}</span>
        <div className="flex items-center gap-1 mt-0.5 min-w-0">
          {flag && <img src={flag} alt={team} className="w-3.5 h-2.5 object-contain shrink-0 rounded-[1px]" />}
          <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] truncate">{team}</span>
        </div>
      </div>
      
      <div className="flex flex-col items-center shrink-0 min-w-[36px]">
        <span className="text-lg font-black text-[var(--accent-gold)] tabular-nums leading-none">{count}</span>
        <span className="text-[8px] uppercase text-white/25 tracking-wider mt-0.5">{label}</span>
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

  // Aggregate tournament stats from all finished matches
  const tournamentStats = useMemo(() => {
    const goalsMap: Record<string, { team: string; count: number }> = {};
    const assistsMap: Record<string, { team: string; count: number }> = {};
    const yellowsMap: Record<string, { team: string; count: number }> = {};
    const redsMap: Record<string, { team: string; count: number }> = {};
    const savesMap: Record<string, { team: string; count: number }> = {};

    matches.filter(m => m.status === 'FINISHED').forEach(m => {
      // Avoid crash if selected match is TBD
      const isTBD = !m.homeTeam || !m.awayTeam || m.homeTeam === 'TBD' || m.awayTeam === 'TBD' ||
                    /winner|runner|group|tbd/i.test(m.homeTeam) || /winner|runner|group|tbd/i.test(m.awayTeam);
      if (isTBD) return;

      const matchDetails = generateMatchStats(m);

      // 1. Goals (Accurate to API)
      parseScorers(m.homeScorers).forEach(({ name }) => {
        if (!name || name.length < 2) return;
        if (!goalsMap[name]) goalsMap[name] = { team: m.homeTeam, count: 0 };
        goalsMap[name].count++;
      });
      parseScorers(m.awayScorers).forEach(({ name }) => {
        if (!name || name.length < 2) return;
        if (!goalsMap[name]) goalsMap[name] = { team: m.awayTeam, count: 0 };
        goalsMap[name].count++;
      });

      // 2. Assists
      matchDetails.home.startingXI.concat(matchDetails.home.substitutes).forEach(p => {
        if (p.assists > 0) {
          if (!assistsMap[p.name]) assistsMap[p.name] = { team: m.homeTeam, count: 0 };
          assistsMap[p.name].count += p.assists;
        }
      });
      matchDetails.away.startingXI.concat(matchDetails.away.substitutes).forEach(p => {
        if (p.assists > 0) {
          if (!assistsMap[p.name]) assistsMap[p.name] = { team: m.awayTeam, count: 0 };
          assistsMap[p.name].count += p.assists;
        }
      });

      // 3. Goalkeeper Saves
      const hGK = matchDetails.home.startingXI.find(p => p.position === 'GK');
      if (hGK && hGK.saves > 0) {
        if (!savesMap[hGK.name]) savesMap[hGK.name] = { team: m.homeTeam, count: 0 };
        savesMap[hGK.name].count += hGK.saves;
      }
      const aGK = matchDetails.away.startingXI.find(p => p.position === 'GK');
      if (aGK && aGK.saves > 0) {
        if (!savesMap[aGK.name]) savesMap[aGK.name] = { team: m.awayTeam, count: 0 };
        savesMap[aGK.name].count += aGK.saves;
      }

      // 4. Yellow & Red Cards
      matchDetails.home.startingXI.concat(matchDetails.home.substitutes).forEach(p => {
        if (p.yellowCard) {
          if (!yellowsMap[p.name]) yellowsMap[p.name] = { team: m.homeTeam, count: 0 };
          yellowsMap[p.name].count++;
        }
        if (p.redCard) {
          if (!redsMap[p.name]) redsMap[p.name] = { team: m.homeTeam, count: 0 };
          redsMap[p.name].count++;
        }
      });
      matchDetails.away.startingXI.concat(matchDetails.away.substitutes).forEach(p => {
        if (p.yellowCard) {
          if (!yellowsMap[p.name]) yellowsMap[p.name] = { team: m.awayTeam, count: 0 };
          yellowsMap[p.name].count++;
        }
        if (p.redCard) {
          if (!redsMap[p.name]) redsMap[p.name] = { team: m.awayTeam, count: 0 };
          redsMap[p.name].count++;
        }
      });
    });

    const formatAndSort = (map: Record<string, { team: string; count: number }>) => {
      return Object.entries(map)
        .map(([player, { team, count }]) => ({ player, team, flag: getFlag(team), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 25);
    };

    return {
      goals: formatAndSort(goalsMap),
      assists: formatAndSort(assistsMap),
      yellows: formatAndSort(yellowsMap),
      reds: formatAndSort(redsMap),
      saves: formatAndSort(savesMap),
    };
  }, [matches, teamFlagMap, matchTeamMap]);

  const stats = tournamentStats[activeTab];

  const getTabEmptyMessage = () => {
    switch (activeTab) {
      case 'goals': return "No goals scored yet.";
      case 'assists': return "No assists recorded yet.";
      case 'yellows': return "No yellow cards issued yet.";
      case 'reds': return "No red cards issued yet.";
      case 'saves': return "No saves made yet.";
      default: return "No data available.";
    }
  };

  const getStatLabel = () => {
    switch (activeTab) {
      case 'goals': return "goals";
      case 'assists': return "assists";
      case 'yellows': return "yellows";
      case 'reds': return "reds";
      case 'saves': return "saves";
      default: return "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Tab switcher */}
      <div className="flex gap-0.5 bg-black/20 p-0.5 rounded-lg">
        {STAT_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-0.5 text-[9px] font-bold tracking-wider rounded-md transition-colors ${
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
      {stats.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-8 text-sm">
          {getTabEmptyMessage()}
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
              label={getStatLabel()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
