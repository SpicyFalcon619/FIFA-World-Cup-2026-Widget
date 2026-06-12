import { useState, useEffect } from 'react';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export function useUpdater() {
  const [isChecking, setIsChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState<Update | null>(null);

  const checkForUpdates = async (silent = false) => {
    try {
      setIsChecking(true);
      const update = await check();
      
      if (update) {
        setUpdateAvailable(update);
        if (!silent) {
          promptInstall(update);
        }
      } else if (!silent) {
        window.alert('You are already running the latest version!');
      }
    } catch (e) {
      console.error('Failed to check for updates', e);
      if (!silent) window.alert('Failed to check for updates: ' + String(e));
    } finally {
      setIsChecking(false);
    }
  };

  const promptInstall = async (update: Update) => {
    const yes = window.confirm(
      `Update available: ${update.version}\n\n${update.body || ''}\n\nDo you want to download and install it now?`
    );
    
    if (yes) {
      setIsChecking(true);
      try {
        await update.downloadAndInstall();
        await relaunch();
      } catch (e) {
        window.alert('Failed to install update: ' + String(e));
      } finally {
        setIsChecking(false);
      }
    }
  };

  // Auto-check on mount
  useEffect(() => {
    checkForUpdates(true);
  }, []);

  return { isChecking, updateAvailable, checkForUpdates, promptInstall };
}
