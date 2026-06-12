import { useState, useEffect } from 'react';
import { useWC2026Store } from '../../store/wc2026Store';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MinuteClock } from '../scoreboard/MinuteClock';

export function CompactLiveWidget() {
  const liveGames = useWC2026Store(s => s.liveGames);
  const matches = useWC2026Store(s => s.matches);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pulse, setPulse] = useState(true);

  // Find next upcoming match too
  const upcomingMatches = matches.filter(m => m.status === 'SCHEDULED').slice(0, 3);

  // Clamp index if games change
  useEffect(() => {
    if (currentIndex >= liveGames.length && liveGames.length > 0) {
      setCurrentIndex(liveGames.length - 1);
    }
  }, [liveGames.length, currentIndex]);

  // Pulse animation interval
  useEffect(() => {
    const iv = setInterval(() => setPulse(p => !p), 900);
    return () => clearInterval(iv);
  }, []);

  const handlePrev = () =>
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : liveGames.length - 1));
  const handleNext = () =>
    setCurrentIndex((prev) => (prev < liveGames.length - 1 ? prev + 1 : 0));

  if (liveGames.length === 0) {
    // Show "No live games" with next upcoming match info
    const next = upcomingMatches[0];
    return (
      <div
        className="flex flex-col h-full w-full relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(10,11,18,0.97) 0%, rgba(20,16,8,0.97) 100%)',
          borderRadius: '12px',
        }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(245,184,0,0.08) 0%, transparent 65%)',
          }}
        />

        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4 relative z-10">
          <div
            className="text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(245,184,0,0.08)',
              border: '1px solid rgba(245,184,0,0.2)',
              color: 'rgba(245,184,0,0.6)',
            }}
          >
            ⚽ No Live Matches
          </div>

          {next ? (
            <div className="flex flex-col items-center gap-1.5 mt-1">
              <span className="text-[9px] text-white/30 uppercase tracking-widest">Next up</span>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-0.5">
                  {next.homeFlag && (
                    <img src={next.homeFlag} alt={next.homeTeam} className="w-6 h-6 object-contain drop-shadow-md" />
                  )}
                  <span className="text-[8px] font-bold text-white/70 uppercase">{next.homeTeam?.slice(0, 3)}</span>
                </div>
                <span className="text-white/25 text-[10px] font-light">vs</span>
                <div className="flex flex-col items-center gap-0.5">
                  {next.awayFlag && (
                    <img src={next.awayFlag} alt={next.awayTeam} className="w-6 h-6 object-contain drop-shadow-md" />
                  )}
                  <span className="text-[8px] font-bold text-white/70 uppercase">{next.awayTeam?.slice(0, 3)}</span>
                </div>
              </div>
            </div>
          ) : (
            <span className="text-[9px] text-white/30 mt-1">Check back soon</span>
          )}
        </div>

        {/* Bottom accent line */}
        <div
          className="h-[2px] w-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(245,184,0,0.3), transparent)',
          }}
        />
      </div>
    );
  }

  const match = liveGames[Math.min(currentIndex, liveGames.length - 1)];
  if (!match) return null;

  return (
    <div
      className="flex flex-col h-full w-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(10,11,18,0.97) 0%, rgba(20,16,8,0.97) 100%)',
        borderRadius: '12px',
      }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(245,184,0,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Top: LIVE badge + minute */}
      <div className="flex items-center justify-between px-3 pt-2 pb-0 relative z-10">
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#ef4444',
              boxShadow: pulse ? '0 0 5px #ef4444' : '0 0 2px #ef4444',
              transition: 'box-shadow 0.45s ease',
            }}
          />
          <span
            className="text-[9px] font-black tracking-[0.18em] uppercase"
            style={{ color: '#ef4444' }}
          >
            Live
          </span>
        </div>
        <MinuteClock minute={match.minute} />
        {liveGames.length > 1 && (
          <span className="text-[9px] text-white/25">{currentIndex + 1}/{liveGames.length}</span>
        )}
      </div>

      {/* Main Score Row */}
      <div className="flex-1 flex items-center justify-between px-3 gap-2 relative z-10">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center p-1.5"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {match.homeFlag ? (
              <img src={match.homeFlag} alt={match.homeTeam} className="w-full h-full object-contain drop-shadow-md" />
            ) : (
              <div className="w-full h-full rounded-full bg-white/10" />
            )}
          </div>
          <span
            className="font-black text-[9px] uppercase tracking-wide text-center truncate w-full px-1"
            style={{ color: 'rgba(255,255,255,0.8)' }}
            title={match.homeTeam}
          >
            {match.homeTeam}
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center justify-center min-w-[56px]">
          <div
            className="text-[28px] font-black tabular-nums tracking-tight leading-none"
            style={{
              color: '#ffffff',
              textShadow: '0 0 20px rgba(245,184,0,0.3)',
            }}
          >
            {match.homeScore ?? 0}–{match.awayScore ?? 0}
          </div>
          <div
            className="text-[7px] uppercase tracking-[0.15em] font-bold mt-0.5"
            style={{ color: 'rgba(245,184,0,0.5)' }}
          >
            {match.stage === 'GROUP' ? `Grp ${match.group}` : match.stage}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center p-1.5"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {match.awayFlag ? (
              <img src={match.awayFlag} alt={match.awayTeam} className="w-full h-full object-contain drop-shadow-md" />
            ) : (
              <div className="w-full h-full rounded-full bg-white/10" />
            )}
          </div>
          <span
            className="font-black text-[9px] uppercase tracking-wide text-center truncate w-full px-1"
            style={{ color: 'rgba(255,255,255,0.8)' }}
            title={match.awayTeam}
          >
            {match.awayTeam}
          </span>
        </div>
      </div>

      {/* Navigation row & dots */}
      {liveGames.length > 1 && (
        <div className="flex items-center justify-center gap-3 pb-2 relative z-10">
          <button
            onClick={handlePrev}
            className="p-1 rounded-full text-white/30 hover:text-white/70 transition-colors"
          >
            <ChevronLeft size={12} />
          </button>
          <div className="flex gap-1">
            {liveGames.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className="transition-all duration-200"
                style={{
                  width: idx === currentIndex ? '14px' : '5px',
                  height: '5px',
                  borderRadius: '9999px',
                  background: idx === currentIndex ? 'rgba(245,184,0,0.8)' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="p-1 rounded-full text-white/30 hover:text-white/70 transition-colors"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      )}

      {/* Bottom accent line */}
      <div
        className="h-[2px] w-full absolute bottom-0 left-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(245,184,0,0.4), transparent)',
        }}
      />
    </div>
  );
}
