import { Match, useWC2026Store, parseScorers } from '../../store/wc2026Store';
import { CountdownBadge } from './CountdownBadge';
import { ChevronRight } from 'lucide-react';

const PlaceholderCrest = () => (
  <div className="w-[28px] h-[20px] rounded-[2px] skeleton-shimmer shadow-sm border border-white/10" />
);

function formatStage(stage: string) {
  switch (stage) {
    case 'GROUP': return 'Group Stage';
    case 'R32': return 'Round of 32';
    case 'R16': return 'Round of 16';
    case 'QF': return 'Quarter-Final';
    case 'SF': return 'Semi-Final';
    case 'THIRD': return '3rd Place';
    case 'F': return 'Final';
    default: return stage.replace(/_/g, ' ');
  }
}

export function MatchCard({ match }: { match: Match }) {
  const setSelectedMatch = useWC2026Store(s => s.setSelectedMatch);

  const homeName = match.homeTeam || 'TBD';
  const awayName = match.awayTeam || 'TBD';

  const isTBD = !match.homeTeam || 
                !match.awayTeam || 
                match.homeTeam === 'TBD' || 
                match.awayTeam === 'TBD' ||
                /winner|runner|group|tbd/i.test(match.homeTeam) || 
                /winner|runner|group|tbd/i.test(match.awayTeam);

  const stageText = formatStage(match.stage);
  const groupText = match.stage === 'GROUP' ? `Group ${match.group}` : '';
  const subtitle = [match.stage === 'GROUP' ? groupText : '', stageText].filter(Boolean).join(' · ');

  const homeGoals = parseScorers(match.homeScorers);
  const awayGoals = parseScorers(match.awayScorers);
  const hasScorers = homeGoals.length > 0 || awayGoals.length > 0;

  return (
    <div 
      className={`p-3 mb-2 rounded-xl transition-all ${
        isTBD 
          ? 'opacity-70 cursor-default' 
          : 'hover:bg-white/5 hover:border-white/20 group cursor-pointer'
      }`}
      style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-glass)',
      }}
      onClick={isTBD ? undefined : () => setSelectedMatch(match)}
    >
      <div className="text-[10px] text-[var(--text-muted)] mb-2 flex justify-between uppercase tracking-wider group-hover:text-white/60 transition-colors">
        <span>{subtitle}</span>
        <div className="flex items-center gap-1">
          {match.status === 'FINISHED' && <span className="text-white/40">FT</span>}
          {!isTBD && <ChevronRight size={10} className="text-white/20 group-hover:text-white/50 transition-colors" />}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 justify-end text-right">
          <span className={`font-semibold text-sm leading-tight ${!match.homeTeam ? 'text-[var(--text-muted)]' : ''}`}>{homeName}</span>
          {match.homeFlag ? (
            <img src={match.homeFlag} alt={homeName} className="w-8 h-8 object-contain drop-shadow-md flex-none" />
          ) : (
            <PlaceholderCrest />
          )}
        </div>
        
        <div className="flex flex-col items-center justify-center w-[80px] flex-none px-2">
          {match.status === 'SCHEDULED' ? (
            <CountdownBadge utcKickoff={match.utcKickoff} stadiumId={match.stadiumId} />
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold tracking-widest">
                {match.homeScore ?? 0} - {match.awayScore ?? 0}
              </span>
              {match.status === 'LIVE' && (
                <div className="text-[10px] font-mono text-red-400 font-bold mt-1 bg-red-500/10 px-2 py-0.5 rounded animate-pulse">
                  {match.matchState === 'Halftime' ? 'HT' : match.displayClock || "LIVE"}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 flex-1 justify-start">
          {match.awayFlag ? (
            <img src={match.awayFlag} alt={awayName} className="w-8 h-8 object-contain drop-shadow-md flex-none" />
          ) : (
            <PlaceholderCrest />
          )}
          <span className={`font-semibold text-sm leading-tight ${!match.awayTeam ? 'text-[var(--text-muted)]' : ''}`}>{awayName}</span>
        </div>
      </div>

      {/* Scorer preview row for finished matches */}
      {hasScorers && (
        <div className="mt-2 pt-2 border-t border-white/5 flex justify-between text-[10px] text-white/40">
          <div className="flex flex-col gap-0.5">
            {homeGoals.map((g, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[var(--accent-gold)] inline-block shrink-0" />
                {g.name} <span className="opacity-50">{g.minute}</span>
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-0.5 items-end">
            {awayGoals.map((g, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="opacity-50">{g.minute}</span> {g.name}
                <span className="w-1 h-1 rounded-full bg-[var(--accent-gold)] inline-block shrink-0" />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
