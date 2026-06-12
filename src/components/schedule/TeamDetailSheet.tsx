import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Shield, Users, Activity } from 'lucide-react';
import { useWC2026Store } from '../../store/wc2026Store';
import { squads } from '../../store/squadData';
import { PlayerAvatar } from '../layout/PlayerAvatar';

function StatPill({ label, value }: { label: string; value: number | string }) {

  return (
    <div className="flex flex-col items-center gap-0.5 flex-1">
      <span className="text-lg font-black text-white tabular-nums">{value}</span>
      <span className="text-[9px] uppercase tracking-widest text-white/35 font-medium">{label}</span>
    </div>
  );
}

function MatchRow({ homeTeam, awayTeam, homeFlag, awayFlag, homeScore, awayScore, status, focusTeam }: {
  homeTeam: string; awayTeam: string;
  homeFlag: string; awayFlag: string;
  homeScore: number | null; awayScore: number | null;
  status: string; focusTeam: string;
}) {
  const isHome = homeTeam === focusTeam;
  const opponent = isHome ? awayTeam : homeTeam;
  const opponentFlag = isHome ? awayFlag : homeFlag;
  const teamScore = isHome ? homeScore : awayScore;
  const oppScore = isHome ? awayScore : homeScore;

  let resultColor = 'text-white/50';
  let resultLabel = 'vs';
  if (status === 'FINISHED' && teamScore !== null && oppScore !== null) {
    if (teamScore > oppScore) { resultColor = 'text-[var(--accent-green)]'; resultLabel = 'W'; }
    else if (teamScore < oppScore) { resultColor = 'text-red-400'; resultLabel = 'L'; }
    else { resultColor = 'text-white/60'; resultLabel = 'D'; }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl"
      style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {opponentFlag
          ? <img src={opponentFlag} alt={opponent} className="w-7 h-7 object-contain shrink-0" />
          : <div className="w-7 h-5 rounded bg-white/10 shrink-0" />}
        <span className="text-sm font-medium truncate">{opponent}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {status === 'FINISHED' && teamScore !== null && oppScore !== null ? (
          <>
            <span className="text-sm font-bold tabular-nums">{teamScore} – {oppScore}</span>
            <span className={`text-[10px] font-bold w-5 text-center ${resultColor}`}>{resultLabel}</span>
          </>
        ) : (
          <span className="text-[11px] text-white/40 font-medium">Upcoming</span>
        )}
      </div>
    </div>
  );
}

