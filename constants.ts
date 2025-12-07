
import { Match, MatchStage, Team } from './types';

export const TEAMS: Record<string, Team> = {
  // Group A
  MEX: { id: 'mex', name: 'México', flag: '🇲🇽', code: 'MEX', flagCode: 'mx' },
  RSA: { id: 'rsa', name: 'Sudáfrica', flag: '🇿🇦', code: 'RSA', flagCode: 'za' },
  KOR: { id: 'kor', name: 'Rep. de Corea', flag: '🇰🇷', code: 'KOR', flagCode: 'kr' },
  EUR_A: { id: 'eur_a', name: 'UEFA Playoff A', flag: '🇪🇺', code: 'EUR', flagCode: 'eu' }, // CZE/DEN/MKD/IRL

  // Group B
  CAN: { id: 'can', name: 'Canadá', flag: '🇨🇦', code: 'CAN', flagCode: 'ca' },
  EUR_B: { id: 'eur_b', name: 'UEFA Playoff B', flag: '🇪🇺', code: 'EUR', flagCode: 'eu' }, // ITA/BIH/WAL/NIR
  QAT: { id: 'qat', name: 'Catar', flag: '🇶🇦', code: 'QAT', flagCode: 'qa' },
  SUI: { id: 'sui', name: 'Suiza', flag: '🇨🇭', code: 'SUI', flagCode: 'ch' },

  // Group C
  BRA: { id: 'bra', name: 'Brasil', flag: '🇧🇷', code: 'BRA', flagCode: 'br' },
  MAR: { id: 'mar', name: 'Marruecos', flag: '🇲🇦', code: 'MAR', flagCode: 'ma' },
  HAI: { id: 'hai', name: 'Haití', flag: '🇭🇹', code: 'HAI', flagCode: 'ht' },
  SCO: { id: 'sco', name: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', code: 'SCO', flagCode: 'gb-sct' },

  // Group D
  USA: { id: 'usa', name: 'USA', flag: '🇺🇸', code: 'USA', flagCode: 'us' },
  PAR: { id: 'par', name: 'Paraguay', flag: '🇵🇾', code: 'PAR', flagCode: 'py' },
  AUS: { id: 'aus', name: 'Australia', flag: '🇦🇺', code: 'AUS', flagCode: 'au' },
  EUR_C: { id: 'eur_c', name: 'UEFA Playoff C', flag: '🇪🇺', code: 'EUR', flagCode: 'eu' }, // TUR/ROU/SVK/KOS

  // Group E
  GER: { id: 'ger', name: 'Alemania', flag: '🇩🇪', code: 'GER', flagCode: 'de' },
  CUW: { id: 'cuw', name: 'Curazao', flag: '🇨🇼', code: 'CUW', flagCode: 'cw' },
  CIV: { id: 'civ', name: 'Costa de Marfil', flag: '🇨🇮', code: 'CIV', flagCode: 'ci' },
  ECU: { id: 'ecu', name: 'Ecuador', flag: '🇪🇨', code: 'ECU', flagCode: 'ec' },

  // Group F
  NED: { id: 'ned', name: 'Países Bajos', flag: '🇳🇱', code: 'NED', flagCode: 'nl' },
  JPN: { id: 'jpn', name: 'Japón', flag: '🇯🇵', code: 'JPN', flagCode: 'jp' },
  EUR_D: { id: 'eur_d', name: 'UEFA Playoff D', flag: '🇪🇺', code: 'EUR', flagCode: 'eu' }, // UKR/SWE/POL/ALB
  TUN: { id: 'tun', name: 'Túnez', flag: '🇹🇳', code: 'TUN', flagCode: 'tn' },

  // Group G
  BEL: { id: 'bel', name: 'Bélgica', flag: '🇧🇪', code: 'BEL', flagCode: 'be' },
  EGY: { id: 'egy', name: 'Egipto', flag: '🇪🇬', code: 'EGY', flagCode: 'eg' },
  IRN: { id: 'irn', name: 'Irán', flag: '🇮🇷', code: 'IRN', flagCode: 'ir' },
  NZL: { id: 'nzl', name: 'Nueva Zelanda', flag: '🇳🇿', code: 'NZL', flagCode: 'nz' },

  // Group H
  ESP: { id: 'esp', name: 'España', flag: '🇪🇸', code: 'ESP', flagCode: 'es' },
  CPV: { id: 'cpv', name: 'Cabo Verde', flag: '🇨🇻', code: 'CPV', flagCode: 'cv' },
  KSA: { id: 'ksa', name: 'Arabia Saudí', flag: '🇸🇦', code: 'KSA', flagCode: 'sa' },
  URU: { id: 'uru', name: 'Uruguay', flag: '🇺🇾', code: 'URU', flagCode: 'uy' },

  // Group I
  FRA: { id: 'fra', name: 'Francia', flag: '🇫🇷', code: 'FRA', flagCode: 'fr' },
  SEN: { id: 'sen', name: 'Senegal', flag: '🇸🇳', code: 'SEN', flagCode: 'sn' },
  IPO_A: { id: 'ipo_a', name: 'Playoff Inter A', flag: '🏳️', code: 'IPO', flagCode: 'un' }, // IRQ/BOL/SUR
  NOR: { id: 'nor', name: 'Noruega', flag: '🇳🇴', code: 'NOR', flagCode: 'no' },

  // Group J
  ARG: { id: 'arg', name: 'Argentina', flag: '🇦🇷', code: 'ARG', flagCode: 'ar' },
  ALG: { id: 'alg', name: 'Argelia', flag: '🇩🇿', code: 'ALG', flagCode: 'dz' },
  AUT: { id: 'aut', name: 'Austria', flag: '🇦🇹', code: 'AUT', flagCode: 'at' },
  JOR: { id: 'jor', name: 'Jordania', flag: '🇯🇴', code: 'JOR', flagCode: 'jo' },

  // Group K
  POR: { id: 'por', name: 'Portugal', flag: '🇵🇹', code: 'POR', flagCode: 'pt' },
  IPO_B: { id: 'ipo_b', name: 'Playoff Inter B', flag: '🏳️', code: 'IPO', flagCode: 'un' }, // COD/JAM/NCL
  UZB: { id: 'uzb', name: 'Uzbekistán', flag: '🇺🇿', code: 'UZB', flagCode: 'uz' },
  COL: { id: 'col', name: 'Colombia', flag: '🇨🇴', code: 'COL', flagCode: 'co' },

  // Group L
  ENG: { id: 'eng', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG', flagCode: 'gb-eng' },
  CRO: { id: 'cro', name: 'Croacia', flag: '🇭🇷', code: 'CRO', flagCode: 'hr' },
  GHA: { id: 'gha', name: 'Ghana', flag: '🇬🇭', code: 'GHA', flagCode: 'gh' },
  PAN: { id: 'pan', name: 'Panamá', flag: '🇵🇦', code: 'PAN', flagCode: 'pa' },
};

export const INITIAL_MATCHES: Match[] = [
  // --- GRUPO A ---
  { id: 'a1', group: 'A', stage: MatchStage.GROUP, date: '11 Jun 15:00', stadium: 'Estadio Ciudad de México', homeTeam: TEAMS.MEX, awayTeam: TEAMS.RSA, finished: false },
  { id: 'a2', group: 'A', stage: MatchStage.GROUP, date: '11 Jun 22:00', stadium: 'Estadio Guadalajara', homeTeam: TEAMS.KOR, awayTeam: TEAMS.EUR_A, finished: false },
  { id: 'a3', group: 'A', stage: MatchStage.GROUP, date: '18 Jun 12:00', stadium: 'Atlanta Stadium', homeTeam: TEAMS.EUR_A, awayTeam: TEAMS.RSA, finished: false },
  { id: 'a4', group: 'A', stage: MatchStage.GROUP, date: '18 Jun 21:00', stadium: 'Estadio Guadalajara', homeTeam: TEAMS.MEX, awayTeam: TEAMS.KOR, finished: false },
  { id: 'a5', group: 'A', stage: MatchStage.GROUP, date: '24 Jun 21:00', stadium: 'Estadio Ciudad de México', homeTeam: TEAMS.EUR_A, awayTeam: TEAMS.MEX, finished: false },
  { id: 'a6', group: 'A', stage: MatchStage.GROUP, date: '24 Jun 21:00', stadium: 'Estadio Monterrey', homeTeam: TEAMS.RSA, awayTeam: TEAMS.KOR, finished: false },

  // --- GRUPO B ---
  { id: 'b1', group: 'B', stage: MatchStage.GROUP, date: '12 Jun 15:00', stadium: 'Toronto Stadium', homeTeam: TEAMS.CAN, awayTeam: TEAMS.EUR_B, finished: false },
  { id: 'b2', group: 'B', stage: MatchStage.GROUP, date: '13 Jun 15:00', stadium: 'SF Bay Area Stadium', homeTeam: TEAMS.QAT, awayTeam: TEAMS.SUI, finished: false },
  { id: 'b3', group: 'B', stage: MatchStage.GROUP, date: '18 Jun 15:00', stadium: 'Los Angeles Stadium', homeTeam: TEAMS.SUI, awayTeam: TEAMS.EUR_B, finished: false },
  { id: 'b4', group: 'B', stage: MatchStage.GROUP, date: '18 Jun 18:00', stadium: 'BC Place Vancouver', homeTeam: TEAMS.CAN, awayTeam: TEAMS.QAT, finished: false },
  { id: 'b5', group: 'B', stage: MatchStage.GROUP, date: '24 Jun 15:00', stadium: 'BC Place Vancouver', homeTeam: TEAMS.SUI, awayTeam: TEAMS.CAN, finished: false },
  { id: 'b6', group: 'B', stage: MatchStage.GROUP, date: '24 Jun 15:00', stadium: 'Seattle Stadium', homeTeam: TEAMS.EUR_B, awayTeam: TEAMS.QAT, finished: false },

  // --- GRUPO C ---
  { id: 'c1', group: 'C', stage: MatchStage.GROUP, date: '13 Jun 18:00', stadium: 'NY NJ Stadium', homeTeam: TEAMS.BRA, awayTeam: TEAMS.MAR, finished: false },
  { id: 'c2', group: 'C', stage: MatchStage.GROUP, date: '13 Jun 21:00', stadium: 'Boston Stadium', homeTeam: TEAMS.HAI, awayTeam: TEAMS.SCO, finished: false },
  { id: 'c3', group: 'C', stage: MatchStage.GROUP, date: '19 Jun 18:00', stadium: 'Boston Stadium', homeTeam: TEAMS.SCO, awayTeam: TEAMS.MAR, finished: false },
  { id: 'c4', group: 'C', stage: MatchStage.GROUP, date: '19 Jun 21:00', stadium: 'Philadelphia Stadium', homeTeam: TEAMS.BRA, awayTeam: TEAMS.HAI, finished: false },
  { id: 'c5', group: 'C', stage: MatchStage.GROUP, date: '24 Jun 18:00', stadium: 'Miami Stadium', homeTeam: TEAMS.BRA, awayTeam: TEAMS.SCO, finished: false },
  { id: 'c6', group: 'C', stage: MatchStage.GROUP, date: '24 Jun 18:00', stadium: 'Atlanta Stadium', homeTeam: TEAMS.MAR, awayTeam: TEAMS.HAI, finished: false },

  // --- GRUPO D ---
  { id: 'd1', group: 'D', stage: MatchStage.GROUP, date: '12 Jun 21:00', stadium: 'Los Angeles Stadium', homeTeam: TEAMS.USA, awayTeam: TEAMS.PAR, finished: false },
  { id: 'd2', group: 'D', stage: MatchStage.GROUP, date: '13 Jun 00:00', stadium: 'BC Place Vancouver', homeTeam: TEAMS.AUS, awayTeam: TEAMS.EUR_C, finished: false },
  { id: 'd3', group: 'D', stage: MatchStage.GROUP, date: '19 Jun 15:00', stadium: 'Seattle Stadium', homeTeam: TEAMS.USA, awayTeam: TEAMS.AUS, finished: false },
  { id: 'd4', group: 'D', stage: MatchStage.GROUP, date: '19 Jun 00:00', stadium: 'SF Bay Area Stadium', homeTeam: TEAMS.EUR_C, awayTeam: TEAMS.PAR, finished: false },
  { id: 'd5', group: 'D', stage: MatchStage.GROUP, date: '25 Jun 22:00', stadium: 'Los Angeles Stadium', homeTeam: TEAMS.EUR_C, awayTeam: TEAMS.USA, finished: false },
  { id: 'd6', group: 'D', stage: MatchStage.GROUP, date: '25 Jun 22:00', stadium: 'SF Bay Area Stadium', homeTeam: TEAMS.PAR, awayTeam: TEAMS.AUS, finished: false },

  // --- GRUPO E ---
  { id: 'e1', group: 'E', stage: MatchStage.GROUP, date: '14 Jun 13:00', stadium: 'Houston Stadium', homeTeam: TEAMS.GER, awayTeam: TEAMS.CUW, finished: false },
  { id: 'e2', group: 'E', stage: MatchStage.GROUP, date: '14 Jun 19:00', stadium: 'Philadelphia Stadium', homeTeam: TEAMS.CIV, awayTeam: TEAMS.ECU, finished: false },
  { id: 'e3', group: 'E', stage: MatchStage.GROUP, date: '20 Jun 16:00', stadium: 'Toronto Stadium', homeTeam: TEAMS.GER, awayTeam: TEAMS.CIV, finished: false },
  { id: 'e4', group: 'E', stage: MatchStage.GROUP, date: '20 Jun 22:00', stadium: 'Kansas City Stadium', homeTeam: TEAMS.ECU, awayTeam: TEAMS.CUW, finished: false },
  { id: 'e5', group: 'E', stage: MatchStage.GROUP, date: '25 Jun 16:00', stadium: 'Philadelphia Stadium', homeTeam: TEAMS.CUW, awayTeam: TEAMS.CIV, finished: false },
  { id: 'e6', group: 'E', stage: MatchStage.GROUP, date: '25 Jun 16:00', stadium: 'NY NJ Stadium', homeTeam: TEAMS.ECU, awayTeam: TEAMS.GER, finished: false },

  // --- GRUPO F ---
  { id: 'f1', group: 'F', stage: MatchStage.GROUP, date: '14 Jun 16:00', stadium: 'Dallas Stadium', homeTeam: TEAMS.NED, awayTeam: TEAMS.JPN, finished: false },
  { id: 'f2', group: 'F', stage: MatchStage.GROUP, date: '14 Jun 22:00', stadium: 'Estadio Monterrey', homeTeam: TEAMS.EUR_D, awayTeam: TEAMS.TUN, finished: false },
  { id: 'f3', group: 'F', stage: MatchStage.GROUP, date: '20 Jun 13:00', stadium: 'Houston Stadium', homeTeam: TEAMS.NED, awayTeam: TEAMS.EUR_D, finished: false },
  { id: 'f4', group: 'F', stage: MatchStage.GROUP, date: '20 Jun 00:00', stadium: 'Estadio Monterrey', homeTeam: TEAMS.TUN, awayTeam: TEAMS.JPN, finished: false },
  { id: 'f5', group: 'F', stage: MatchStage.GROUP, date: '25 Jun 19:00', stadium: 'Dallas Stadium', homeTeam: TEAMS.JPN, awayTeam: TEAMS.EUR_D, finished: false },
  { id: 'f6', group: 'F', stage: MatchStage.GROUP, date: '25 Jun 19:00', stadium: 'Kansas City Stadium', homeTeam: TEAMS.TUN, awayTeam: TEAMS.NED, finished: false },

  // --- GRUPO G ---
  { id: 'g1', group: 'G', stage: MatchStage.GROUP, date: '15 Jun 15:00', stadium: 'Seattle Stadium', homeTeam: TEAMS.BEL, awayTeam: TEAMS.EGY, finished: false },
  { id: 'g2', group: 'G', stage: MatchStage.GROUP, date: '15 Jun 21:00', stadium: 'Los Angeles Stadium', homeTeam: TEAMS.IRN, awayTeam: TEAMS.NZL, finished: false },
  { id: 'g3', group: 'G', stage: MatchStage.GROUP, date: '21 Jun 15:00', stadium: 'Los Angeles Stadium', homeTeam: TEAMS.BEL, awayTeam: TEAMS.IRN, finished: false },
  { id: 'g4', group: 'G', stage: MatchStage.GROUP, date: '21 Jun 21:00', stadium: 'BC Place Vancouver', homeTeam: TEAMS.NZL, awayTeam: TEAMS.EGY, finished: false },
  { id: 'g5', group: 'G', stage: MatchStage.GROUP, date: '26 Jun 23:00', stadium: 'Seattle Stadium', homeTeam: TEAMS.EGY, awayTeam: TEAMS.IRN, finished: false },
  { id: 'g6', group: 'G', stage: MatchStage.GROUP, date: '26 Jun 23:00', stadium: 'BC Place Vancouver', homeTeam: TEAMS.NZL, awayTeam: TEAMS.BEL, finished: false },

  // --- GRUPO H ---
  { id: 'h1', group: 'H', stage: MatchStage.GROUP, date: '15 Jun 12:00', stadium: 'Atlanta Stadium', homeTeam: TEAMS.ESP, awayTeam: TEAMS.CPV, finished: false },
  { id: 'h2', group: 'H', stage: MatchStage.GROUP, date: '15 Jun 18:00', stadium: 'Miami Stadium', homeTeam: TEAMS.KSA, awayTeam: TEAMS.URU, finished: false },
  { id: 'h3', group: 'H', stage: MatchStage.GROUP, date: '21 Jun 12:00', stadium: 'Atlanta Stadium', homeTeam: TEAMS.ESP, awayTeam: TEAMS.KSA, finished: false },
  { id: 'h4', group: 'H', stage: MatchStage.GROUP, date: '21 Jun 18:00', stadium: 'Miami Stadium', homeTeam: TEAMS.URU, awayTeam: TEAMS.CPV, finished: false },
  { id: 'h5', group: 'H', stage: MatchStage.GROUP, date: '26 Jun 20:00', stadium: 'Houston Stadium', homeTeam: TEAMS.CPV, awayTeam: TEAMS.KSA, finished: false },
  { id: 'h6', group: 'H', stage: MatchStage.GROUP, date: '26 Jun 20:00', stadium: 'Estadio Guadalajara', homeTeam: TEAMS.URU, awayTeam: TEAMS.ESP, finished: false },

  // --- GRUPO I ---
  { id: 'i1', group: 'I', stage: MatchStage.GROUP, date: '16 Jun 15:00', stadium: 'NY NJ Stadium', homeTeam: TEAMS.FRA, awayTeam: TEAMS.SEN, finished: false },
  { id: 'i2', group: 'I', stage: MatchStage.GROUP, date: '16 Jun 18:00', stadium: 'Boston Stadium', homeTeam: TEAMS.IPO_A, awayTeam: TEAMS.NOR, finished: false },
  { id: 'i3', group: 'I', stage: MatchStage.GROUP, date: '22 Jun 17:00', stadium: 'Philadelphia Stadium', homeTeam: TEAMS.FRA, awayTeam: TEAMS.IPO_A, finished: false },
  { id: 'i4', group: 'I', stage: MatchStage.GROUP, date: '22 Jun 20:00', stadium: 'NY NJ Stadium', homeTeam: TEAMS.NOR, awayTeam: TEAMS.SEN, finished: false },
  { id: 'i5', group: 'I', stage: MatchStage.GROUP, date: '26 Jun 15:00', stadium: 'Boston Stadium', homeTeam: TEAMS.NOR, awayTeam: TEAMS.FRA, finished: false },
  { id: 'i6', group: 'I', stage: MatchStage.GROUP, date: '26 Jun 15:00', stadium: 'Toronto Stadium', homeTeam: TEAMS.SEN, awayTeam: TEAMS.IPO_A, finished: false },

  // --- GRUPO J ---
  { id: 'j1', group: 'J', stage: MatchStage.GROUP, date: '16 Jun 21:00', stadium: 'Kansas City Stadium', homeTeam: TEAMS.ARG, awayTeam: TEAMS.ALG, finished: false },
  { id: 'j2', group: 'J', stage: MatchStage.GROUP, date: '16 Jun 00:00', stadium: 'SF Bay Area Stadium', homeTeam: TEAMS.AUT, awayTeam: TEAMS.JOR, finished: false },
  { id: 'j3', group: 'J', stage: MatchStage.GROUP, date: '22 Jun 13:00', stadium: 'Dallas Stadium', homeTeam: TEAMS.ARG, awayTeam: TEAMS.AUT, finished: false },
  { id: 'j4', group: 'J', stage: MatchStage.GROUP, date: '22 Jun 23:00', stadium: 'SF Bay Area Stadium', homeTeam: TEAMS.JOR, awayTeam: TEAMS.ALG, finished: false },
  { id: 'j5', group: 'J', stage: MatchStage.GROUP, date: '27 Jun 22:00', stadium: 'Kansas City Stadium', homeTeam: TEAMS.ALG, awayTeam: TEAMS.AUT, finished: false },
  { id: 'j6', group: 'J', stage: MatchStage.GROUP, date: '27 Jun 22:00', stadium: 'Dallas Stadium', homeTeam: TEAMS.JOR, awayTeam: TEAMS.ARG, finished: false },

  // --- GRUPO K ---
  { id: 'k1', group: 'K', stage: MatchStage.GROUP, date: '17 Jun 13:00', stadium: 'Houston Stadium', homeTeam: TEAMS.POR, awayTeam: TEAMS.IPO_B, finished: false },
  { id: 'k2', group: 'K', stage: MatchStage.GROUP, date: '17 Jun 22:00', stadium: 'Estadio Ciudad de México', homeTeam: TEAMS.UZB, awayTeam: TEAMS.COL, finished: false },
  { id: 'k3', group: 'K', stage: MatchStage.GROUP, date: '23 Jun 13:00', stadium: 'Houston Stadium', homeTeam: TEAMS.POR, awayTeam: TEAMS.UZB, finished: false },
  { id: 'k4', group: 'K', stage: MatchStage.GROUP, date: '23 Jun 22:00', stadium: 'Estadio Guadalajara', homeTeam: TEAMS.COL, awayTeam: TEAMS.IPO_B, finished: false },
  { id: 'k5', group: 'K', stage: MatchStage.GROUP, date: '27 Jun 19:30', stadium: 'Miami Stadium', homeTeam: TEAMS.COL, awayTeam: TEAMS.POR, finished: false },
  { id: 'k6', group: 'K', stage: MatchStage.GROUP, date: '27 Jun 19:30', stadium: 'Atlanta Stadium', homeTeam: TEAMS.IPO_B, awayTeam: TEAMS.UZB, finished: false },

  // --- GRUPO L ---
  { id: 'l1', group: 'L', stage: MatchStage.GROUP, date: '17 Jun 16:00', stadium: 'Dallas Stadium', homeTeam: TEAMS.ENG, awayTeam: TEAMS.CRO, finished: false },
  { id: 'l2', group: 'L', stage: MatchStage.GROUP, date: '17 Jun 19:00', stadium: 'Toronto Stadium', homeTeam: TEAMS.GHA, awayTeam: TEAMS.PAN, finished: false },
  { id: 'l3', group: 'L', stage: MatchStage.GROUP, date: '23 Jun 16:00', stadium: 'Boston Stadium', homeTeam: TEAMS.ENG, awayTeam: TEAMS.GHA, finished: false },
  { id: 'l4', group: 'L', stage: MatchStage.GROUP, date: '23 Jun 19:00', stadium: 'Toronto Stadium', homeTeam: TEAMS.PAN, awayTeam: TEAMS.CRO, finished: false },
  { id: 'l5', group: 'L', stage: MatchStage.GROUP, date: '27 Jun 17:00', stadium: 'NY NJ Stadium', homeTeam: TEAMS.PAN, awayTeam: TEAMS.ENG, finished: false },
  { id: 'l6', group: 'L', stage: MatchStage.GROUP, date: '27 Jun 17:00', stadium: 'Philadelphia Stadium', homeTeam: TEAMS.CRO, awayTeam: TEAMS.GHA, finished: false },
];
