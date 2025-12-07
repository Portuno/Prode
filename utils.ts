
import { Match, Prediction, ScoreResult, UserProde, MatchStage, GroupStats, Team } from './types';
import { TEAMS } from './constants';

// Points System
const POINTS_EXACT = 5;
const POINTS_RESULT = 3;
const POINTS_FAIL = 0;

export const generateUniqueId = (country: string): string => {
  const cleanCountry = country.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  const randomHash = Math.random().toString(36).substring(2, 6).toUpperCase();
  // Fixed year hash to 2026 as per request, combined with randomness
  const secureRandom = window.crypto.getRandomValues(new Uint32Array(1))[0] % 10000;
  return `PRODE-${cleanCountry}-2026-${randomHash}`;
};

export const calculatePoints = (prediction: Prediction | undefined, match: Match): ScoreResult => {
  if (!prediction || !match.finished || match.officialHomeScore === undefined || match.officialAwayScore === undefined) {
    return { matchId: match.id, points: 0, status: 'PENDIENTE' };
  }

  const predHome = Number(prediction.homeScore);
  const predAway = Number(prediction.awayScore);
  const realHome = match.officialHomeScore;
  const realAway = match.officialAwayScore;

  if (isNaN(predHome) || isNaN(predAway)) {
     return { matchId: match.id, points: 0, status: 'PENDIENTE' };
  }

  // 1. Exact Match
  if (predHome === realHome && predAway === realAway) {
    return { matchId: match.id, points: POINTS_EXACT, status: 'EXACTO' };
  }

  // 2. Result Match (Winner or Draw)
  const predDiff = predHome - predAway;
  const realDiff = realHome - realAway;

  const predWinner = predDiff > 0 ? 'HOME' : predDiff < 0 ? 'AWAY' : 'DRAW';
  const realWinner = realDiff > 0 ? 'HOME' : realDiff < 0 ? 'AWAY' : 'DRAW';

  if (predWinner === realWinner) {
    return { matchId: match.id, points: POINTS_RESULT, status: 'GANADOR' };
  }

  // 3. Fail
  return { matchId: match.id, points: POINTS_FAIL, status: 'FALLO' };
};

export const getTotalScore = (predictions: Record<string, Prediction>, matches: Match[]): number => {
  return matches.reduce((total, match) => {
    const pred = predictions[match.id];
    return total + calculatePoints(pred, match).points;
  }, 0);
};

export const saveProde = (prode: UserProde) => {
  localStorage.setItem('my_prode', JSON.stringify(prode));
};

export const loadProde = (): UserProde | null => {
  const data = localStorage.getItem('my_prode');
  return data ? JSON.parse(data) : null;
};

// Mock function to simulate "AI" finding results
export const mockSimulateResults = (matches: Match[]): Match[] => {
  return matches.map(m => {
    if (m.finished) return m;
    // 10% chance a match has finished "just now" for demo purposes
    const hasFinished = Math.random() > 0.8; 
    if (hasFinished) {
      return {
        ...m,
        finished: true,
        officialHomeScore: Math.floor(Math.random() * 4),
        officialAwayScore: Math.floor(Math.random() * 4)
      };
    }
    return m;
  });
};

// For comparison demo: Generate a fake "Friend" prode
export const generateMockFriendProde = (matches: Match[], friendId: string): UserProde => {
    const predictions: Record<string, Prediction> = {};
    matches.forEach(m => {
        predictions[m.id] = {
            matchId: m.id,
            homeScore: Math.floor(Math.random() * 3),
            awayScore: Math.floor(Math.random() * 3)
        };
    });
    return {
        userId: friendId,
        countryCode: 'BRA',
        predictions,
        playoffResolutions: {},
        bracket: {},
        createdAt: Date.now()
    };
};

// --- LOGIC FOR STAGE 3: BRACKET GENERATION ---

