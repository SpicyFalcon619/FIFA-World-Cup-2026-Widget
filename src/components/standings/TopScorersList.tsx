import { useState, useMemo } from 'react';
import { useWC2026Store, parseScorers } from '../../store/wc2026Store';
import { Target, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { generateMatchStats } from '../../lib/matchStatsGenerator';


const STAT_TABS = [
  { key: 'goals' as const, label: 'Goals', icon: <Target size={11} /> },
  { key: 'assists' as const, label: 'Assists', icon: <TrendingUp size={11} /> },
  { key: 'cards' as const, label: 'Cards', icon: <AlertTriangle size={11} /> },
  { key: 'saves' as const, label: 'Saves', icon: <Shield size={11} /> },
];

type StatKey = 'goals' | 'assists' | 'cards' | 'saves';

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

  // Aggregate tournament stats from all finished matches
  const tournamentStats = useMemo(() => {
    const goalsMap: Record<string, { team: string; count: number }> = {};
    const assistsMap: Record<string, { team: string; count: number }> = {};
    const cardsMap: Record<string, { team: string; count: number }> = {};
    const savesMap: Record<string, { team: string; count: number }> = {};

    matches.filter(m => m.status === 'FINISHED').forEach(m => {
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

      // 4. Cards (Yellow = 1 pt, Red = 3 pts)
      matchDetails.home.startingXI.concat(matchDetails.home.substitutes).forEach(p => {
        let weight = 0;
        if (p.yellowCard) weight += 1;
        if (p.redCard) weight += 3;
        if (weight > 0) {
          if (!cardsMap[p.name]) cardsMap[p.name] = { team: m.homeTeam, count: 0 };
          cardsMap[p.name].count += weight;
        }
      });
      matchDetails.away.startingXI.concat(matchDetails.away.substitutes).forEach(p => {
        let weight = 0;
        if (p.yellowCard) weight += 1;
        if (p.redCard) weight += 3;
        if (weight > 0) {
          if (!cardsMap[p.name]) cardsMap[p.name] = { team: m.awayTeam, count: 0 };
          cardsMap[p.name].count += weight;
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
      cards: formatAndSort(cardsMap),
      saves: formatAndSort(savesMap),
    };
  }, [matches, teamFlagMap, matchTeamMap]);

  const stats = tournamentStats[activeTab];

  const getTabEmptyMessage = () => {
    switch (activeTab) {
      case 'goals': return "No goals scored yet.";
      case 'assists': return "No assists recorded yet.";
      case 'cards': return "No cards issued yet.";
      case 'saves': return "No saves made yet.";
      default: return "No data available.";
    }
  };

  const getStatLabel = () => {
    switch (activeTab) {
      case 'goals': return "goals";
      case 'assists': return "assists";
      case 'cards': return "points";
      case 'saves': return "saves";
      default: return "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
        {STAT_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold tracking-wider rounded-md transition-colors ${
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
