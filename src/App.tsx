import { useEffect } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { NavBar } from './components/layout/NavBar';
import { PanelContainer } from './components/layout/PanelContainer';
import { CompactLiveWidget } from './components/compact/CompactLiveWidget';
import { useTauriEvents } from './hooks/useTauriEvents';
import { invoke } from '@tauri-apps/api/core';
import { useWC2026Store } from './store/wc2026Store';
import { MatchDetailSheet } from './components/schedule/MatchDetailSheet';
import { TeamDetailSheet } from './components/schedule/TeamDetailSheet';
import { useUpdater } from './hooks/useUpdater';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import { Maximize2, X } from 'lucide-react';

const appWindow = getCurrentWindow();

function CompactOverlay({ onExpand }: { onExpand: () => void }) {
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'BUTTON' && !target.closest('button')) {
      appWindow.startDragging();
    }
  };

  return (
    <div
      className="relative w-full h-full"
      onPointerDown={handlePointerDown}
    >
      {/* The widget content */}
      <CompactLiveWidget />

      {/* Floating controls - top-right corner */}
      <div
        className="absolute top-1.5 right-1.5 flex items-center gap-0.5 z-50 opacity-0 hover:opacity-100 transition-opacity duration-200"
        style={{ pointerEvents: 'auto' }}
      >
        <button
          onClick={onExpand}
          title="Expand"
          className="w-5 h-5 rounded-full flex items-center justify-center text-white/50 hover:text-[var(--accent-gold)] hover:bg-white/10 transition-colors"
        >
          <Maximize2 size={9} />
        </button>
        <button
          onClick={() => appWindow.hide()}
          title="Hide"
          className="w-5 h-5 rounded-full flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-white/10 transition-colors"
        >
          <X size={9} />
        </button>
      </div>
    </div>
  );
}

function App() {
  useTauriEvents();
  const { updateAvailable, promptInstall } = useUpdater();

  const setTimezone = useWC2026Store(s => s.setTimezone);
  const compactMode = useWC2026Store(s => s.compactMode);
  const setCompactMode = useWC2026Store(s => s.setCompactMode);
  const bgOpacity = useWC2026Store(s => s.bgOpacity);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-bg-opacity', bgOpacity.toString());
  }, [bgOpacity]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    
    invoke<string>('get_system_timezone').then(tz => {
      if (tz) setTimezone(tz);
    }).catch(console.error);

    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [setTimezone]);

  useEffect(() => {
    document.getElementById('root')?.setAttribute('data-compact', compactMode ? 'true' : 'false');
    if (compactMode) {
      appWindow.setSize(new LogicalSize(300, 140));
    } else {
      appWindow.setSize(new LogicalSize(380, 680));
    }
  }, [compactMode]);

  if (compactMode) {
    return (
      <div
        className="w-full h-screen overflow-hidden"
        style={{ background: 'transparent' }}
      >
        <CompactOverlay onExpand={() => setCompactMode(false)} />
      </div>
    );
  }

  return (
    // This outer div is the full window. position:relative here so overlays
    // rendered as children are positioned against the full window, not any
    // scrolling sub-container.
    <div className="flex flex-col h-screen w-full bg-transparent overflow-hidden text-[var(--text-primary)] relative">
      <TitleBar />
      <>
        <PanelContainer />
        <NavBar />
      </>

      {/* Global overlays — rendered at App root so they NEVER scroll with panel content */}
      <MatchDetailSheet />
      <TeamDetailSheet />

      {/* Update Banner */}
      {updateAvailable && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[90%] bg-[var(--accent-gold)] text-black font-semibold text-[11px] px-3 py-2 rounded-lg shadow-lg flex items-center justify-between z-[100] animate-in fade-in slide-in-from-bottom-2">
          <span>Update {updateAvailable.version} available!</span>
          <button 
            onClick={() => promptInstall(updateAvailable)}
            className="bg-black/10 hover:bg-black/20 transition-colors px-2 py-1 rounded text-black font-bold uppercase text-[9px] tracking-wider"
          >
            Install
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
