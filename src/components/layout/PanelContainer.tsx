import { AnimatePresence, motion } from 'framer-motion';
import { useWC2026Store } from '../../store/wc2026Store';
import { SchedulePanel } from '../schedule/SchedulePanel';
import { Scoreboard } from '../scoreboard/Scoreboard';
import { StandingsPanel } from '../standings/StandingsPanel';

export function PanelContainer() {
  const activePanel = useWC2026Store(s => s.activePanel);

  return (
    <div className="flex-1 relative overflow-hidden bg-transparent z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={activePanel}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar"
        >
          {activePanel === 'schedule' && <SchedulePanel />}
          {activePanel === 'live' && <Scoreboard />}
          {activePanel === 'standings' && <StandingsPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
