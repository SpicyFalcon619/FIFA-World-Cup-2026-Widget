import { useState, useEffect } from 'react';

export function MinuteClock({ minute }: { minute: number | null }) {
  const [localMinute, setLocalMinute] = useState(minute);

  // Sync with true backend time whenever it arrives (every 4-5 mins)
  useEffect(() => {
    setLocalMinute(minute);
  }, [minute]);

  // Optimistically tick forward every 60 seconds locally
  useEffect(() => {
    if (localMinute === null) return;
    
    const intervalId = setInterval(() => {
      setLocalMinute(prev => (prev !== null ? prev + 1 : prev));
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [localMinute]);

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--accent-green)] mt-1">
      <span className="w-1.5 h-1.5 bg-[var(--accent-green)] rounded-full animate-pulse shadow-[0_0_8px_var(--accent-green)]" />
      {localMinute ? `${localMinute}'` : 'HT'}
    </div>
  );
}
