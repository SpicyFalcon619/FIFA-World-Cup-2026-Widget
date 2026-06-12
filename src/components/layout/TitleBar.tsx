import { Pin, X, Minus, Layers, PictureInPicture2, Maximize2 } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useWindowLayer } from '../../hooks/useWindowLayer';
import { useWC2026Store } from '../../store/wc2026Store';

const appWindow = getCurrentWindow();

export function TitleBar() {
  const [windowLayer, cycleLayer] = useWindowLayer();
  const { compactMode, setCompactMode, bgOpacity, setBgOpacity } = useWC2026Store();

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only start dragging if the target is NOT an interactive element
    const target = e.target as HTMLElement;
    if (target.tagName !== 'BUTTON' && target.tagName !== 'INPUT' && !target.closest('button')) {
      appWindow.startDragging();
    }
  };

  return (
    <div 
      onPointerDown={handlePointerDown}
      className="h-[44px] flex flex-none items-center justify-between px-3 z-50 cursor-grab active:cursor-grabbing"
      style={{
        background: 'var(--bg-glass)',
        borderBottom: '1px solid var(--border-glass)'
      }}
    >
      <div className="flex items-center gap-2 pointer-events-none">
        <img src="https://crests.football-data.org/wm26.png" alt="World Cup 2026 Logo" className="h-6 object-contain drop-shadow-md" />
        <span className="font-bold text-sm tracking-widest text-[var(--text-primary)]">WORLD CUP 26</span>
      </div>
      
      <div className="flex items-center gap-1 z-50">
        <button 
          onClick={() => setCompactMode(!compactMode)}
          className={`p-1.5 rounded-md transition-colors ${compactMode ? 'text-[var(--accent-gold)] bg-white/10' : 'text-[var(--text-muted)] hover:bg-white/10'}`}
          title={compactMode ? "Expand Window" : "Compact Widget"}
        >
          {compactMode ? <Maximize2 size={16} /> : <PictureInPicture2 size={16} />}
        </button>
        <button 
          onClick={cycleLayer}
          className={`p-1.5 rounded-md transition-colors ${windowLayer !== 'normal' ? 'text-[var(--accent-gold)] bg-white/10' : 'text-[var(--text-muted)] hover:bg-white/10'}`}
          title={windowLayer === 'normal' ? "Normal Window" : "Always on Top"}
        >
          {windowLayer === 'alwaysOnTop' ? <Pin size={16} fill="currentColor" /> : <Layers size={16} />}
        </button>
        <input 
          type="range" 
          min="0.2" max="1.0" step="0.05" 
          value={bgOpacity} 
          onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
          className="w-16 h-1 mx-2 appearance-none bg-white/20 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent-gold)] cursor-pointer"
          title={`Background Opacity: ${Math.round(bgOpacity * 100)}%`}
        />
        <button 
          onClick={() => appWindow.minimize()}
          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors"
        >
          <Minus size={16} />
        </button>
        <button 
          onClick={() => appWindow.close()}
          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/20 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
