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
  rating: number;
}

export interface TeamLineup {
  formation: string; // e.g. "4-3-3"
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
    'GK', 'GK', 'GK',
    'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF',
    'MID', 'MID', 'MID', 'MID', 'MID', 'MID', 'MID', 'MID',
    'FWD', 'FWD', 'FWD', 'FWD', 'FWD', 'FWD'
  ];
  const coach = "Coach " + teamName;
  const players = positions.map((pos, idx) => ({
    name: `${pos[0]}. Player ${idx + 1}`,
    position: pos,
    number: idx + 1
  }));
  return { coach, players };
}

const FORMATIONS = ["4-3-3", "4-2-3-1", "3-4-3", "4-4-2", "3-5-2"];

export function generateMatchStats(match: Match): GeneratedMatchStats {
  const rand = new SeededRandom(match.id);

  const homeSquad = squads[match.homeTeam] || generateFallbackSquad(match.homeTeam);
  const awaySquad = squads[match.awayTeam] || generateFallbackSquad(match.awayTeam);

  const homeParsedScorers = parseScorers(match.homeScorers);
  const awayParsedScorers = parseScorers(match.awayScorers);

  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const homeRedCount = match.homeRedCards ?? 0;
  const awayRedCount = match.awayRedCards ?? 0;

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
        rating: 6.0,
      });
    });

    // Make sure goalscorers are in the roster
    parsedScorers.forEach(s => {
      const key = s.name.toLowerCase();
      if (!playersMap.has(key)) {
        playersMap.set(key, {
          name: s.name,
          position: 'FWD',
          number: rand.nextRange(7, 26),
          isStarting: true,
          goals: 0,
          assists: 0,
          yellowCard: false,
          redCard: false,
          saves: 0,
          rating: 6.0,
        });
      }
      playersMap.get(key)!.goals++;
    });

    const allPlayers = Array.from(playersMap.values());
    const gks = allPlayers.filter(p => p.position === 'GK');
    const defs = allPlayers.filter(p => p.position === 'DEF');
    const mids = allPlayers.filter(p => p.position === 'MID');
    const fwds = allPlayers.filter(p => p.position === 'FWD');

    // Pick formation
    const formationStr = rand.pick(FORMATIONS);
    const [defC, midC, fwdC] = formationStr.split('-').map(Number);
    // for 4-2-3-1 etc, sum the last bits
    const finalDefC = defC;
    const finalMidC = formationStr === "4-2-3-1" ? 5 : midC;
    const finalFwdC = formationStr === "4-2-3-1" ? 1 : fwdC;

    const startingXI: MatchLineupPlayer[] = [];
    const substitutes: MatchLineupPlayer[] = [];

    // GK
    if (gks.length > 0) startingXI.push({ ...gks[0], isStarting: true });
    gks.slice(1).forEach(p => substitutes.push(p));

    const distribute = (group: MatchLineupPlayer[], count: number) => {
      const scorers = group.filter(p => p.goals > 0);
      const nonScorers = group.filter(p => p.goals === 0);
      const selected = [...scorers, ...rand.shuffle(nonScorers)].slice(0, count);
      selected.forEach(p => { p.isStarting = true; startingXI.push(p); });
      group.forEach(p => {
        if (!startingXI.find(s => s.name === p.name)) substitutes.push(p);
      });
    };

    distribute(defs, finalDefC);
    distribute(mids, finalMidC);
    distribute(fwds, finalFwdC);

    return { formation: formationStr, startingXI, substitutes };
  };

  const homeLineup = buildTeamLineup(homeSquad, homeParsedScorers);
  const awayLineup = buildTeamLineup(awaySquad, awayParsedScorers);

  const timeline: TimelineEvent[] = [];

  // Helper to process goals & assists
  const processGoals = (parsedScorers: typeof homeParsedScorers, lineup: TeamLineup, teamType: 'home' | 'away') => {
    parsedScorers.forEach(s => {
      const min = parseInt(s.minute.replace("'", '')) || rand.nextRange(5, 85);
      
      let assistPlayer = "";
      if (rand.next() < 0.65) {
        // Find someone else who is NOT the scorer and NOT the GK
        const candidates = lineup.startingXI.filter(pl => pl.position !== 'GK' && pl.name.toLowerCase() !== s.name.toLowerCase());
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
        team: teamType
      });
    });
  };

  processGoals(homeParsedScorers, homeLineup, 'home');
  processGoals(awayParsedScorers, awayLineup, 'away');

  // Process Red Cards perfectly according to API
  const processRedCards = (redCount: number, lineup: TeamLineup, teamType: 'home' | 'away') => {
    const players = rand.shuffle(lineup.startingXI.filter(p => p.position !== 'GK')).slice(0, redCount);
    players.forEach(p => {
      p.redCard = true;
      timeline.push({
        type: 'card',
        minute: rand.nextRange(20, 89),
        player: p.name,
        detail: "Red Card",
        team: teamType
      });
    });
  };
  processRedCards(homeRedCount, homeLineup, 'home');
  processRedCards(awayRedCount, awayLineup, 'away');

  // Process Yellow Cards (ensure no reds get yellows)
  const homeYellowsCount = rand.nextRange(1, 4);
  const awayYellowsCount = rand.nextRange(1, 4);

  const processYellows = (count: number, lineup: TeamLineup, teamType: 'home' | 'away') => {
    const candidates = rand.shuffle(lineup.startingXI.filter(p => !p.redCard && p.position !== 'GK')).slice(0, count);
    candidates.forEach(p => {
      p.yellowCard = true;
      timeline.push({
        type: 'card',
        minute: rand.nextRange(10, 89),
        player: p.name,
        detail: "Yellow Card",
        team: teamType
      });
    });
  };
  processYellows(homeYellowsCount, homeLineup, 'home');
  processYellows(awayYellowsCount, awayLineup, 'away');

  // Subs
  const processSubs = (lineup: TeamLineup, teamType: 'home' | 'away') => {
    const subsCount = rand.nextRange(2, 5);
    const availableSubs = [...lineup.substitutes];
    for (let i = 0; i < subsCount; i++) {
      if (availableSubs.length === 0) break;
      const playerIn = availableSubs.shift()!;
      const playerOutCandidates = lineup.startingXI.filter(pl => pl.position === playerIn.position && pl.position !== 'GK' && !pl.redCard);
      if (playerOutCandidates.length > 0) {
        const playerOut = rand.pick(playerOutCandidates);
        timeline.push({
          type: 'sub',
          minute: rand.nextRange(55, 88),
          player: playerIn.name,
          detail: `In for ${playerOut.name}`,
          team: teamType
        });
      }
    }
  };
  processSubs(homeLineup, 'home');
  processSubs(awayLineup, 'away');

  // Saves (Strictly GK only)
  const homeGK = homeLineup.startingXI.find(p => p.position === 'GK');
  const awayGK = awayLineup.startingXI.find(p => p.position === 'GK');
  
  const homeShotsOnTarget = homeScore + rand.nextRange(2, 6);
  const awayShotsOnTarget = awayScore + rand.nextRange(2, 6);
  
  const homeSaves = awayShotsOnTarget - awayScore;
  const awaySaves = homeShotsOnTarget - homeScore;

  if (homeGK) {
    homeGK.saves = homeSaves;
    if (homeSaves > 0) {
      timeline.push({ type: 'save', minute: rand.nextRange(15, 85), player: homeGK.name, detail: "Crucial save", team: 'home' });
    }
  }
  if (awayGK) {
    awayGK.saves = awaySaves;
    if (awaySaves > 0) {
      timeline.push({ type: 'save', minute: rand.nextRange(15, 85), player: awayGK.name, detail: "Superb save", team: 'away' });
    }
  }

  timeline.sort((a, b) => a.minute - b.minute);

  const isLive = match.status === 'LIVE';
  const currentMinute = match.minute ?? 0;
  const filteredTimeline = isLive ? timeline.filter(ev => ev.minute <= currentMinute) : timeline;

  // Calculate Match Ratings
  const ratePlayers = (lineup: TeamLineup, oppScore: number) => {
    [...lineup.startingXI, ...lineup.substitutes].forEach(p => {
      let base = 6.0 + (rand.nextRange(-4, 4) / 10); // 5.6 to 6.4
      
      base += (p.goals * 1.2);
      base += (p.assists * 0.8);
      if (p.yellowCard) base -= 0.4;
      if (p.redCard) base -= 1.5;
      
      if (p.position === 'GK' && oppScore === 0) base += 1.0;
      if (p.position === 'DEF' && oppScore === 0) base += 0.8;
      if (p.position === 'DEF' && oppScore >= 3) base -= 0.8;

      p.rating = Math.max(3.0, Math.min(10.0, base));
    });
  };

  ratePlayers(homeLineup, awayScore);
  ratePlayers(awayLineup, homeScore);

  let homePossession = 50;
  if (homeScore > awayScore) homePossession = rand.nextRange(52, 62);
  else if (awayScore > homeScore) homePossession = rand.nextRange(38, 48);
  else homePossession = rand.nextRange(45, 55);

  const makeStatItem = (label: string, homeVal: number, awayVal: number): MatchStatItem => {
    const total = homeVal + awayVal;
    const homePercent = total > 0 ? Math.round((homeVal / total) * 100) : 50;
    const awayPercent = total > 0 ? 100 - homePercent : 50;
    return { label, home: homeVal, away: awayVal, homePercent, awayPercent };
  };

  const statsList: MatchStatItem[] = [
    { label: "Possession", home: `${homePossession}%`, away: `${100 - homePossession}%`, homePercent: homePossession, awayPercent: 100 - homePossession },
    makeStatItem("Shots", homeShotsOnTarget + rand.nextRange(2, 6), awayShotsOnTarget + rand.nextRange(2, 6)),
    makeStatItem("Shots on Target", homeShotsOnTarget, awayShotsOnTarget),
    makeStatItem("Fouls", rand.nextRange(8, 15), rand.nextRange(8, 15)),
    makeStatItem("Corners", rand.nextRange(2, 8), rand.nextRange(2, 8)),
    makeStatItem("Goalkeeper Saves", homeSaves, awaySaves),
    makeStatItem("Yellow Cards", homeYellowsCount, awayYellowsCount),
    makeStatItem("Red Cards", homeRedCount, awayRedCount),
  ];

  return {
    home: homeLineup,
    away: awayLineup,
    timeline: filteredTimeline,
    stats: statsList,
  };
}
