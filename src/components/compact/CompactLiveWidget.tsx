import { useState, useEffect } from 'react';
import { useWC2026Store, selectLiveGames } from '../../store/wc2026Store';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();

function formatStage(stage: string, group: string) {
  switch (stage) {
    case 'GROUP': return `Group ${group}`;
    case 'R32': return 'Rd of 32';
    case 'R16': return 'Rd of 16';
    case 'QF': return 'Quarter-Final';
    case 'SF': return 'Semi-Final';
    case 'THIRD': return '3rd Place';
    case 'F': return 'Final';
    default: return stage;
  }
}

function formatTime(utcKickoff: string): string {
  if (!utcKickoff) return '';
  try {
    const [datePart, timePart] = utcKickoff.split(' ');
    const [month, day] = datePart.split('/');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${day} ${months[parseInt(month, 10) - 1]}  ${timePart ?? ''}`;
  } catch {
    return utcKickoff;
  }
}

interface CompactWidgetProps {
  onExpand: () => void;
}

export function CompactLiveWidget({ onExpand }: CompactWidgetProps) {
  const liveGames = useWC2026Store(selectLiveGames);
  const matches = useWC2026Store(s => s.matches);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pulse, setPulse] = useState(true);

  const upcomingMatches = matches
    .filter(m => m.status === 'SCHEDULED' && m.homeTeam && m.awayTeam && m.homeTeam !== 'TBD' && m.awayTeam !== 'TBD')
    .slice(0, 3);

  useEffect(() => {
    if (currentIndex >= liveGames.length && liveGames.length > 0) {
      setCurrentIndex(liveGames.length - 1);
    }
  }, [liveGames.length, currentIndex]);

  useEffect(() => {
    const iv = setInterval(() => setPulse(p => !p), 900);
    return () => clearInterval(iv);
  }, []);

  const handlePrev = () =>
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : liveGames.length - 1));
  const handleNext = () =>
    setCurrentIndex(prev => (prev < liveGames.length - 1 ? prev + 1 : 0));

  const containerStyle: React.CSSProperties = {
    background: 'linear-gradient(160deg, #0d0f1a 0%, #111206 100%)',
    borderRadius: '14px',
    border: '1px solid rgba(245,184,0,0.18)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(245,184,0,0.06)',
  };

  // ── No live matches ──────────────────────────────────────
  if (liveGames.length === 0) {
    const next = upcomingMatches[0];
    const next2 = upcomingMatches[1];

    return (
      <div className="flex flex-col h-full w-full relative overflow-hidden" style={containerStyle}>
        {/* Gold radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(245,184,0,0.07) 0%, transparent 65%)',
        }} />

        {/* Header */}
        <div className="flex items-center justify-between px-3 pt-2.5 pb-0 relative z-10">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 18 18" className="w-3.5 h-3.5" fill="none">
              <defs>
                <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF2B2"/>
                  <stop offset="100%" stopColor="#F5B800"/>
                </linearGradient>
              </defs>
              <circle cx="9" cy="5.5" r="3.2" fill="url(#cg)"/>
              <path d="M5.5 8.5C5.5 8.5 7 10.5 9 10.5" stroke="url(#cg)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12.5 8.5C12.5 8.5 11 10.5 9 10.5" stroke="url(#cg)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M7.5 10L7.2 14.5H10.8L10.5 10" fill="url(#cg)"/>
              <path d="M5.5 14.5H12.5V16H5.5V14.5Z" fill="url(#cg)"/>
            </svg>
            <span className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: 'rgba(245,184,0,0.8)' }}>
              WC 2026
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <button onClick={onExpand} title="Expand" className="w-5 h-5 flex items-center justify-center rounded-md text-white/30 hover:text-white/70 hover:bg-white/8 transition-colors">
              <Maximize2 size={10} />
            </button>
            <button onClick={() => appWindow.hide()} title="Hide" className="w-5 h-5 flex items-center justify-center rounded-md text-white/30 hover:text-red-400 hover:bg-white/8 transition-colors">
              <X size={10} />
            </button>
          </div>
        </div>

        {/* No games label */}
        <div className="flex items-center justify-center px-3 pt-2 pb-1 relative z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{
            background: 'rgba(245,184,0,0.06)',
            border: '1px solid rgba(245,184,0,0.15)',
          }}>
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="text-[9px] font-bold tracking-widest uppercase text-white/40">No live matches</span>
          </div>
        </div>

        {/* Upcoming matches */}
        {next && (
          <div className="flex flex-col gap-1 px-3 pb-2.5 relative z-10 flex-1">
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/25 mb-0.5">Coming up</span>
            {[next, next2].filter(Boolean).map((m, i) => m && (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {m.homeFlag && <img src={m.homeFlag} alt="" className="w-4 h-4 object-contain shrink-0"/>}
                  <span className="text-[9px] font-bold text-white/75 truncate">{m.homeTeam}</span>
                </div>
                <span className="text-[8px] font-black text-white/20 shrink-0">VS</span>
                <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                  <span className="text-[9px] font-bold text-white/75 truncate text-right">{m.awayTeam}</span>
                  {m.awayFlag && <img src={m.awayFlag} alt="" className="w-4 h-4 object-contain shrink-0"/>}
                </div>
                <span className="text-[8px] font-mono text-white/30 shrink-0 ml-1">{formatTime(m.utcKickoff)}</span>
              </div>
            ))}
          </div>
        )}

        {!next && (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[9px] text-white/20">Check back soon</span>
          </div>
        )}

        <div className="h-[1px] w-full" style={{
          background: 'linear-gradient(90deg, transparent, rgba(245,184,0,0.25), transparent)',
        }} />
      </div>
    );
  }

  // ── Live match ───────────────────────────────────────────
  const match = liveGames[Math.min(currentIndex, liveGames.length - 1)];
  if (!match) return null;

  const minute = match.minute != null ? `${match.minute}'` : '';

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden" style={containerStyle}>
      {/* Gold radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 20%, rgba(245,184,0,0.07) 0%, transparent 65%)',
      }} />

      {/* Header row: LIVE + minute + controls */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-0 relative z-10">
        <div className="flex items-center gap-2">
          {/* Live badge */}
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{
              background: '#ef4444',
              boxShadow: pulse ? '0 0 6px #ef4444, 0 0 12px rgba(239,68,68,0.4)' : '0 0 2px #ef4444',
              transition: 'box-shadow 0.45s ease',
            }} />
            <span className="text-[9px] font-black tracking-[0.18em] uppercase" style={{ color: '#ef4444' }}>Live</span>
          </div>
          {/* Stage badge */}
          <span className="text-[8px] font-bold uppercase tracking-wider text-white/30">
            {formatStage(match.stage, match.group)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {minute && (
            <span className="font-mono text-[10px] font-bold text-white/50 mr-1">{minute}</span>
          )}
          <button onClick={onExpand} title="Expand" className="w-5 h-5 flex items-center justify-center rounded-md text-white/30 hover:text-[#F5B800] hover:bg-white/8 transition-colors">
            <Maximize2 size={10} />
          </button>
          <button onClick={() => appWindow.hide()} title="Hide" className="w-5 h-5 flex items-center justify-center rounded-md text-white/30 hover:text-red-400 hover:bg-white/8 transition-colors">
            <X size={10} />
          </button>
        </div>
      </div>

      {/* Main: Flags + Score */}
      <div className="flex-1 flex items-center justify-between px-4 gap-2 relative z-10">
        {/* Home */}
        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full flex items-center justify-center p-1.5" style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}>
            {match.homeFlag
              ? <img src={match.homeFlag} alt={match.homeTeam} className="w-full h-full object-contain drop-shadow-md" />
              : <div className="w-full h-full rounded-full bg-white/10" />}
          </div>
          <span className="font-black text-[10px] uppercase tracking-wide text-center truncate w-full px-1 text-white/85"
            title={match.homeTeam}>
            {match.homeTeam}
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center justify-center shrink-0 min-w-[60px]">
          <div className="text-[30px] font-black tabular-nums tracking-tight leading-none text-white"
            style={{ textShadow: '0 0 24px rgba(245,184,0,0.35)' }}>
            {match.homeScore ?? 0}–{match.awayScore ?? 0}
          </div>
          {match.homeRedCards > 0 || match.awayRedCards > 0 ? (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[8px] font-bold text-red-400">
                {match.homeRedCards > 0 ? `${match.homeRedCards} RED` : ''}
              </span>
              <span className="text-[8px] font-bold text-red-400">
                {match.awayRedCards > 0 ? `${match.awayRedCards} RED` : ''}
              </span>
            </div>
          ) : null}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full flex items-center justify-center p-1.5" style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}>
            {match.awayFlag
              ? <img src={match.awayFlag} alt={match.awayTeam} className="w-full h-full object-contain drop-shadow-md" />
              : <div className="w-full h-full rounded-full bg-white/10" />}
          </div>
          <span className="font-black text-[10px] uppercase tracking-wide text-center truncate w-full px-1 text-white/85"
            title={match.awayTeam}>
            {match.awayTeam}
          </span>
        </div>
      </div>

      {/* Pagination dots */}
      {liveGames.length > 1 && (
        <div className="flex items-center justify-center gap-2 pb-2.5 relative z-10">
          <button onClick={handlePrev} className="p-1 rounded-full text-white/25 hover:text-white/60 transition-colors">
            <ChevronLeft size={11} />
          </button>
          <div className="flex gap-1">
            {liveGames.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentIndex(idx)} className="transition-all duration-200" style={{
                width: idx === currentIndex ? '14px' : '5px',
                height: '5px',
                borderRadius: '9999px',
                background: idx === currentIndex ? 'rgba(245,184,0,0.85)' : 'rgba(255,255,255,0.18)',
              }} />
            ))}
          </div>
          <button onClick={handleNext} className="p-1 rounded-full text-white/25 hover:text-white/60 transition-colors">
            <ChevronRight size={11} />
          </button>
        </div>
      )}

      {/* Gold accent bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{
        background: 'linear-gradient(90deg, transparent, rgba(245,184,0,0.4), transparent)',
      }} />
    </div>
  );
}
