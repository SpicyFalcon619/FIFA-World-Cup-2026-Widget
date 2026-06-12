import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Clock, MapPin, Award, Shield, ArrowDownUp } from 'lucide-react';
import { useWC2026Store, parseScorers } from '../../store/wc2026Store';
import { generateMatchStats, GeneratedMatchStats, TeamLineup, MatchLineupPlayer } from '../../lib/matchStatsGenerator';
import { PlayerAvatar } from '../layout/PlayerAvatar';

const STADIUMS: Record<number, string> = {
  1: 'SoFi Stadium · Los Angeles',
  2: 'Rose Bowl · Los Angeles',
  3: "Levi's Stadium · San Francisco",
  4: 'MetLife Stadium · New York / New Jersey',
  5: 'Lincoln Financial Field · Philadelphia',
  6: 'Gillette Stadium · Boston',
  7: 'AT&T Stadium · Dallas',
  8: 'NRG Stadium · Houston',
  9: 'State Farm Stadium · Phoenix',
  10: 'Arrowhead Stadium · Kansas City',
  11: 'Estadio Azteca · Mexico City',
  12: 'Estadio Akron · Guadalajara',
  13: 'Estadio BBVA · Monterrey',
  14: 'BC Place · Vancouver',
  15: 'BMO Field · Toronto',
  16: 'Stade Olympique · Montreal',
};

function parseKickoff(dateStr: string): string {
  if (!dateStr) return '';
  const [datePart, timePart] = dateStr.split(' ');
  if (!datePart) return dateStr;
  const [month, day, year] = datePart.split('/');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = parseInt(month, 10) - 1;
  return `${day} ${months[m] ?? ''} ${year}  ${timePart ?? ''}`;
}

function formatStageLabel(stage: string, group: string): string {
  switch (stage) {
    case 'GROUP': return `Group ${group}  ·  Group Stage`;
    case 'R32': return 'Round of 32';
    case 'R16': return 'Round of 16';
    case 'QF': return 'Quarter-Final';
    case 'SF': return 'Semi-Final';
    case 'THIRD': return 'Third Place Play-off';
    case 'F': return 'Final';
    default: return stage;
  }
}

function GoalLine({ name, minute, align }: { name: string; minute: string; align: 'left' | 'right' }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] text-white/75 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] shrink-0" />
      <span className="font-medium">{name}</span>
      <span className="text-white/35 font-mono text-[10px]">{minute}</span>
    </div>
  );
}

function TeamBlock({ flag, name, onClick }: { flag: string; name: string; onClick: () => void }) {
  const isTBD = !name || name === 'TBD' || /winner|runner|group|tbd/i.test(name);
  
  if (isTBD) {
    return (
      <div className="flex flex-col items-center gap-2 flex-1 opacity-60">
        {flag ? (
          <img src={flag} alt={name} className="w-14 h-14 object-contain drop-shadow-xl" />
        ) : (
          <div className="w-14 h-10 rounded-md bg-white/10" />
        )}
        <span className="text-sm font-bold text-center leading-tight">{name}</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 flex-1 hover:opacity-80 transition-opacity active:scale-95"
    >
      {flag
        ? <img src={flag} alt={name} className="w-14 h-14 object-contain drop-shadow-xl" />
        : <div className="w-14 h-10 rounded-md bg-white/10" />}
      <span className="text-sm font-bold text-center leading-tight">{name}</span>
    </button>
  );
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl"
      style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
      <span className="text-[var(--accent-gold)] shrink-0">{icon}</span>
      <span className="text-sm text-white/75">{text}</span>
    </div>
  );
}