export function TeamDetailSheet() {
  const { selectedTeam, setSelectedTeam, matches, groups } = useWC2026Store();
  const [activeTab, setActiveTab] = useState<'overview' | 'squad'>('overview');

  if (!selectedTeam) return null;

  // Find standing from groups
  let standing = null as null | {
    position: number; played: number; won: number; drawn: number; lost: number;
    gf: number; ga: number; gd: number; points: number; groupName: string; flag: string;
  };
  for (const g of groups) {
    const s = g.standings.find(st => st.team === selectedTeam);
    if (s) { standing = { ...s, groupName: g.name }; break; }
  }

  // Find team flag from matches
  const teamMatch = matches.find(m => m.homeTeam === selectedTeam || m.awayTeam === selectedTeam);
  const teamFlag = teamMatch
    ? (teamMatch.homeTeam === selectedTeam ? teamMatch.homeFlag : teamMatch.awayFlag)
    : standing?.flag ?? '';

  // All matches for this team
  const teamMatches = matches.filter(m => m.homeTeam === selectedTeam || m.awayTeam === selectedTeam);
  const played = teamMatches.filter(m => m.status === 'FINISHED');
  const upcoming = teamMatches.filter(m => m.status !== 'FINISHED');

  return (
    <AnimatePresence>
      {selectedTeam && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setSelectedTeam(null)}
            className="absolute inset-0 bg-black/55 z-40"
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
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
            <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                {teamFlag
                  ? <img src={teamFlag} alt={selectedTeam} className="w-10 h-10 object-contain drop-shadow-lg" />
                  : <Shield size={20} className="text-white/40" />}
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{selectedTeam}</span>
                  {standing && (
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">
                      Group {standing.groupName} · Rank #{standing.position}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="p-1.5 rounded-lg hover:bg-white/8 transition-colors text-white/40 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-black/20 p-1 mx-4 mt-3 rounded-lg">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-wider rounded-md transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-[var(--bg-glass)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                <Activity size={11} /> OVERVIEW
              </button>
              <button
                onClick={() => setActiveTab('squad')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-wider rounded-md transition-colors ${
                  activeTab === 'squad'
                    ? 'bg-[var(--bg-glass)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                <Users size={11} /> SQUAD
              </button>
            </div>

            <div className="p-4 max-h-[65vh] overflow-y-auto overscroll-contain custom-scrollbar flex flex-col gap-4">
              {activeTab === 'overview' ? (
                <>
                  {/* Standing stats */}
                  {standing && (
                    <div className="rounded-xl overflow-hidden"
                      style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
                      <div className="px-3 py-2 border-b border-white/5">
                        <span className="text-[10px] font-bold tracking-widest text-white/35 uppercase">Group Standing</span>
                      </div>
                      <div className="flex gap-2 px-3 py-3">
                        <StatPill label="P" value={standing.played} />
                        <StatPill label="W" value={standing.won} />
                        <StatPill label="D" value={standing.drawn} />
                        <StatPill label="L" value={standing.lost} />
                        <StatPill label="GF" value={standing.gf} />
                        <StatPill label="GA" value={standing.ga} />
                        <StatPill label="GD" value={standing.gd >= 0 ? `+${standing.gd}` : standing.gd} />
                        <StatPill label="PTS" value={standing.points} />
                      </div>
                    </div>
                  )}

                  {/* Played matches */}
                  {played.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold tracking-widest text-white/35 uppercase px-1">Results</span>
                      {played.map(m => (
                        <MatchRow key={m.id}
                          homeTeam={m.homeTeam} awayTeam={m.awayTeam}
                          homeFlag={m.homeFlag} awayFlag={m.awayFlag}
                          homeScore={m.homeScore} awayScore={m.awayScore}
                          status={m.status} focusTeam={selectedTeam}
                        />
                      ))}
                    </div>
                  )}

                  {/* Upcoming matches */}
                  {upcoming.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold tracking-widest text-white/35 uppercase px-1">Upcoming</span>
                      {upcoming.map(m => (
                        <MatchRow key={m.id}
                          homeTeam={m.homeTeam} awayTeam={m.awayTeam}
                          homeFlag={m.homeFlag} awayFlag={m.awayFlag}
                          homeScore={null} awayScore={null}
                          status={m.status} focusTeam={selectedTeam}
                        />
                      ))}
                    </div>
                  )}

                  {teamMatches.length === 0 && (
                    <div className="text-center text-white/30 text-sm py-8">No matches found for this team.</div>
                  )}
                </>
              ) : (
                // Squad Tab
                <div className="flex flex-col gap-4">
                  {(() => {
                    const squad = squads[selectedTeam];
                    if (!squad) {
                      return (
                        <div className="text-center text-[var(--text-muted)] py-8 text-sm">
                          Squad data not available for this team.
                        </div>
                      );
                    }
                    
                    const gks = squad.players.filter(p => p.position === 'GK');
                    const defs = squad.players.filter(p => p.position === 'DEF');
                    const mids = squad.players.filter(p => p.position === 'MID');
                    const fwds = squad.players.filter(p => p.position === 'FWD');

                    const renderPositionGroup = (title: string, players: typeof gks) => (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold tracking-widest text-white/35 uppercase px-1">{title}</span>
                        <div className="grid grid-cols-2 gap-2">
                          {players.map(p => (
                            <div
                              key={p.number}
                              className="flex items-center gap-2 p-1.5 rounded-xl min-w-0"
                              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}
                            >
                              <PlayerAvatar name={p.name} size="sm" />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs font-bold text-white/95 truncate leading-snug">{p.name}</span>
                                <span className="text-[10px] font-mono font-bold text-[var(--accent-gold)] leading-none mt-0.5">
                                  #{p.number}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );

                    return (
                      <>
                        {/* Coach Pill */}
                        <div className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/8 flex items-center justify-center shrink-0 text-white/45">
                            <Users size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-wider text-white/35">Head Coach</span>
                            <span className="text-sm font-bold text-white/90">{squad.coach}</span>
                          </div>
                        </div>

                        {/* Player Groups */}
                        {gks.length > 0 && renderPositionGroup("Goalkeepers", gks)}
                        {defs.length > 0 && renderPositionGroup("Defenders", defs)}
                        {mids.length > 0 && renderPositionGroup("Midfielders", mids)}
                        {fwds.length > 0 && renderPositionGroup("Forwards", fwds)}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
