
export type Team = {
  id: string;
  name: string;
  flag: string; // Emoji or image URL
  code: string; // ISO 3-letter code
  flagCode: string; // ISO 2-letter code for FlagCDN
};

export enum MatchStage {
  GROUP = 'Fase de Grupos',
  R32 = '16vos',
  R16 = 'Octavos',
  QF = 'Cuartos',
  SF = 'Semis',
  FINAL = 'Final'
}

export type Match = {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  stage: MatchStage;
  group?: string; // e.g., "A"
  stadium?: string;
  finished: boolean;
  officialHomeScore?: number;
  officialAwayScore?: number;
  // For bracket logic
  nextMatchId?: string; // ID of the match the winner goes to
};

export type Prediction = {
  matchId: string;
  homeScore: number | '';
  awayScore: number | '';
};

export type BracketSelection = Record<string, string>; // matchId -> winnerTeamId

export type UserProde = {
  userId: string; // The generated PRODE-CODE
  userName?: string;
  countryCode: string; // e.g., "ARG"
  club?: string;
  predictions: Record<string, Prediction>; // matchId -> Prediction
  playoffResolutions: Record<string, Team>; // placeholderId -> Selected Team
  bracket: BracketSelection; // Knockout predictions
  createdAt: number;
};

export type ScoreResult = {
  matchId: string;
  points: number;
  status: 'EXACTO' | 'GANADOR' | 'FALLO' | 'PENDIENTE';
};

export type PlayoffGroup = {
  id: string; // Matches the placeholder team ID (e.g., 'eur_a')
  name: string;
  candidates: Team[];
};

export type GroupStats = {
  teamId: string;
  points: number;
  gd: number; // Goal Difference
  gf: number; // Goals For
  group: string;
};