function FormationPitch({ home, away }: { home: TeamLineup, away: TeamLineup }) {
  // Map formation string to rows, e.g. "4-2-3-1" -> [1, 4, 2, 3, 1]
  const parseFormation = (fmt: string) => [1, ...fmt.split('-').map(Number)];

  const homeRows = parseFormation(home.formation);
  const awayRows = parseFormation(away.formation);

  // Group players by row
  const groupPlayers = (lineup: TeamLineup, rows: number[]) => {
    const players = [...lineup.startingXI];
    const grouped: MatchLineupPlayer[][] = [];
    rows.forEach(count => {
      grouped.push(players.splice(0, count));
    });
    return grouped; // [ [GK], [DEF...], [MID...], [FWD...] ]
  };

  const homeGrouped = groupPlayers(home, homeRows);
  const awayGrouped = groupPlayers(away, awayRows);

  const renderPlayerChip = (p: MatchLineupPlayer) => {
    // Determine color coding for rating
    let ratingColor = 'bg-yellow-500'; // 6.0 - 7.0
    if (p.rating >= 7.5) ratingColor = 'bg-green-500';
    else if (p.rating < 5.5) ratingColor = 'bg-slate-600'; // Changed from red so it's not mistaken for a red card!

    return (
      <div key={p.name} className="flex flex-col items-center justify-center relative w-12 group">
        <div className="relative">
          <PlayerAvatar name={p.name} size="sm" />
          {/* Rating Badge */}
          <div className={`absolute -bottom-1 -right-1 w-5 h-3.5 flex items-center justify-center rounded-[3px] text-[8px] font-black shadow-sm text-white ${ratingColor}`}>
            {p.rating.toFixed(1)}
          </div>
          {/* Card/Goal indicators */}
          {(p.goals > 0 || p.redCard || p.yellowCard || p.assists > 0) && (
            <div className="absolute -top-1 -right-1 flex gap-0.5">
              {p.goals > 0 && <span className="text-[10px]" title="Goal">⚽</span>}
              {p.redCard && <div className="w-2 h-3 bg-red-600 rounded-sm shadow-sm" />}
              {p.yellowCard && !p.redCard && <div className="w-2 h-3 bg-amber-400 rounded-sm shadow-sm" />}
            </div>
          )}
        </div>
        <div className="mt-1 flex flex-col items-center">
          <span className="text-[9px] font-black text-white drop-shadow-md truncate w-14 text-center">
            {p.name.split(' ').pop()}
          </span>
        </div>
      </div>
    );
  };

  const renderHalf = (grouped: MatchLineupPlayer[][], isHome: boolean) => {
    // Home attacks down (renders top to center). Away attacks up (bottom to center).
    // The pitch height is 100%. Half is 50%.
    return (
      <div className={`absolute left-0 right-0 h-1/2 flex flex-col justify-between ${isHome ? 'top-0' : 'bottom-0 flex-col-reverse'}`} style={{ padding: '4% 0' }}>
        {grouped.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-around items-center w-full px-4">
            {row.map(p => renderPlayerChip(p))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full aspect-[2/3] max-h-[500px] bg-[#2a5d34] rounded-lg overflow-hidden border-2 border-white/20 shadow-inner flex shrink-0">
      {/* Pitch Lines */}
      {/* Outer boundary */}
      <div className="absolute inset-2 border-2 border-white/30 rounded-sm pointer-events-none" />
      
      {/* Center Line */}
      <div className="absolute top-1/2 left-2 right-2 h-[2px] bg-white/30 -translate-y-1/2 pointer-events-none" />
      {/* Center Circle */}
      <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      {/* Center Dot */}
      <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Top Penalty Box */}
      <div className="absolute top-2 left-1/2 w-[50%] h-[15%] border-2 border-t-0 border-white/30 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-2 left-1/2 w-[25%] h-[6%] border-2 border-t-0 border-white/30 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-[17%] left-1/2 w-12 h-6 border-2 border-white/30 rounded-b-full -translate-x-1/2 pointer-events-none" style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)', top: '14%' }} />

      {/* Bottom Penalty Box */}
      <div className="absolute bottom-2 left-1/2 w-[50%] h-[15%] border-2 border-b-0 border-white/30 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-2 left-1/2 w-[25%] h-[6%] border-2 border-b-0 border-white/30 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-[17%] left-1/2 w-12 h-6 border-2 border-white/30 rounded-t-full -translate-x-1/2 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', bottom: '14%' }} />

      {/* Players */}
      {renderHalf(homeGrouped, true)}
      {renderHalf(awayGrouped, false)}
    </div>
  );
}

function BenchList({ home, away }: { home: TeamLineup, away: TeamLineup }) {
  const renderRow = (p: MatchLineupPlayer) => {
    let ratingColor = 'text-yellow-400';
    if (p.rating >= 7.5) ratingColor = 'text-green-400';
    else if (p.rating < 5.5) ratingColor = 'text-red-400';

    return (
      <div key={p.name} className="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">
        <PlayerAvatar name={p.name} size="xs" />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs font-medium text-white/90 truncate">{p.name}</span>
          <div className="flex items-center gap-1.5 text-[9px] text-white/40">
            <span>{p.position}</span>
            {p.goals > 0 && <span className="text-[10px]">⚽</span>}
            {p.assists > 0 && <span>+1 Ast</span>}
          </div>
        </div>
        <div className={`text-[10px] font-black ${ratingColor} bg-white/5 px-1.5 py-0.5 rounded`}>
          {p.rating.toFixed(1)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col mt-4 bg-white/5 rounded-xl p-3 border border-white/10">
      <div className="text-center font-black uppercase text-[10px] text-white/40 mb-3 tracking-widest">Substitutes</div>
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <div className="text-[10px] font-bold text-white/60 mb-1 border-b border-white/10 pb-1 text-center">Home</div>
          {home.substitutes.slice(0, 7).map(renderRow)}
        </div>
        <div className="w-[1px] bg-white/10 shrink-0" />
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <div className="text-[10px] font-bold text-white/60 mb-1 border-b border-white/10 pb-1 text-center">Away</div>
          {away.substitutes.slice(0, 7).map(renderRow)}
        </div>
      </div>
    </div>
  );
}

function LineupsTab({ stats }: { stats: GeneratedMatchStats }) {
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex justify-between items-center px-2 mb-1">
        <div className="text-[10px] font-black tracking-widest text-white/50 uppercase">Home ({stats.home.formation})</div>
        <div className="text-[10px] font-black tracking-widest text-white/50 uppercase">Away ({stats.away.formation})</div>
      </div>
      <FormationPitch home={stats.home} away={stats.away} />
      <BenchList home={stats.home} away={stats.away} />
    </div>
  );
}

function StatsTab({ stats }: { stats: GeneratedMatchStats }) {
  return (
    <div className="flex flex-col gap-3.5 px-1 py-1">
      {stats.stats.map(item => {
        const hValStr = item.home.toString();
        const aValStr = item.away.toString();
        return (
          <div key={item.label} className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="tabular-nums text-white/90">{hValStr}</span>
              <span className="text-[10px] font-bold text-white/35 uppercase tracking-wider">{item.label}</span>
              <span className="tabular-nums text-white/90">{aValStr}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-[var(--accent-gold)] transition-all duration-500"
                style={{ width: `${item.homePercent}%` }}
              />
              <div 
                className="h-full bg-white/40 transition-all duration-500"
                style={{ width: `${item.awayPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelineTab({ stats }: { stats: GeneratedMatchStats }) {
  if (stats.timeline.length === 0) {
    return (
      <div className="text-center text-white/30 py-8 text-xs">
        No events in this match yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pl-1 py-1">
      {stats.timeline.map((event, idx) => {
        const isHome = event.team === 'home';
        
        return (
          <div 
            key={idx} 
            className={`flex items-center gap-2.5 text-xs ${isHome ? '' : 'flex-row-reverse text-right'}`}
          >
            {/* Minute indicator */}
            <span className="font-mono text-[10px] font-black text-[var(--accent-gold)] w-7 shrink-0 text-center bg-white/5 py-0.5 rounded">
              {event.minute}'
            </span>

            {/* Player Avatar */}
            <PlayerAvatar name={event.player} size="xs" />

            {/* Icon & Event Details */}
            <div className={`flex flex-col flex-1 min-w-0 ${isHome ? 'items-start' : 'items-end'}`}>
              <div className={`flex items-center gap-1.5 ${isHome ? '' : 'flex-row-reverse'}`}>
                {event.type === 'goal' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] shrink-0" />
                )}
                {event.type === 'card' && (
                  <div className={`w-2 h-3 rounded-sm shrink-0 ${event.detail.includes("Yellow") ? 'bg-amber-400' : 'bg-red-500'}`} />
                )}
                {event.type === 'save' && (
                  <Shield size={11} className="text-sky-400 shrink-0" />
                )}
                {event.type === 'sub' && (
                  <ArrowDownUp size={11} className="text-[var(--accent-green)] shrink-0" />
                )}

                <span className="font-bold truncate text-white/90">{event.player}</span>
              </div>
              <span className="text-[10px] text-white/40 font-medium truncate">{event.detail}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MatchDetailSheet() {
  const { selectedMatch, setSelectedMatch, setSelectedTeam } = useWC2026Store();
  const [activeTab, setActiveTab] = useState<'overview' | 'lineups' | 'stats' | 'timeline'>('overview');

  const isTBD = !selectedMatch?.homeTeam || 
                !selectedMatch?.awayTeam || 
                selectedMatch?.homeTeam === 'TBD' || 
                selectedMatch?.awayTeam === 'TBD' ||
                /winner|runner|group|tbd/i.test(selectedMatch?.homeTeam ?? '') || 
                /winner|runner|group|tbd/i.test(selectedMatch?.awayTeam ?? '');

  // Reset active tab when match changes — MUST be before any conditional return
  useEffect(() => {
    setActiveTab('overview');
  }, [selectedMatch?.id]);

  // Generate deterministic stats & lineups — MUST be before conditional return (Rules of Hooks)
  const matchStats = useMemo(() => {
    if (!selectedMatch || isTBD) return null;
    return generateMatchStats(selectedMatch);
  }, [selectedMatch?.id, selectedMatch?.status, selectedMatch?.minute, selectedMatch?.homeScore, selectedMatch?.awayScore, isTBD]);

  if (!selectedMatch) return null;

  const hasTimelineAndStats = !isTBD && (selectedMatch.status === 'FINISHED' || selectedMatch.status === 'LIVE');

  const stadium = STADIUMS[selectedMatch.stadiumId] ?? `Stadium ${selectedMatch.stadiumId}`;
  const kickoff = parseKickoff(selectedMatch.utcKickoff);
  const stageLabel = formatStageLabel(selectedMatch.stage, selectedMatch.group);

  const homeGoals = parseScorers(selectedMatch.homeScorers);
  const awayGoals = parseScorers(selectedMatch.awayScorers);
  const hasGoals = homeGoals.length > 0 || awayGoals.length > 0;

  return (
    <AnimatePresence>
      {selectedMatch && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setSelectedMatch(null)}
            className="absolute inset-0 bg-black/55 z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 480, damping: 42 }}
            className="absolute bottom-0 left-0 right-0 z-50 rounded-t-2xl"
            style={{
              background: 'rgba(13, 15, 22, 0.98)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderBottom: 'none',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-2.5">
              <div className="w-9 h-1 rounded-full bg-white/15" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-2 pb-2.5 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                {selectedMatch.status === 'LIVE' ? (
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                ) : selectedMatch.status === 'FINISHED' ? (
                  <Award size={13} className="text-[var(--accent-gold)]" />
                ) : (
                  <Clock size={13} className="text-[var(--accent-gold)]" />
                )}
                <span className="text-[11px] font-bold tracking-widest text-white/45 uppercase">
                  {selectedMatch.status === 'LIVE' 
                    ? `Live Match · ${selectedMatch.minute}'` 
                    : selectedMatch.status === 'FINISHED' 
                      ? 'Match Result' 
                      : 'Match Preview'}
                </span>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="p-1.5 rounded-lg hover:bg-white/8 transition-colors text-white/40 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            {/* Match Banner Info */}
            <div className="px-4 pt-4 pb-2 flex flex-col gap-3">
              <div className="text-center text-[10px] font-bold tracking-widest text-[var(--accent-gold)] uppercase">
                {stageLabel}
              </div>

              <div className="flex items-center justify-between gap-2 px-2">
                <TeamBlock
                  flag={selectedMatch.homeFlag} name={selectedMatch.homeTeam}
                  onClick={() => { setSelectedMatch(null); setTimeout(() => setSelectedTeam(selectedMatch.homeTeam), 150); }}
                />
                <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                  {(selectedMatch.status === 'FINISHED' || selectedMatch.status === 'LIVE') && !isTBD ? (
                    <>
                      <span className="text-3xl font-black tracking-tight tabular-nums">
                        {selectedMatch.homeScore ?? 0} – {selectedMatch.awayScore ?? 0}
                      </span>
                      <span className={`text-[9px] tracking-widest font-bold px-2 py-0.5 rounded-full uppercase border ${
                        selectedMatch.status === 'LIVE' 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' 
                          : 'bg-white/8 text-white/50 border-white/10'
                      }`}>
                        {selectedMatch.status === 'LIVE' ? 'Live' : 'Full Time'}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/25 text-xl font-thin tracking-widest">VS</span>
                  )}
                </div>
                <TeamBlock
                  flag={selectedMatch.awayFlag} name={selectedMatch.awayTeam}
                  onClick={() => { setSelectedMatch(null); setTimeout(() => setSelectedTeam(selectedMatch.awayTeam), 150); }}
                />
              </div>
            </div>

            {/* Tab Selector */}
            {!isTBD && (
              <div className="flex gap-1 bg-black/20 p-1 mx-4 rounded-lg">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-1 text-[10px] font-bold tracking-wider rounded-md transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-[var(--bg-glass)] text-white shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-white'
                  }`}
                >
                  OVERVIEW
                </button>
                <button
                  onClick={() => setActiveTab('lineups')}
                  className={`flex-1 py-1 text-[10px] font-bold tracking-wider rounded-md transition-colors ${
                    activeTab === 'lineups'
                      ? 'bg-[var(--bg-glass)] text-white shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-white'
                  }`}
                >
                  LINEUPS
                </button>
                {hasTimelineAndStats && (
                  <>
                    <button
                      onClick={() => setActiveTab('stats')}
                      className={`flex-1 py-1 text-[10px] font-bold tracking-wider rounded-md transition-colors ${
                        activeTab === 'stats'
                          ? 'bg-[var(--bg-glass)] text-white shadow-sm'
                          : 'text-[var(--text-muted)] hover:text-white'
                      }`}
                    >
                      STATS
                    </button>
                    <button
                      onClick={() => setActiveTab('timeline')}
                      className={`flex-1 py-1 text-[10px] font-bold tracking-wider rounded-md transition-colors ${
                        activeTab === 'timeline'
                          ? 'bg-[var(--bg-glass)] text-white shadow-sm'
                          : 'text-[var(--text-muted)] hover:text-white'
                      }`}
                    >
                      TIMELINE
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Tab Contents */}
            <div className="p-4 max-h-[48vh] overflow-y-auto overscroll-contain custom-scrollbar">
              {activeTab === 'overview' && (
                <div className="flex flex-col gap-4">
                  {hasGoals && !isTBD && (
                    <div className="rounded-xl overflow-hidden"
                      style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
                      <div className="px-3 py-2 border-b border-white/5">
                        <span className="text-[10px] font-bold tracking-widest text-white/35 uppercase">Goals</span>
                      </div>
                      <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                        <div className="flex flex-col gap-1.5">
                          {homeGoals.map((g, i) => <GoalLine key={i} name={g.name} minute={g.minute} align="left" />)}
                        </div>
                        <div className="flex flex-col gap-1.5 items-end">
                          {awayGoals.map((g, i) => <GoalLine key={i} name={g.name} minute={g.minute} align="right" />)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {selectedMatch.status !== 'FINISHED' && selectedMatch.status !== 'LIVE' && (
                      <InfoRow icon={<Clock size={13} />} text={kickoff} />
                    )}
                    <InfoRow icon={<MapPin size={13} />} text={stadium} />
                  </div>
                </div>
              )}

              {!isTBD && activeTab === 'lineups' && matchStats && <LineupsTab stats={matchStats} />}

              {!isTBD && activeTab === 'stats' && hasTimelineAndStats && matchStats && <StatsTab stats={matchStats} />}

              {!isTBD && activeTab === 'timeline' && hasTimelineAndStats && matchStats && <TimelineTab stats={matchStats} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