export const calculateGroupStandings = (matches: Match[], predictions: Record<string, Prediction>): Record<string, GroupStats[]> => {
    const standings: Record<string, Record<string, GroupStats>> = {};

    matches.filter(m => m.stage === MatchStage.GROUP).forEach(m => {
        const group = m.group || 'A';
        const pred = predictions[m.id];
        
        // Initialize teams if not exists
        if (!standings[group]) standings[group] = {};
        if (!standings[group][m.homeTeam.id]) standings[group][m.homeTeam.id] = { teamId: m.homeTeam.id, points: 0, gd: 0, gf: 0, group };
        if (!standings[group][m.awayTeam.id]) standings[group][m.awayTeam.id] = { teamId: m.awayTeam.id, points: 0, gd: 0, gf: 0, group };

        if (pred && pred.homeScore !== '' && pred.awayScore !== '') {
            const h = Number(pred.homeScore);
            const a = Number(pred.awayScore);
            
            standings[group][m.homeTeam.id].gf += h;
            standings[group][m.awayTeam.id].gf += a;
            standings[group][m.homeTeam.id].gd += (h - a);
            standings[group][m.awayTeam.id].gd += (a - h);

            if (h > a) {
                standings[group][m.homeTeam.id].points += 3;
            } else if (a > h) {
                standings[group][m.awayTeam.id].points += 3;
            } else {
                standings[group][m.homeTeam.id].points += 1;
                standings[group][m.awayTeam.id].points += 1;
            }
        }
    });

    // Sort each group
    const sortedStandings: Record<string, GroupStats[]> = {};
    Object.keys(standings).forEach(g => {
        sortedStandings[g] = Object.values(standings[g]).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.gd !== a.gd) return b.gd - a.gd;
            return b.gf - a.gf;
        });
    });

    return sortedStandings;
};

