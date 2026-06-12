import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

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
  homeScore: number | null;
  awayScore: number | null;
  homeRedCards: number;
  awayRedCards: number;
  group: string;
  stage: 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | 'THIRD' | 'F';
  homeScorers: string;   // raw API string e.g. '{"J. Quiñones 9\'","R. Jiménez 67\'"}'
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
  if (!raw || raw === 'null' || raw.trim() === '' || raw.trim() === '{}') return [];
  // Strip outer { }
  const inner = raw.replace(/^\{/, '').replace(/\}$/, '').trim();
  if (!inner) return [];

  const results: Array<{ name: string; minute: string }> = [];

  // Split on ," treating each "..." or “...” entry as a token
  // The format is: "entry1","entry2",... or “entry1”,”entry2”,...
  const entryRegex = /["“”]([^"“”]+)["“”]/g;
  let m: RegExpExecArray | null;
  while ((m = entryRegex.exec(inner)) !== null) {
    const entry = m[1].trim(); // e.g. "J. Quiñones 9'"
    if (!entry || entry === ',') continue;
    // Extract trailing minute: digits followed by '
    const minMatch = entry.match(/(\d+)'\s*$/);
    if (minMatch) {
      const minuteStr = minMatch[1] + "'";
      const name = entry.slice(0, entry.lastIndexOf(minMatch[0])).trim();
      results.push({ name: name || entry, minute: minuteStr });
    } else {
      results.push({ name: entry, minute: '' });
    }
  }
  return results;
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
  setActivePanel: (panel: AppSlice['activePanel']) => void;
  setWindowLayer: (layer: AppSlice['windowLayer']) => void;
  setTimezone: (tz: string) => void;
  setCompactMode: (compact: boolean) => void;
  setBgOpacity: (opacity: number) => void;
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

    // App
    activePanel: 'schedule',
    windowLayer: 'normal',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    compactMode: false,
    bgOpacity: 0.90, // Defaults to 0.90 (less transparent than old 0.82)
    setActivePanel: (panel) => set((s) => { s.activePanel = panel; }),
    setWindowLayer: (layer) => set((s) => { s.windowLayer = layer; }),
    setTimezone: (tz) => set((s) => { s.timezone = tz; }),
    setCompactMode: (compact) => set((s) => { s.compactMode = compact; }),
    setBgOpacity: (opacity) => set((s) => { s.bgOpacity = opacity; }),
  }))
);
