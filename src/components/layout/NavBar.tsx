import { CalendarDays, Zap, BarChart3 } from 'lucide-react';
import { useWC2026Store } from '../../store/wc2026Store';

export function NavBar() {
  const { activePanel, setActivePanel, liveGames } = useWC2026Store();
  
  const hasLive = liveGames.length > 0;

  return (
    <div 
      className="h-[56px] flex flex-none items-center justify-around px-2 z-50"
      style={{
        background: 'var(--bg-glass)',
        borderTop: '1px solid var(--border-glass)'
      }}
    >
      <TabButton 
        active={activePanel === 'schedule'} 
        onClick={() => setActivePanel('schedule')}
        icon={<CalendarDays size={20} />}
        label="Schedule"
      />
      <TabButton 
        active={activePanel === 'live'} 
        onClick={() => setActivePanel('live')}
        icon={<Zap size={20} />}
        label="Live"
        badge={hasLive}
      />
      <TabButton 
        active={activePanel === 'standings'} 
        onClick={() => setActivePanel('standings')}
        icon={<BarChart3 size={20} />}
        label="Standings"
      />
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: boolean;
}

function TabButton({ active, onClick, icon, label, badge }: TabButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
        active ? 'text-[var(--accent-gold)]' : 'text-[var(--text-muted)] hover:text-white'
      }`}
    >
      <div className="relative">
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-[var(--bg-glass)]" />
        )}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      {active && (
        <div className="absolute top-0 w-8 h-[2px] bg-[var(--accent-gold)] rounded-b-md" />
      )}
    </button>
  );
}
