export type Team = {
  id: string;
  name: string;
  flag: string; // Emoji or image URL
  code: string; // ISO 3-letter code
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
};

export type Prediction = {
  matchId: string;
  homeScore: number | '';
  awayScore: number | '';
};

export type UserProde = {
  userId: string; // The generated PRODE-CODE
  userName?: string;
  countryCode: string; // e.g., "ARG"
  predictions: Record<string, Prediction>; // matchId -> Prediction
  createdAt: number;
};

export type ScoreResult = {
  matchId: string;
  points: number;
  status: 'EXACTO' | 'GANADOR' | 'FALLO' | 'PENDIENTE';
};