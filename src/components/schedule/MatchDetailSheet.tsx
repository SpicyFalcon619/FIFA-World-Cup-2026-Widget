import { AnimatePresence, motion } from 'framer-motion';
import { X, Clock, MapPin, Zap, Award } from 'lucide-react';
import { useWC2026Store, parseScorers, Match } from '../../store/wc2026Store';

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

function UpcomingContent({ match }: { match: Match }) {
  const { setSelectedTeam, setSelectedMatch } = useWC2026Store();
  const stadium = STADIUMS[match.stadiumId] ?? `Stadium ${match.stadiumId}`;
  const kickoff = parseKickoff(match.utcKickoff);
  const stageLabel = formatStageLabel(match.stage, match.group);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center text-[10px] font-bold tracking-widest text-[var(--accent-gold)] uppercase">
        {stageLabel}
      </div>

      <div className="flex items-center justify-between gap-2 px-2">
        <TeamBlock
          flag={match.homeFlag} name={match.homeTeam}
          onClick={() => { setSelectedMatch(null); setTimeout(() => setSelectedTeam(match.homeTeam), 150); }}
        />
        <div className="flex flex-col items-center">
          <span className="text-white/25 text-2xl font-thin tracking-widest">VS</span>
        </div>
        <TeamBlock
          flag={match.awayFlag} name={match.awayTeam}
          onClick={() => { setSelectedMatch(null); setTimeout(() => setSelectedTeam(match.awayTeam), 150); }}
        />
      </div>

      <div className="flex flex-col gap-2 px-1">
        <InfoRow icon={<Clock size={13} />} text={kickoff} />
        <InfoRow icon={<MapPin size={13} />} text={stadium} />
      </div>
    </div>
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

function FinishedContent({ match }: { match: Match }) {
  const { setSelectedTeam, setSelectedMatch } = useWC2026Store();
  const homeGoals = parseScorers(match.homeScorers);
  const awayGoals = parseScorers(match.awayScorers);
  const stadium = STADIUMS[match.stadiumId] ?? `Stadium ${match.stadiumId}`;
  const stageLabel = formatStageLabel(match.stage, match.group);
  const hasGoals = homeGoals.length > 0 || awayGoals.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center text-[10px] font-bold tracking-widest text-[var(--accent-gold)] uppercase">
        {stageLabel}
      </div>

      <div className="flex items-center justify-between gap-2 px-2">
        <TeamBlock
          flag={match.homeFlag} name={match.homeTeam}
          onClick={() => { setSelectedMatch(null); setTimeout(() => setSelectedTeam(match.homeTeam), 150); }}
        />
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-4xl font-black tracking-tight tabular-nums">
            {match.homeScore ?? 0} – {match.awayScore ?? 0}
          </span>
          <span className="text-[9px] tracking-widest font-bold px-2 py-0.5 rounded-full bg-white/8 text-white/50 uppercase border border-white/10">
            Full Time
          </span>
        </div>
        <TeamBlock
          flag={match.awayFlag} name={match.awayTeam}
          onClick={() => { setSelectedMatch(null); setTimeout(() => setSelectedTeam(match.awayTeam), 150); }}
        />
      </div>

      {hasGoals && (
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

      <InfoRow icon={<MapPin size={13} />} text={stadium} />
    </div>
  );
}

export function MatchDetailSheet() {
  const { selectedMatch, setSelectedMatch } = useWC2026Store();

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
                {selectedMatch.status === 'FINISHED'
                  ? <Award size={13} className="text-[var(--accent-gold)]" />
                  : <Zap size={13} className="text-[var(--accent-gold)]" />}
                <span className="text-[11px] font-bold tracking-widest text-white/45 uppercase">
                  {selectedMatch.status === 'FINISHED' ? 'Match Result' : 'Match Preview'}
                </span>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="p-1.5 rounded-lg hover:bg-white/8 transition-colors text-white/40 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-4 max-h-[72vh] overflow-y-auto overscroll-contain custom-scrollbar">
              {selectedMatch.status === 'FINISHED'
                ? <FinishedContent match={selectedMatch} />
                : <UpcomingContent match={selectedMatch} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