// Simplified Logic for 2026 R32 Structure
// Top 2 of each group (24) + 8 Best 3rd Places
export const generateKnockoutMatches = (standings: Record<string, GroupStats[]>, allTeamsMap: Record<string, Team>): Match[] => {
    // 1. Flatten all teams with their ranks
    const firsts: Record<string, Team> = {};
    const seconds: Record<string, Team> = {};
    const thirds: GroupStats[] = [];

    Object.keys(standings).forEach(group => {
        const teams = standings[group];
        if (teams[0]) firsts[group] = allTeamsMap[teams[0].teamId] || TEAMS.MEX; // Fallback
        if (teams[1]) seconds[group] = allTeamsMap[teams[1].teamId] || TEAMS.MEX;
        if (teams[2]) thirds.push(teams[2]);
    });

    // Sort 3rd places to get top 8
    thirds.sort((a, b) => {
         if (b.points !== a.points) return b.points - a.points;
         if (b.gd !== a.gd) return b.gd - a.gd;
         return b.gf - a.gf;
    });

    const bestThirds = thirds.slice(0, 8);
    // Helper to get team or placeholder
    const get3rd = (index: number) => {
        if (bestThirds[index]) return allTeamsMap[bestThirds[index].teamId];
        return TEAMS.MEX; // Fallback
    };

    // 2. Define Matches (Simplified 2026 Bracket)
    // There are 16 matches in R32.
    // IDs: 33 to 48.
    
    // THIS IS A HYPOTHETICAL MAPPING for the demo, as 2026 chart is dynamic based on which groups qualify
    const r32Matches: Match[] = [
        // Left Side
        { id: 'm33', stage: MatchStage.R32, homeTeam: firsts['A'], awayTeam: get3rd(0), date: '28 Jun', finished: false, nextMatchId: 'm49' },
        { id: 'm34', stage: MatchStage.R32, homeTeam: seconds['B'], awayTeam: seconds['F'], date: '28 Jun', finished: false, nextMatchId: 'm49' },
        
        { id: 'm35', stage: MatchStage.R32, homeTeam: firsts['E'], awayTeam: seconds['D'], date: '29 Jun', finished: false, nextMatchId: 'm50' },
        { id: 'm36', stage: MatchStage.R32, homeTeam: firsts['C'], awayTeam: get3rd(1), date: '29 Jun', finished: false, nextMatchId: 'm50' },

        { id: 'm37', stage: MatchStage.R32, homeTeam: firsts['I'], awayTeam: get3rd(2), date: '29 Jun', finished: false, nextMatchId: 'm51' },
        { id: 'm38', stage: MatchStage.R32, homeTeam: seconds['G'], awayTeam: seconds['J'], date: '29 Jun', finished: false, nextMatchId: 'm51' },
        
        { id: 'm39', stage: MatchStage.R32, homeTeam: firsts['G'], awayTeam: get3rd(3), date: '30 Jun', finished: false, nextMatchId: 'm52' },
        { id: 'm40', stage: MatchStage.R32, homeTeam: seconds['H'], awayTeam: seconds['K'], date: '30 Jun', finished: false, nextMatchId: 'm52' },

        // Right Side
        { id: 'm41', stage: MatchStage.R32, homeTeam: firsts['B'], awayTeam: get3rd(4), date: '30 Jun', finished: false, nextMatchId: 'm53' },
        { id: 'm42', stage: MatchStage.R32, homeTeam: seconds['A'], awayTeam: seconds['C'], date: '30 Jun', finished: false, nextMatchId: 'm53' },
        
        { id: 'm43', stage: MatchStage.R32, homeTeam: firsts['F'], awayTeam: seconds['E'], date: '01 Jul', finished: false, nextMatchId: 'm54' },
        { id: 'm44', stage: MatchStage.R32, homeTeam: firsts['D'], awayTeam: get3rd(5), date: '01 Jul', finished: false, nextMatchId: 'm54' },

        { id: 'm45', stage: MatchStage.R32, homeTeam: firsts['J'], awayTeam: get3rd(6), date: '02 Jul', finished: false, nextMatchId: 'm55' },
        { id: 'm46', stage: MatchStage.R32, homeTeam: seconds['I'], awayTeam: seconds['L'], date: '02 Jul', finished: false, nextMatchId: 'm55' },

        { id: 'm47', stage: MatchStage.R32, homeTeam: firsts['K'], awayTeam: get3rd(7), date: '02 Jul', finished: false, nextMatchId: 'm56' },
        { id: 'm48', stage: MatchStage.R32, homeTeam: firsts['H'], awayTeam: seconds['G'], date: '02 Jul', finished: false, nextMatchId: 'm56' },
    ];

    // R16 Placeholders (m49 to m56)
    const r16Matches: Match[] = [
        { id: 'm49', stage: MatchStage.R16, homeTeam: TEAMS.MEX, awayTeam: TEAMS.MEX, date: '04 Jul', finished: false, nextMatchId: 'm57' },
        { id: 'm50', stage: MatchStage.R16, homeTeam: TEAMS.MEX, awayTeam: TEAMS.MEX, date: '04 Jul', finished: false, nextMatchId: 'm57' },
        { id: 'm51', stage: MatchStage.R16, homeTeam: TEAMS.MEX, awayTeam: TEAMS.MEX, date: '05 Jul', finished: false, nextMatchId: 'm58' },
        { id: 'm52', stage: MatchStage.R16, homeTeam: TEAMS.MEX, awayTeam: TEAMS.MEX, date: '05 Jul', finished: false, nextMatchId: 'm58' },
        { id: 'm53', stage: MatchStage.R16, homeTeam: TEAMS.MEX, awayTeam: TEAMS.MEX, date: '06 Jul', finished: false, nextMatchId: 'm59' },
        { id: 'm54', stage: MatchStage.R16, homeTeam: TEAMS.MEX, awayTeam: TEAMS.MEX, date: '06 Jul', finished: false, nextMatchId: 'm59' },
        { id: 'm55', stage: MatchStage.R16, homeTeam: TEAMS.MEX, awayTeam: TEAMS.MEX, date: '07 Jul', finished: false, nextMatchId: 'm60' },
        { id: 'm56', stage: MatchStage.R16, homeTeam: TEAMS.MEX, awayTeam: TEAMS.MEX, date: '07 Jul', finished: false, nextMatchId: 'm60' },
    ];

    // QF Placeholders (m57 to m60)
    const qfMatches: Match[] = [
        { id: 'm57', stage: MatchStage.QF, homeTeam: TEAMS.MEX, awayTeam: TEAMS.MEX, date: '10 Jul', finished: false, nextMatchId: 'm61' },
        { id: 'm58', stage: MatchStage.QF, homeTeam: TEAMS.MEX, awayTeam: TEAMS.MEX, date: '10 Jul', finished: false, nextMatchId: 'm61' },
        { id: 'm59', stage: MatchStage.QF, homeTeam: TEAMS.MEX, awayTeam: TEAMS.MEX, date: '11 Jul', finished: false, nextMatchId: 'm62' },
        { id: 'm60', stage: MatchStage.QF, homeTeam: TEAMS.MEX, awayTeam: TEAMS.MEX, date: '11 Jul', finished: false, nextMatchId: 'm62' },
    ];

    // SF Placeholders (m61, m62)
    const sfMatches: Match[] = [
        { id: 'm61', stage: MatchStage.SF, homeTeam: TEAMS.MEX, awayTeam: TEAMS.MEX, date: '14 Jul', finished: false, nextMatchId: 'm64' },
        { id: 'm62', stage: MatchStage.SF, homeTeam: TEAMS.MEX, awayTeam: TEAMS.MEX, date: '15 Jul', finished: false, nextMatchId: 'm64' },
    ];

    // Final (m64)
    const finalMatch: Match[] = [
        { id: 'm64', stage: MatchStage.FINAL, homeTeam: TEAMS.MEX, awayTeam: TEAMS.MEX, date: '19 Jul', finished: false },
    ];

    return [...r32Matches, ...r16Matches, ...qfMatches, ...sfMatches, ...finalMatch];
};
