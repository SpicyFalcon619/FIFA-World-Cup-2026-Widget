import { useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export function useUpdater() {
  const [isChecking, setIsChecking] = useState(false);

  const checkForUpdates = async () => {
    try {
      setIsChecking(true);
      const update = await check();
      
      if (update) {
        const yes = window.confirm(
          `Update available: ${update.version}\n\n${update.body || ''}\n\nDo you want to download and install it now?`
        );
        
        if (yes) {
          await update.downloadAndInstall();
          await relaunch();
        }
      } else {
        window.alert('You are already running the latest version!');
      }
    } catch (e) {
      console.error('Failed to check for updates', e);
      window.alert('Failed to check for updates: ' + String(e));
    } finally {
      setIsChecking(false);
    }
  };

  return { isChecking, checkForUpdates };
}
