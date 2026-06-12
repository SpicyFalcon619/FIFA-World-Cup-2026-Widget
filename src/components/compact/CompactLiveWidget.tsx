import { useState } from 'react';
import { useWC2026Store } from '../../store/wc2026Store';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MinuteClock } from '../scoreboard/MinuteClock';

export function CompactLiveWidget() {
  const liveGames = useWC2026Store(s => s.liveGames);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (liveGames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[var(--bg-card)]">
        <span className="text-[var(--text-muted)] text-sm">No live matches</span>
      </div>
    );
  }

  const match = liveGames[currentIndex];
  
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : liveGames.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < liveGames.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-[var(--bg-card)]">
      {/* Navigation Controls (Only show if multiple live games) */}
      {liveGames.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Match Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-2">
          {match.status === 'LIVE' ? (
            <MinuteClock minute={match.minute} />
          ) : (
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-sm bg-white/10 text-white/80 uppercase">
              {match.status}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-6 w-full px-8">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center p-1">
              <img src={match.homeFlag} alt={match.homeTeam} className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-[10px] uppercase text-center truncate w-full" title={match.homeTeam}>
              {match.homeTeam}
            </span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center justify-center min-w-[60px]">
            <div className="text-3xl font-black tracking-tighter tabular-nums drop-shadow-md">
              {match.homeScore ?? 0} - {match.awayScore ?? 0}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center p-1">
              <img src={match.awayFlag} alt={match.awayTeam} className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-[10px] uppercase text-center truncate w-full" title={match.awayTeam}>
              {match.awayTeam}
            </span>
          </div>
        </div>
      </div>
      
      {/* Indicator Dots */}
      {liveGames.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {liveGames.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-[var(--accent-gold)]' : 'bg-white/20'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
