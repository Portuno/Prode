import { Match, MatchStage, Team } from './types';

export const TEAMS: Record<string, Team> = {
  ARG: { id: 'arg', name: 'Argentina', flag: '🇦🇷', code: 'ARG' },
  BRA: { id: 'bra', name: 'Brasil', flag: '🇧🇷', code: 'BRA' },
  FRA: { id: 'fra', name: 'Francia', flag: '🇫🇷', code: 'FRA' },
  GER: { id: 'ger', name: 'Alemania', flag: '🇩🇪', code: 'GER' },
  ESP: { id: 'esp', name: 'España', flag: '🇪🇸', code: 'ESP' },
  ENG: { id: 'eng', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG' },
  USA: { id: 'usa', name: 'USA', flag: '🇺🇸', code: 'USA' },
  MEX: { id: 'mex', name: 'México', flag: '🇲🇽', code: 'MEX' },
  CAN: { id: 'can', name: 'Canadá', flag: '🇨🇦', code: 'CAN' },
  JPN: { id: 'jpn', name: 'Japón', flag: '🇯🇵', code: 'JPN' },
  KOR: { id: 'kor', name: 'Corea Sur', flag: '🇰🇷', code: 'KOR' },
  MAR: { id: 'mar', name: 'Marruecos', flag: '🇲🇦', code: 'MAR' },
  POR: { id: 'por', name: 'Portugal', flag: '🇵🇹', code: 'POR' },
  NED: { id: 'ned', name: 'Holanda', flag: '🇳🇱', code: 'NED' },
  URU: { id: 'uru', name: 'Uruguay', flag: '🇺🇾', code: 'URU' },
  COL: { id: 'col', name: 'Colombia', flag: '🇨🇴', code: 'COL' }
};

// Simplified Mock Fixture List for Demo
export const INITIAL_MATCHES: Match[] = [
  // Group A
  { id: 'm1', homeTeam: TEAMS.USA, awayTeam: TEAMS.COL, date: '2026-06-11 16:00', stage: MatchStage.GROUP, group: 'A', finished: false },
  { id: 'm2', homeTeam: TEAMS.MEX, awayTeam: TEAMS.URU, date: '2026-06-11 19:00', stage: MatchStage.GROUP, group: 'A', finished: false },
  { id: 'm3', homeTeam: TEAMS.USA, awayTeam: TEAMS.MEX, date: '2026-06-15 16:00', stage: MatchStage.GROUP, group: 'A', finished: false },
  
  // Group B
  { id: 'm4', homeTeam: TEAMS.ARG, awayTeam: TEAMS.JPN, date: '2026-06-12 13:00', stage: MatchStage.GROUP, group: 'B', finished: false },
  { id: 'm5', homeTeam: TEAMS.ESP, awayTeam: TEAMS.MAR, date: '2026-06-12 16:00', stage: MatchStage.GROUP, group: 'B', finished: false },
  { id: 'm6', homeTeam: TEAMS.ARG, awayTeam: TEAMS.ESP, date: '2026-06-16 14:00', stage: MatchStage.GROUP, group: 'B', finished: false },

  // Group C
  { id: 'm7', homeTeam: TEAMS.BRA, awayTeam: TEAMS.POR, date: '2026-06-13 12:00', stage: MatchStage.GROUP, group: 'C', finished: false },
  { id: 'm8', homeTeam: TEAMS.FRA, awayTeam: TEAMS.ENG, date: '2026-06-13 15:00', stage: MatchStage.GROUP, group: 'C', finished: false },
  
  // Knockouts (Placeholders for demo)
  { id: 'ko1', homeTeam: TEAMS.ARG, awayTeam: TEAMS.BRA, date: '2026-06-25 18:00', stage: MatchStage.FINAL, finished: false },
];
