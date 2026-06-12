import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';

export function KnockoutGrid() {
  // Skeleton Knockout Grid as per Phase 3 requirements
  // Scaled down SVG to fit nicely
  const scrollRef = useHorizontalScroll<HTMLDivElement>();

  return (
    <div ref={scrollRef} className="w-full overflow-x-auto custom-scrollbar pb-4 pt-2">
      <div className="w-[700px] h-[400px] relative">
        <svg width="700" height="400" className="absolute inset-0 pointer-events-none">
          <line x1="120" y1="50" x2="160" y2="50" stroke="var(--border-glass)" strokeWidth="2" />
          <line x1="120" y1="130" x2="160" y2="130" stroke="var(--border-glass)" strokeWidth="2" />
          <line x1="160" y1="50" x2="160" y2="130" stroke="var(--border-glass)" strokeWidth="2" />
          <line x1="160" y1="90" x2="200" y2="90" stroke="var(--border-glass)" strokeWidth="2" />
          
          <line x1="120" y1="250" x2="160" y2="250" stroke="var(--border-glass)" strokeWidth="2" />
          <line x1="120" y1="330" x2="160" y2="330" stroke="var(--border-glass)" strokeWidth="2" />
          <line x1="160" y1="250" x2="160" y2="330" stroke="var(--border-glass)" strokeWidth="2" />
          <line x1="160" y1="290" x2="200" y2="290" stroke="var(--border-glass)" strokeWidth="2" />
          
          <line x1="310" y1="90" x2="350" y2="90" stroke="var(--border-glass)" strokeWidth="2" />
          <line x1="310" y1="290" x2="350" y2="290" stroke="var(--border-glass)" strokeWidth="2" />
          <line x1="350" y1="90" x2="350" y2="290" stroke="var(--border-glass)" strokeWidth="2" />
          <line x1="350" y1="190" x2="390" y2="190" stroke="var(--border-glass)" strokeWidth="2" />
        </svg>

        <MatchBox x={10} y={32} />
        <MatchBox x={10} y={112} />
        <MatchBox x={200} y={72} />

        <MatchBox x={10} y={232} />
        <MatchBox x={10} y={312} />
        <MatchBox x={200} y={272} />

        <MatchBox x={390} y={172} label="FINAL" isFinal />
      </div>
    </div>
  );
}

function MatchBox({ x, y, label = 'TBD', isFinal = false }: { x: number; y: number; label?: string; isFinal?: boolean }) {
  return (
    <div 
      className={`absolute w-[110px] h-[36px] flex items-center justify-center rounded-lg text-xs font-bold tracking-wider ${isFinal ? 'text-[var(--accent-gold)] border-[var(--accent-gold)]' : 'text-[var(--text-muted)] border-[var(--border-glass)]'}`}
      style={{
        left: x,
        top: y,
        background: 'var(--bg-glass)',
        borderWidth: 1,
        borderStyle: 'solid',
      }}
    >
      {label}
    </div>
  );
}
