import { Match } from '../../store/wc2026Store';
import { MinuteClock } from './MinuteClock';

const PlaceholderCrest = ({ className = "" }: { className?: string }) => (
  <div className={`rounded-[2px] bg-white/20 blur-[1px] shadow-sm border border-white/10 ${className}`} />
);

export function LiveMatchCard({ match }: { match: Match }) {
  return (
    <div 
      className="p-4 mb-3 rounded-xl relative overflow-hidden shadow-[0_0_20px_rgba(0,200,122,0.1)]"
      style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-glass)',
      }}
    >
      <div className="flex items-center justify-between z-10 relative">
        <div className="flex flex-col items-center gap-2 flex-1">
          {match.homeFlag ? (
            <img src={match.homeFlag} alt={match.homeTeam} className="w-10 h-10 object-contain drop-shadow-md" />
          ) : (
            <PlaceholderCrest className="w-10 h-8" />
          )}
          <span className="font-semibold text-sm text-center">{match.homeTeam || "TBD"}</span>
          {match.homeRedCards > 0 && (
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: match.homeRedCards }).map((_, i) => (
                <span key={i} className="w-2.5 h-3.5 bg-red-600 rounded-[2px]" />
              ))}
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center justify-center flex-none px-4">
          <span className="text-4xl font-bold tracking-wider tabular-nums">
            {match.homeScore ?? 0} - {match.awayScore ?? 0}
          </span>
          <MinuteClock minute={match.minute} />
        </div>
        
        <div className="flex flex-col items-center gap-2 flex-1">
          {match.awayFlag ? (
            <img src={match.awayFlag} alt={match.awayTeam} className="w-10 h-10 object-contain drop-shadow-md" />
          ) : (
            <PlaceholderCrest className="w-10 h-8" />
          )}
          <span className="font-semibold text-sm text-center">{match.awayTeam || "TBD"}</span>
          {match.awayRedCards > 0 && (
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: match.awayRedCards }).map((_, i) => (
                <span key={i} className="w-2.5 h-3.5 bg-red-600 rounded-[2px]" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
