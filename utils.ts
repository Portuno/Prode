import { Match, Prediction, ScoreResult, UserProde, MatchStage } from './types';

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
        createdAt: Date.now()
    };
};