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

function App() {
  useTauriEvents();

  const setTimezone = useWC2026Store(s => s.setTimezone);
  const compactMode = useWC2026Store(s => s.compactMode);
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
    import('@tauri-apps/api/window').then(({ getCurrentWindow, LogicalSize }) => {
      const appWindow = getCurrentWindow();
      if (compactMode) {
        appWindow.setSize(new LogicalSize(340, 160));
      } else {
        appWindow.setSize(new LogicalSize(380, 680));
      }
    }).catch(console.error);
  }, [compactMode]);

  return (
    // This outer div is the full window. position:relative here so overlays
    // rendered as children are positioned against the full window, not any
    // scrolling sub-container.
    <div className="flex flex-col h-screen w-full bg-transparent overflow-hidden text-[var(--text-primary)] relative">
      <TitleBar />
      {compactMode ? (
        <div id="compact-widget-container" className="flex-1 w-full h-full relative">
          <CompactLiveWidget />
        </div>
      ) : (
        <>
          <PanelContainer />
          <NavBar />
        </>
      )}

      {/* Global overlays — rendered at App root so they NEVER scroll with panel content */}
      <MatchDetailSheet />
      <TeamDetailSheet />
    </div>
  );
}

export default App;
