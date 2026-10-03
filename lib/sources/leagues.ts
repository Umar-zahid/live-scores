// lib/sources/leagues.ts
// Leagues and competitions we always fetch from Bzzoiro.
// Verified against https://sports.bzzoiro.com/api/v2/leagues/.

export interface LeagueInfo {
  id: number;            // Bzzoiro league ID
  afId?: number;         // API-Football league ID (for standings / top scorers)
  name: string;
  country: string;
  tier: 1 | 2;           // 1 = top division / international / European cup, 2 = second tier / domestic cup
}

export const MAJOR_LEAGUES: LeagueInfo[] = [
  // ─── Big-5 European leagues ───
  { id: 1,  afId: 39,  name: 'Premier League',        country: 'England',     tier: 1 },
  { id: 3,  afId: 140, name: 'La Liga',               country: 'Spain',       tier: 1 },
  { id: 4,  afId: 135, name: 'Serie A',               country: 'Italy',       tier: 1 },
  { id: 5,  afId: 78,  name: 'Bundesliga',            country: 'Germany',     tier: 1 },
  { id: 6,  afId: 61,  name: 'Ligue 1',               country: 'France',      tier: 1 },

  // ─── Other top European divisions ───
  { id: 2,  afId: 94,  name: 'Primeira Liga',         country: 'Portugal',    tier: 1 },
  { id: 10, name: 'Eredivisie',            country: 'Netherlands', tier: 1 },
  { id: 11, name: 'Süper Lig',             country: 'Turkey',      tier: 1 },
  { id: 13, name: 'Scottish Premiership',  country: 'Scotland',    tier: 1 },
  { id: 14, name: 'Pro League',            country: 'Belgium',     tier: 1 },
  { id: 15, name: 'Super League',          country: 'Switzerland', tier: 1 },
  { id: 23, name: 'Superliga',             country: 'Romania',     tier: 1 },
  { id: 24, name: 'Super League',          country: 'Greece',      tier: 1 },
  { id: 25, name: 'Ekstraklasa',           country: 'Poland',      tier: 1 },
  { id: 26, name: 'Allsvenskan',           country: 'Sweden',      tier: 1 },
  { id: 54, name: 'Eliteserien',           country: 'Norway',      tier: 1 },
  { id: 84, name: 'Danish Superliga',      country: 'Denmark',     tier: 1 },
  { id: 96, name: 'Austrian Bundesliga',   country: 'Austria',     tier: 1 },
  { id: 99, name: 'Czech First League',    country: 'Czechia',     tier: 1 },

  // ─── Big-5 second tiers + England ───
  { id: 12, afId: 40,  name: 'Championship',          country: 'England',     tier: 2 },
  { id: 86, name: 'League One',            country: 'England',     tier: 2 },
  { id: 87, name: 'League Two',            country: 'England',     tier: 2 },
  { id: 89, name: 'Ligue 2',               country: 'France',      tier: 2 },
  { id: 94, name: '2. Bundesliga',         country: 'Germany',     tier: 2 },
  { id: 136, name: 'Serie B',              country: 'Italy',       tier: 2 },

  // ─── Other continents ───
  { id: 9, name: 'Brasileirão Serie A',   country: 'Brazil',      tier: 1 },
  { id: 34, name: 'Brasileirão Serie B',   country: 'Brazil',      tier: 2 },
  { id: 17, name: 'Saudi Pro League',      country: 'Saudi Arabia',tier: 1 },
  { id: 18, name: 'MLS',                   country: 'USA',         tier: 1 },
  { id: 19, name: 'Liga MX',               country: 'Mexico',      tier: 1 },
  { id: 20, name: 'Liga MX',               country: 'Mexico',      tier: 1 },
  { id: 49, name: 'J1 League',             country: 'Japan',       tier: 1 },
  { id: 50, name: 'K League 1',            country: 'South Korea', tier: 1 },
  { id: 85, name: 'Liga Profesional',      country: 'Argentina',   tier: 1 },

  // ─── European club cups ───
  { id: 7,  afId: 2,   name: 'Champions League',      country: 'Europe',      tier: 1 },
  { id: 8,  afId: 3,   name: 'Europa League',         country: 'Europe',      tier: 1 },
  { id: 83, afId: 848, name: 'Conference League',     country: 'Europe',      tier: 1 },
  { id: 90, name: 'UEFA Super Cup',        country: 'Europe',      tier: 1 },

  // ─── South American club cups ───
  { id: 32, name: 'Copa Libertadores',     country: 'South America', tier: 1 },
  { id: 33, name: 'Copa Sudamericana',     country: 'South America', tier: 1 },

  // ─── Domestic cups ───
  { id: 39, name: 'FA Cup',                country: 'England',     tier: 2 },
  { id: 40, name: 'Carabao Cup',           country: 'England',     tier: 2 },
  { id: 41, name: 'Copa del Rey',          country: 'Spain',       tier: 2 },
  { id: 42, name: 'Coppa Italia',          country: 'Italy',       tier: 2 },
  { id: 43, name: 'DFB Pokal',             country: 'Germany',     tier: 2 },
  { id: 44, name: 'Coupe de France',       country: 'France',      tier: 2 },
  { id: 46, name: 'Puchar Polski',         country: 'Poland',      tier: 2 },

  // ─── INTERNATIONAL — senior national teams ───
  { id: 27, name: 'World Cup 2026',                 country: 'International',  tier: 1 },
  { id: 66, name: 'UEFA Euro 2024',                 country: 'Europe',         tier: 1 },
  { id: 67, name: 'Copa América',                   country: 'South America',  tier: 1 },
  { id: 68, name: 'AFC Asian Cup 2023',                  country: 'Asia',           tier: 1 },
  { id: 30, name: 'Africa Cup of Nations 2023',          country: 'Africa',         tier: 1 },
  { id: 64, name: 'UEFA Nations League',            country: 'Europe',         tier: 1 },
  { id: 65, name: 'CONCACAF Nations League',        country: 'North America',  tier: 1 },
  { id: 69, name: 'CONCACAF Gold Cup',              country: 'North America',  tier: 1 },
  { id: 58, name: 'WC Qualifiers · UEFA',           country: 'Europe',         tier: 1 },
  { id: 59, name: 'WC Qualifiers · CONMEBOL',       country: 'South America',  tier: 1 },
  { id: 60, name: 'WC Qualifiers · CAF',            country: 'Africa',         tier: 1 },
  { id: 61, name: 'WC Qualifiers · AFC',            country: 'Asia',           tier: 1 },
  { id: 62, name: 'WC Qualifiers · CONCACAF',       country: 'North America',  tier: 1 },
  { id: 63, name: 'WC Qualifiers · OFC',            country: 'Oceania',        tier: 1 },
  { id: 31, name: 'International Friendlies',       country: 'International',  tier: 1 },
];

export const MAJOR_LEAGUE_IDS: number[] = MAJOR_LEAGUES.map((l) => l.id);

export function isMajorLeagueId(id: number): boolean {
  return MAJOR_LEAGUE_IDS.includes(id);
}

export function findLeagueIdByName(name: string): number | null {
  const hit = MAJOR_LEAGUES.find((l) => l.name === name);
  return hit?.id ?? null;
}

export function findLeagueByAfId(afId: number): LeagueInfo | null {
  return MAJOR_LEAGUES.find((l) => l.afId === afId) ?? null;
}

export function findLeagueById(id: number): LeagueInfo | null {
  return MAJOR_LEAGUES.find((l) => l.id === id) ?? null;
}
