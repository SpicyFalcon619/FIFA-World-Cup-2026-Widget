import { Match, parseScorers } from '../store/wc2026Store';
import { squads, Player } from '../store/squadData';

// Seeded random helper
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  nextRange(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  shuffle<T>(arr: T[]): T[] {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }
}

export interface MatchLineupPlayer extends Player {
  isStarting: boolean;
  goals: number;
  assists: number;
  yellowCard: boolean;
  redCard: boolean;
  saves: number;
}

export interface TeamLineup {
  formation: string;
  startingXI: MatchLineupPlayer[];
  substitutes: MatchLineupPlayer[];
}

export interface TimelineEvent {
  type: 'goal' | 'card' | 'save' | 'sub';
  minute: number;
  player: string;
  detail: string;
  team: 'home' | 'away';
}

export interface MatchStatItem {
  label: string;
  home: number | string;
  away: number | string;
  homePercent: number;
  awayPercent: number;
}

export interface GeneratedMatchStats {
  home: TeamLineup;
  away: TeamLineup;
  stats: MatchStatItem[];
  timeline: TimelineEvent[];
}

// Fallback generator if squad is missing
function generateFallbackSquad(teamName: string): { coach: string; players: Player[] } {
  const positions: Array<'GK' | 'DEF' | 'MID' | 'FWD'> = [
    'GK',
    'DEF', 'DEF', 'DEF', 'DEF', 'DEF',
    'MID', 'MID', 'MID', 'MID', 'MID',
    'FWD', 'FWD', 'FWD', 'FWD'
  ];
  const coach = "Coach " + teamName;
  const players = positions.map((pos, idx) => ({
    name: `${pos[0]}. Player ${idx + 1}`,
    position: pos,
    number: idx + 1
  }));
  return { coach, players };
}

