import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { getAbsoluteDate } from '../lib/timeUtils';

// --- Domain Types ---
export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  utcKickoff: string;       // local_date from API e.g. "06/11/2026 13:00"
  localKickoff: string;
  status: 'SCHEDULED' | 'LIVE' | 'PAUSED' | 'FINISHED';
  minute: number | null;
  displayClock: string | null;
  matchState: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeRedCards: number;
  awayRedCards: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homePossession: string | null;
  awayPossession: string | null;
  homeShots: string | null;
  awayShots: string | null;
  homeShotsOnTarget: string | null;
  awayShotsOnTarget: string | null;
  homeCorners: string | null;
  awayCorners: string | null;
  homeFouls: string | null;
  awayFouls: string | null;
  group: string;
  stage: 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | 'THIRD' | 'F';
  homeScorers: string;
  awayScorers: string;
  stadiumId: number;
  matchday: number;
}

export interface TeamStanding {
  position: number;
  team: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface Group {
  name: string;
  standings: TeamStanding[];
}

export interface TopScorer {
  player: string;
  team: string;
  flag: string;
  goals: number;
  assists: number;
}

export interface ScorerEntry {
  player: string;
  team: string;
  flag: string;
  goals: number;
  assists: number;
}

/**
 * Parses the raw PostgreSQL array literal from worldcup26.ir API.
 * Format examples:
 *   {"J. Quiñones 9'","R. Jiménez 67'"}
 *   "null" or "" (no scorers)
 */
export function parseScorers(raw: string): Array<{ name: string; minute: string }> {
  if (!raw || raw.trim() === 'null') return [];
  const cleaned = raw.replace(/^\{/, '').replace(/\}$/, '');
  if (!cleaned) return [];
  
  const normalized = cleaned.replace(/[“”]/g, '"');
  const parts = normalized.split(/","|",\s*"/).map(s => s.replace(/"/g, '').trim());
  
  return parts.map(p => {
    const spaceIdx = p.lastIndexOf(' ');
    if (spaceIdx === -1) return { name: p, minute: '' };
    return {
      name: p.slice(0, spaceIdx).trim(),
      minute: p.slice(spaceIdx + 1).trim()
    };
  });
}

// --- Store Shape ---
interface ScheduleSlice {
  matches: Match[];
  filterStage: Match['stage'] | 'ALL';
  filterGroup: string | 'ALL';
  selectedMatch: Match | null;
  setMatches: (matches: Match[]) => void;
  setFilterStage: (stage: Match['stage'] | 'ALL') => void;
  setFilterGroup: (group: string | 'ALL') => void;
  setSelectedMatch: (match: Match | null) => void;
}

interface LiveScoreSlice {
  liveGames: Match[];
  lastGoalEvent: { matchId: number; team: string; minute: number } | null;
  setLiveGames: (games: Match[]) => void;
  setGoalEvent: (event: LiveScoreSlice['lastGoalEvent']) => void;
}

interface StandingsSlice {
  groups: Group[];
  topScorers: TopScorer[];
  knockoutView: boolean;
  selectedTeam: string | null;
  setGroups: (groups: Group[]) => void;
  setTopScorers: (scorers: TopScorer[]) => void;
  toggleKnockoutView: () => void;
  setSelectedTeam: (team: string | null) => void;
}

interface AppSlice {
  activePanel: 'schedule' | 'live' | 'standings';
  windowLayer: 'normal' | 'alwaysOnTop' | 'desktop';
  timezone: string;
  compactMode: boolean;
  bgOpacity: number;
  isPinned: boolean;
  isAlwaysOnTop: boolean;
  setActivePanel: (panel: AppSlice['activePanel']) => void;
  setWindowLayer: (layer: AppSlice['windowLayer']) => void;
  setTimezone: (tz: string) => void;
  setCompactMode: (compact: boolean) => void;
  setBgOpacity: (opacity: number) => void;
  setIsPinned: (isPinned: boolean) => void;
  setIsAlwaysOnTop: (isAlwaysOnTop: boolean) => void;
}

export type WC2026Store = ScheduleSlice & LiveScoreSlice & StandingsSlice & AppSlice;

export const useWC2026Store = create<WC2026Store>()(
  immer((set) => ({
    // Schedule
    matches: [],
    filterStage: 'ALL',
    filterGroup: 'ALL',
    selectedMatch: null,
    setMatches: (matches) => set((s) => { s.matches = matches; }),
    setFilterStage: (stage) => set((s) => { s.filterStage = stage; }),
    setFilterGroup: (group) => set((s) => { s.filterGroup = group; }),
    setSelectedMatch: (match) => set((s) => { s.selectedMatch = match; }),

    // Live Scores
    liveGames: [],
    lastGoalEvent: null,
    setLiveGames: (games) => set((s) => { s.liveGames = games; }),
    setGoalEvent: (event) => set((s) => { s.lastGoalEvent = event; }),

    // Standings
    groups: [],
    topScorers: [],
    knockoutView: false,
    selectedTeam: null,
    setGroups: (groups) => set((s) => { s.groups = groups; }),
    setTopScorers: (scorers) => set((s) => { s.topScorers = scorers; }),
    toggleKnockoutView: () => set((s) => { s.knockoutView = !s.knockoutView; }),
    setSelectedTeam: (team) => set((s) => { s.selectedTeam = team; }),

    // App State
    activePanel: 'schedule',
    windowLayer: 'normal',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    compactMode: false,
    bgOpacity: 1.0,
    isPinned: false,
    isAlwaysOnTop: false,
    setActivePanel: (panel) => set((s) => { s.activePanel = panel; }),
    setWindowLayer: (layer) => set((s) => { s.windowLayer = layer; }),
    setTimezone: (tz) => set((s) => { s.timezone = tz; }),
    setCompactMode: (compact) => set((s) => { s.compactMode = compact; }),
    setBgOpacity: (opacity) => set((s) => { s.bgOpacity = opacity; }),
    setIsPinned: (isPinned) => set((s) => { s.isPinned = isPinned; }),
    setIsAlwaysOnTop: (isAlwaysOnTop) => set((s) => { s.isAlwaysOnTop = isAlwaysOnTop; }),
  }))
);

export function getComputedLiveGames(matches: Match[], liveGamesState: Match[]): Match[] {
  const now = Date.now();
  const allLive = matches.filter(m => {
    if (m.status === 'FINISHED') return false;
    if (m.status === 'LIVE') return true;
    try {
      const kickoff = getAbsoluteDate(m.utcKickoff, m.stadiumId).getTime();
      return now >= kickoff - 5 * 60 * 1000;
    } catch (e) {
      return false;
    }
  });

  return allLive.map(m => {
    const liveUpdate = liveGamesState.find(lg => lg.id === m.id);
    const merged = liveUpdate ? { ...m, ...liveUpdate } : { ...m };
    
    if (merged.status === 'LIVE' && merged.minute == null) {
        try {
            const kickoff = getAbsoluteDate(merged.utcKickoff, merged.stadiumId).getTime();
            const elapsedMs = now - kickoff;
            let mins = Math.floor(elapsedMs / 60000);
            if (mins < 0) mins = 0;
            if (mins > 45) {
                if (mins <= 60) mins = 45; // half time
                else mins -= 15;
            }
            if (mins > 120) mins = 120;
            merged.minute = mins;
        } catch {
            // fallback
        }
    }
    
    return merged;
  }).sort((a, b) => {
    const dateA = getAbsoluteDate(a.utcKickoff, a.stadiumId).getTime();
    const dateB = getAbsoluteDate(b.utcKickoff, b.stadiumId).getTime();
    return dateA - dateB;
  });
}
