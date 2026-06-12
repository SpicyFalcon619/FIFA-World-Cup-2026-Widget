import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWC2026Store } from '../../store/wc2026Store';
import { Flame } from 'lucide-react';

export function GoalFlash() {
  const lastGoalEvent = useWC2026Store(s => s.lastGoalEvent);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (lastGoalEvent) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastGoalEvent]);

  return (
    <AnimatePresence>
      {show && lastGoalEvent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 200, 122, 0.15)' }}
        >
          <Flame size={64} className="mb-4 text-orange-500 animate-bounce drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
          <h2 className="text-4xl font-black italic tracking-widest text-white mb-2 shadow-black drop-shadow-lg">GOAL!</h2>
          <div className="text-xl font-bold text-white shadow-black drop-shadow-md">
            {lastGoalEvent.team}
          </div>
          <div className="text-lg font-mono text-[var(--accent-green)] mt-2">
            {lastGoalEvent.minute}'
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
