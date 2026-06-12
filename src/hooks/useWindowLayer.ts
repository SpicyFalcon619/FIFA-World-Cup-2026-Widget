import { invoke } from '@tauri-apps/api/core';
import { useWC2026Store } from '../store/wc2026Store';

type Layer = 'normal' | 'alwaysOnTop' | 'desktop';

export function useWindowLayer(): [Layer, () => void] {
  const { windowLayer, setWindowLayer } = useWC2026Store();

  const cycleLayer = async () => {
    try {
      let nextLayer: Layer = 'normal';
      if (windowLayer === 'normal') nextLayer = 'alwaysOnTop';
      else if (windowLayer === 'alwaysOnTop') nextLayer = 'normal';
      else nextLayer = 'normal';

      if (nextLayer === 'normal') {
        await invoke('set_desktop_layer', { enable: false });
        await invoke('set_always_on_top', { enable: false });
      } else if (nextLayer === 'alwaysOnTop') {
        await invoke('set_desktop_layer', { enable: false });
        await invoke('set_always_on_top', { enable: true });
      } else if (nextLayer === 'desktop') {
        await invoke('set_always_on_top', { enable: false });
        await invoke('set_desktop_layer', { enable: true });
      }
      
      setWindowLayer(nextLayer);
    } catch (e) {
      console.error('Failed to set window layer', e);
    }
  };

  return [windowLayer, cycleLayer];
}
