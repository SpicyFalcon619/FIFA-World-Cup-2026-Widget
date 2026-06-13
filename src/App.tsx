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

const appWindow = getCurrentWindow();

// Compact window size — tall enough to show upcoming matches
const COMPACT_W = 340;
const COMPACT_H = 140;

function App() {
  useTauriEvents();
  const { updateAvailable, promptInstall } = useUpdater();

  const setTimezone = useWC2026Store(s => s.setTimezone);
  const compactMode = useWC2026Store(s => s.compactMode);
  const setCompactMode = useWC2026Store(s => s.setCompactMode);
  const bgOpacity = useWC2026Store(s => s.bgOpacity);
  const isPinned = useWC2026Store(s => s.isPinned);
  const isAlwaysOnTop = useWC2026Store(s => s.isAlwaysOnTop);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-bg-opacity', bgOpacity.toString());
  }, [bgOpacity]);

  useEffect(() => {
    appWindow.setAlwaysOnTop(isAlwaysOnTop).catch(console.error);
  }, [isAlwaysOnTop]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    
    invoke<string>('get_system_timezone').then(tz => {
      if (tz) setTimezone(tz);
    }).catch(console.error);

    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [setTimezone]);

  useEffect(() => {
    const root = document.getElementById('root');
    if (compactMode) {
      root?.setAttribute('data-compact', 'true');
      appWindow.setMinSize(new LogicalSize(300, 140));
      appWindow.setMaxSize(new LogicalSize(600, 200));
      appWindow.setSize(new LogicalSize(COMPACT_W, COMPACT_H));
    } else {
      root?.setAttribute('data-compact', 'false');
      appWindow.setMinSize(new LogicalSize(340, 480));
      appWindow.setMaxSize(null);
      appWindow.setSize(new LogicalSize(380, 680));
    }
  }, [compactMode]);

  if (compactMode) {
    return (
      <div
        className={`w-full h-screen overflow-hidden ${isPinned ? '' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ background: 'transparent', padding: '6px' }}
        onPointerDown={(e) => {
          if (isPinned) return;
          const target = e.target as HTMLElement;
          if (target.tagName !== 'BUTTON' && !target.closest('button')) {
            appWindow.startDragging();
          }
        }}
      >
        <div 
          className="w-full h-full rounded-[18px] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)] border border-white/10 relative backdrop-blur-xl transition-colors duration-200"
          style={{ background: `rgba(18, 18, 18, ${bgOpacity})` }}
        >
          <CompactLiveWidget onExpand={() => setCompactMode(false)} />
        </div>
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
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[90%] bg-[var(--accent-gold)] text-black font-semibold text-[11px] px-3 py-2 rounded-lg shadow-lg flex items-center justify-between z-[100]">
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
