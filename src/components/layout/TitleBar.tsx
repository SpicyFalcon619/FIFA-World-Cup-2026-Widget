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
        <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 drop-shadow-[0_0_6px_rgba(245,184,0,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="trophy-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2B2" />
              <stop offset="40%" stopColor="#F5B800" />
              <stop offset="100%" stopColor="#A87300" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="7" r="4.2" fill="url(#trophy-gold)" />
          <path d="M7 11C7 11 9 13.5 12 13.5" stroke="url(#trophy-gold)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M17 11C17 11 15 13.5 12 13.5" stroke="url(#trophy-gold)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 13L9.5 19H14.5L14 13" fill="url(#trophy-gold)" />
          <path d="M7 19H17V21.5H7V19Z" fill="url(#trophy-gold)" />
          <path d="M10.5 14.5H13.5" stroke="#0D0F16" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M10.2 16.5H13.8" stroke="#0D0F16" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M10 18.5H14" stroke="#0D0F16" strokeWidth="0.8" strokeLinecap="round" />
        </svg>
        <span className="font-black text-xs tracking-widest text-[var(--accent-gold)] drop-shadow-[0_0_6px_rgba(245,184,0,0.25)]">WORLD CUP WIDGET 26</span>
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
