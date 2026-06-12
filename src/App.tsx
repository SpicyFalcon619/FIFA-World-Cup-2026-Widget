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
const COMPACT_W = 320;
const COMPACT_H = 200;

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
    const root = document.getElementById('root');
    if (compactMode) {
      root?.setAttribute('data-compact', 'true');
      appWindow.setSize(new LogicalSize(COMPACT_W, COMPACT_H));
    } else {
      root?.setAttribute('data-compact', 'false');
      appWindow.setSize(new LogicalSize(380, 680));
    }
  }, [compactMode]);

  if (compactMode) {
    return (
      <div
        className="w-full h-screen overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ background: 'transparent' }}
        onPointerDown={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName !== 'BUTTON' && !target.closest('button')) {
            appWindow.startDragging();
          }
        }}
      >
        <CompactLiveWidget onExpand={() => setCompactMode(false)} />
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
