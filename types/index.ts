export type Sport = 'football' | 'cricket' | 'f1';

export type MatchStatus = 'live' | 'upcoming' | 'finished' | 'halftime';

export interface FootballMatch {
  id: string;
  sport: 'football';
  status: MatchStatus;
  league: string;
  startTime: string;
  homeTeam: { name: string; score: number };
  awayTeam: { name: string; score: number };
  minute?: number;
  events: { minute: number; type: string; player: string; team: 'home' | 'away' }[];
}

export interface CricketMatch {
  id: string;
  sport: 'cricket';
  status: MatchStatus;
  league: string;
  startTime: string;
  team1: { name: string; score: number; wickets: number; overs: string };
  team2: { name: string; score: number; wickets: number; overs: string };
  currentInnings: number;
  runRate: number;
  statusText: string;
}

export interface F1Driver {
  position: number;
  name: string;
  team: string;
  gap: string;
  pitStops: number;
  tireCompound: string;
}

export interface F1Race {
  id: string;
  sport: 'f1';
  status: MatchStatus;
  raceName: string;
  lap: number;
  totalLaps: number;
  drivers: F1Driver[];
}
