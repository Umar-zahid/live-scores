export type Sport = 'football' | 'cricket' | 'f1';

export type MatchStatus = 'live' | 'upcoming' | 'finished' | 'halftime';

export interface FootballTeam {
  id: number;
  name: string;
  logo: string;
  score: number;
}

export interface FootballMatch {
  id: string;
  sport: 'football';
  status: MatchStatus;
  league: string;
  leagueLogo?: string;
  leagueCountry?: string;
  round?: string;
  venue?: string;
  referee?: string;
  startTime: string;
  homeTeam: FootballTeam;
  awayTeam: FootballTeam;
  minute?: number;
  events: {
    minute: number;
    type: string;
    player: string;
    assist?: string | null;
    detail?: string;
    team: 'home' | 'away';
  }[];
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
  lastOver?: string[];
  striker?: { name: string; runs: number; balls: number };
  bowler?: { name: string; wickets: number; runs: number };
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

export interface PlayerMatchStat {
  playerId: number;
  name: string;
  photo: string;
  number: number | null;
  position: string;
  rating: number | null;
  minutes: number;
  goals: number;
  assists: number;
  shots: number;
  passes: number;
  yellow: number;
  red: number;
  team: 'home' | 'away';
}

export interface PlayerSeasonStat {
  playerId: number;
  name: string;
  photo: string;
  age: number | null;
  nationality: string;
  team: string;
  appearances: number;
  goals: number;
  assists: number;
  minutes: number;
  yellow: number;
  red: number;
  rating: number | null;
}

export interface LineupPlayer {
  id: number;
  name: string;
  number: number | null;
  position: string;
  grid: string | null;
}

export interface LineupCoach {
  id: number;
  name: string;
  photo: string;
}

export interface TeamLineup {
  teamId: number;
  teamName: string;
  teamLogo: string;
  formation: string;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
  coach: LineupCoach | null;
}

export interface LineupPlayer {
  id: number;
  name: string;
  number: number | null;
  position: string;
  grid: string | null;
}