export function generateMatchStats(match: Match): GeneratedMatchStats {
  const rand = new SeededRandom(match.id);

  // Get squads
  const homeSquad = squads[match.homeTeam] || generateFallbackSquad(match.homeTeam);
  const awaySquad = squads[match.awayTeam] || generateFallbackSquad(match.awayTeam);

  // Parse scorers
  const homeParsedScorers = parseScorers(match.homeScorers);
  const awayParsedScorers = parseScorers(match.awayScorers);

  // Create pool of players
  const buildTeamLineup = (
    squad: typeof homeSquad,
    parsedScorers: typeof homeParsedScorers
  ): TeamLineup => {
    const playersMap = new Map<string, MatchLineupPlayer>();
    squad.players.forEach(p => {
      playersMap.set(p.name.toLowerCase(), {
        ...p,
        isStarting: false,
        goals: 0,
        assists: 0,
        yellowCard: false,
        redCard: false,
        saves: 0,
      });
    });

    // Make sure actual goal scorers are in the roster
    parsedScorers.forEach(s => {
      const key = s.name.toLowerCase();
      if (!playersMap.has(key)) {
        // Find existing player of same position (usually FWD or MID) to override, or add
        playersMap.set(key, {
          name: s.name,
          position: 'FWD',
          number: rand.nextRange(14, 23),
          isStarting: true,
          goals: 0,
          assists: 0,
          yellowCard: false,
          redCard: false,
          saves: 0,
        });
      }
      const p = playersMap.get(key)!;
      p.goals++;
    });

    // Separate by position
    const allPlayers = Array.from(playersMap.values());
    const gks = allPlayers.filter(p => p.position === 'GK');
    const defs = allPlayers.filter(p => p.position === 'DEF');
    const mids = allPlayers.filter(p => p.position === 'MID');
    const fwds = allPlayers.filter(p => p.position === 'FWD');

    // Starting lineup logic (4-4-2 default)
    const startingXI: MatchLineupPlayer[] = [];
    const substitutes: MatchLineupPlayer[] = [];

    // Goalkeeper
    if (gks.length > 0) startingXI.push({ ...gks[0], isStarting: true });
    gks.slice(1).forEach(p => substitutes.push(p));

    // Force goalscorers into starting list
    const scorersInGroup = (group: MatchLineupPlayer[]) => {
      const startingScorers = group.filter(p => p.goals > 0);
      const nonScorers = group.filter(p => p.goals === 0);
      return { startingScorers, nonScorers };
    };

    // Defenders (need 4)
    const { startingScorers: homeDefScorers, nonScorers: homeDefNonScorers } = scorersInGroup(defs);
    const startingDefs = [...homeDefScorers, ...rand.shuffle(homeDefNonScorers)].slice(0, 4);
    startingDefs.forEach(p => { p.isStarting = true; startingXI.push(p); });
    allPlayers.forEach(p => {
      if (p.position === 'DEF' && !startingXI.some(s => s.name === p.name)) {
        substitutes.push(p);
      }
    });

    // Midfielders (need 4)
    const { startingScorers: homeMidScorers, nonScorers: homeMidNonScorers } = scorersInGroup(mids);
    const startingMids = [...homeMidScorers, ...rand.shuffle(homeMidNonScorers)].slice(0, 4);
    startingMids.forEach(p => { p.isStarting = true; startingXI.push(p); });
    allPlayers.forEach(p => {
      if (p.position === 'MID' && !startingXI.some(s => s.name === p.name)) {
        substitutes.push(p);
      }
    });

    // Forwards (need 2)
    const { startingScorers: homeFwdScorers, nonScorers: homeFwdNonScorers } = scorersInGroup(fwds);
    const startingFwds = [...homeFwdScorers, ...rand.shuffle(homeFwdNonScorers)].slice(0, 2);
    startingFwds.forEach(p => { p.isStarting = true; startingXI.push(p); });
    allPlayers.forEach(p => {
      if (p.position === 'FWD' && !startingXI.some(s => s.name === p.name)) {
        substitutes.push(p);
      }
    });

    return {
      formation: "4-4-2",
      startingXI,
      substitutes,
    };
  };

  const homeLineup = buildTeamLineup(homeSquad, homeParsedScorers);
  const awayLineup = buildTeamLineup(awaySquad, awayParsedScorers);

  // Determine timeline events
  const timeline: TimelineEvent[] = [];

  // 1. Goals
  homeParsedScorers.forEach(s => {
    const min = parseInt(s.minute.replace("'", '')) || rand.nextRange(5, 85);
    
    // Choose assist provider (70% chance, from other midfielders/forwards)
    let assistPlayer = "";
    if (rand.next() < 0.70) {
      const candidates = homeLineup.startingXI.filter(pl => pl.position !== 'GK' && pl.name !== s.name);
      if (candidates.length > 0) {
        const ass = rand.pick(candidates);
        ass.assists++;
        assistPlayer = ass.name;
      }
    }

    timeline.push({
      type: 'goal',
      minute: min,
      player: s.name,
      detail: assistPlayer ? `Goal (Assist by ${assistPlayer})` : "Goal",
      team: 'home'
    });
  });

  awayParsedScorers.forEach(s => {
    const min = parseInt(s.minute.replace("'", '')) || rand.nextRange(5, 85);
    
    let assistPlayer = "";
    if (rand.next() < 0.70) {
      const candidates = awayLineup.startingXI.filter(pl => pl.position !== 'GK' && pl.name !== s.name);
      if (candidates.length > 0) {
        const ass = rand.pick(candidates);
        ass.assists++;
        assistPlayer = ass.name;
      }
    }

    timeline.push({
      type: 'goal',
      minute: min,
      player: s.name,
      detail: assistPlayer ? `Goal (Assist by ${assistPlayer})` : "Goal",
      team: 'away'
    });
  });

  // 2. Yellow & Red Cards
  const maxYellows = rand.nextRange(1, 5);
  for (let i = 0; i < maxYellows; i++) {
    const isHome = rand.next() < 0.5;
    const lineup = isHome ? homeLineup : awayLineup;
    const p = rand.pick(lineup.startingXI.filter(pl => pl.position !== 'GK'));
    if (p && !p.yellowCard) {
      p.yellowCard = true;
      const min = rand.nextRange(10, 89);
      timeline.push({
        type: 'card',
        minute: min,
        player: p.name,
        detail: "Yellow Card",
        team: isHome ? 'home' : 'away'
      });
    }
  }

  // 3. Substitutions (2-3 per team, second half)
  const homeSubsCount = rand.nextRange(1, 3);
  const homeAvailableSubs = [...homeLineup.substitutes];
  for (let i = 0; i < homeSubsCount; i++) {
    if (homeAvailableSubs.length === 0) break;
    const playerIn = homeAvailableSubs.shift()!;
    const playerOutCandidates = homeLineup.startingXI.filter(pl => pl.position === playerIn.position && pl.position !== 'GK');
    if (playerOutCandidates.length > 0) {
      const playerOut = rand.pick(playerOutCandidates);
      const min = rand.nextRange(55, 88);
      timeline.push({
        type: 'sub',
        minute: min,
        player: playerIn.name,
        detail: `In for ${playerOut.name}`,
        team: 'home'
      });
    }
  }

  const awaySubsCount = rand.nextRange(1, 3);
  const awayAvailableSubs = [...awayLineup.substitutes];
  for (let i = 0; i < awaySubsCount; i++) {
    if (awayAvailableSubs.length === 0) break;
    const playerIn = awayAvailableSubs.shift()!;
    const playerOutCandidates = awayLineup.startingXI.filter(pl => pl.position === playerIn.position && pl.position !== 'GK');
    if (playerOutCandidates.length > 0) {
      const playerOut = rand.pick(playerOutCandidates);
      const min = rand.nextRange(55, 88);
      timeline.push({
        type: 'sub',
        minute: min,
        player: playerIn.name,
        detail: `In for ${playerOut.name}`,
        team: 'away'
      });
    }
  }

  // 4. Goalkeeper Saves
  const homeGK = homeLineup.startingXI.find(pl => pl.position === 'GK');
  const awayGK = awayLineup.startingXI.find(pl => pl.position === 'GK');

  const homeSavesCount = rand.nextRange(2, 6);
  const awaySavesCount = rand.nextRange(2, 6);

  if (homeGK) {
    homeGK.saves = homeSavesCount;
    for (let i = 0; i < 2; i++) { // show top 2 saves in timeline
      timeline.push({
        type: 'save',
        minute: rand.nextRange(15, 85),
        player: homeGK.name,
        detail: "Crucial diving save",
        team: 'home'
      });
    }
  }

  if (awayGK) {
    awayGK.saves = awaySavesCount;
    for (let i = 0; i < 2; i++) {
      timeline.push({
        type: 'save',
        minute: rand.nextRange(15, 85),
        player: awayGK.name,
        detail: "Superb reflex save",
        team: 'away'
      });
    }
  }

  // Sort timeline chronologically
  timeline.sort((a, b) => a.minute - b.minute);

  // If live, filter events up to the current minute
  const isLive = match.status === 'LIVE';
  const currentMinute = match.minute ?? 0;
  const filteredTimeline = isLive
    ? timeline.filter(ev => ev.minute <= currentMinute)
    : timeline;

  // Compile Match Stats
  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  
  // Possession matching scoreline slightly
  let homePossession = 50;
  if (homeScore > awayScore) {
    homePossession = rand.nextRange(48, 62);
  } else if (awayScore > homeScore) {
    homePossession = rand.nextRange(38, 52);
  } else {
    homePossession = rand.nextRange(45, 55);
  }
  const awayPossession = 100 - homePossession;

  // Shots (Home vs Away)
  const homeShots = homeScore * 3 + rand.nextRange(4, 12);
  const awayShots = awayScore * 3 + rand.nextRange(4, 12);
  const homeShotsOnTarget = homeScore + rand.nextRange(1, Math.floor(homeShots/2));
  const awayShotsOnTarget = awayScore + rand.nextRange(1, Math.floor(awayShots/2));

  // Count cards actually in filtered timeline
  const homeYellows = filteredTimeline.filter(e => e.type === 'card' && e.team === 'home' && e.detail.includes("Yellow")).length;
  const awayYellows = filteredTimeline.filter(e => e.type === 'card' && e.team === 'away' && e.detail.includes("Yellow")).length;
  const homeReds = filteredTimeline.filter(e => e.type === 'card' && e.team === 'home' && e.detail.includes("Red")).length;
  const awayReds = filteredTimeline.filter(e => e.type === 'card' && e.team === 'away' && e.detail.includes("Red")).length;

  const makeStatItem = (label: string, homeVal: number, awayVal: number): MatchStatItem => {
    const total = homeVal + awayVal;
    const homePercent = total > 0 ? Math.round((homeVal / total) * 100) : 50;
    const awayPercent = total > 0 ? 100 - homePercent : 50;
    return {
      label,
      home: homeVal,
      away: awayVal,
      homePercent,
      awayPercent,
    };
  };

  const statsList: MatchStatItem[] = [
    {
      label: "Possession",
      home: `${homePossession}%`,
      away: `${awayPossession}%`,
      homePercent: homePossession,
      awayPercent: awayPossession,
    },
    makeStatItem("Shots", homeShots, awayShots),
    makeStatItem("Shots on Target", homeShotsOnTarget, awayShotsOnTarget),
    makeStatItem("Fouls", rand.nextRange(6, 16), rand.nextRange(6, 16)),
    makeStatItem("Corners", rand.nextRange(2, 9), rand.nextRange(2, 9)),
    makeStatItem("Offsides", rand.nextRange(0, 4), rand.nextRange(0, 4)),
    makeStatItem("Goalkeeper Saves", awayShotsOnTarget - awayScore, homeShotsOnTarget - homeScore), // stats show saves against opponent's target shots
    makeStatItem("Yellow Cards", homeYellows, awayYellows),
    makeStatItem("Red Cards", homeReds, awayReds),
  ];

  return {
    home: homeLineup,
    away: awayLineup,
    timeline: filteredTimeline,
    stats: statsList,
  };
}
