import { useWC2026Store } from '../../store/wc2026Store';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';

const STAGES = ['ALL', 'GROUP', 'R32', 'R16', 'QF', 'SF', 'F'] as const;
const GROUPS = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export function FilterBar() {
  const { filterStage, filterGroup, setFilterStage, setFilterGroup } = useWC2026Store();
  const stagesRef = useHorizontalScroll<HTMLDivElement>();
  const groupsRef = useHorizontalScroll<HTMLDivElement>();

  const showGroups = filterStage === 'ALL' || filterStage === 'GROUP';

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div 
        ref={stagesRef}
        className="flex overflow-x-auto custom-scrollbar pb-1 gap-2"
      >
        {STAGES.map(stage => (
          <button
            key={stage}
            onClick={() => { setFilterStage(stage); if (stage !== 'GROUP' && stage !== 'ALL') setFilterGroup('ALL'); }}
            className={`flex-none px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-colors border ${
              filterStage === stage 
                ? 'bg-[var(--accent-gold)] text-black border-[var(--accent-gold)]' 
                : 'bg-[var(--bg-glass)] text-[var(--text-muted)] border-[var(--border-glass)] hover:text-white'
            }`}
          >
            {stage}
          </button>
        ))}
      </div>
      
      {showGroups && (
        <div 
          ref={groupsRef}
          className="flex overflow-x-auto custom-scrollbar pb-1 gap-2"
        >
          {GROUPS.map(grp => (
            <button
              key={grp}
              onClick={() => setFilterGroup(grp === 'ALL' ? 'ALL' : grp)}
              className={`flex-none px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                filterGroup === (grp === 'ALL' ? 'ALL' : grp)
                  ? 'bg-white text-black border-white' 
                  : 'bg-[var(--bg-glass)] text-[var(--text-muted)] border-[var(--border-glass)] hover:text-white'
              }`}
            >
              {grp === 'ALL' ? 'ALL GROUPS' : `GRP ${grp}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
