// lib/sources/leagues.ts
// Major leagues we always want to show, with their Bzzoiro IDs.
// Verified against https://sports.bzzoiro.com/api/v2/leagues/.

export interface LeagueInfo {
  id: number;
  name: string;
  country: string;
  tier: 1 | 2; // 1 = top division / European cup, 2 = second tier / domestic cup
}

export const MAJOR_LEAGUES: LeagueInfo[] = [
  // --- Tier 1 leagues ---
  { id: 1,  name: 'Premier League',       country: 'England',     tier: 1 },
  { id: 3,  name: 'La Liga',              country: 'Spain',       tier: 1 },
  { id: 4,  name: 'Serie A',              country: 'Italy',       tier: 1 },
  { id: 5,  name: 'Bundesliga',           country: 'Germany',     tier: 1 },
  { id: 6,  name: 'Ligue 1',              country: 'France',      tier: 1 },
  { id: 10, name: 'Eredivisie',           country: 'Netherlands', tier: 1 },
  { id: 96, name: 'Austrian Bundesliga',  country: 'Austria',     tier: 1 },
  { id: 9,  name: 'Brasileirão Série A',  country: 'Brazil',      tier: 1 },

  // --- European cups ---
  { id: 7,  name: 'Champions League',     country: 'Europe',      tier: 1 },
  { id: 8,  name: 'Europa League',        country: 'Europe',      tier: 1 },
  { id: 83, name: 'Conference League',    country: 'Europe',      tier: 1 },

  // --- Second tiers ---
  { id: 12, name: 'Championship',         country: 'England',     tier: 2 },
  { id: 94, name: '2. Bundesliga',        country: 'Germany',     tier: 2 },
  { id: 89, name: 'Ligue 2',              country: 'France',      tier: 2 },
  { id: 34, name: 'Brasileirão Série B',  country: 'Brazil',      tier: 2 },

  // --- Domestic cups ---
  { id: 39, name: 'FA Cup',               country: 'England',     tier: 2 },
  { id: 41, name: 'Copa del Rey',         country: 'Spain',       tier: 2 },
  { id: 42, name: 'Coppa Italia',         country: 'Italy',       tier: 2 },
  { id: 43, name: 'DFB Pokal',            country: 'Germany',     tier: 2 },
  { id: 44, name: 'Coupe de France',      country: 'France',      tier: 2 },
];

export const MAJOR_LEAGUE_IDS: number[] = MAJOR_LEAGUES.map((l) => l.id);

export function isMajorLeagueId(id: number): boolean {
  return MAJOR_LEAGUE_IDS.includes(id);
}
