import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { useWC2026Store } from '../store/wc2026Store';
import type { Match, Group, TopScorer } from '../store/wc2026Store';

interface GoalEventPayload {
  match_id: number;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  scoring_team: string;
  minute: number;
}

export function useTauriEvents() {
  const { setMatches, setLiveGames, setGoalEvent, setGroups, setTopScorers } = useWC2026Store();

  useEffect(() => {
    // Request notification permission on mount
    (async () => {
      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
      }
    })();

    const unlisten: Array<() => void> = [];

    (async () => {
      unlisten.push(
        await listen<Match[]>('schedule-update', (e) => setMatches(e.payload)),
        await listen<Match[]>('live-scores-update', (e) => setLiveGames(e.payload)),
        await listen<GoalEventPayload>('goal-event', async (e) => {
          const payload = e.payload;
          setGoalEvent({ matchId: payload.match_id, team: payload.scoring_team, minute: payload.minute });
          
          if (await isPermissionGranted()) {
            sendNotification({
              title: `GOAL! ${payload.scoring_team} scored! ⚽`,
              body: `${payload.home_team} ${payload.home_score} - ${payload.away_score} ${payload.away_team} (${payload.minute}')`
            });
          }
        }),
        await listen<Group[]>('standings-update', (e) => setGroups(e.payload)),
        await listen<TopScorer[]>('scorers-update', (e) => setTopScorers(e.payload)),
      );
    })();

    return () => {
      unlisten.forEach((fn) => fn());
    };
  }, [setMatches, setLiveGames, setGoalEvent, setGroups, setTopScorers]);
}
