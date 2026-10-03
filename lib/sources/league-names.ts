// lib/sources/league-names.ts
// Bzzoiro's /events/ endpoint does NOT return league_name — only league_id.
// (/leagues/ returns names but caps at 50 of 89 entries.)
// This module builds an ID → name map from MAJOR_LEAGUES and exposes a
// resolver used by normalizeBzzoiroEvent.

import { MAJOR_LEAGUES } from './leagues';

export const LEAGUE_NAMES: ReadonlyMap<number, string> = new Map(
  MAJOR_LEAGUES.map((l) => [l.id, l.name])
);

export function resolveLeagueName(
  leagueId: number | null | undefined,
  fallback?: string | null
): string {
  if (fallback && fallback.trim() && fallback !== 'Unknown league') {
    return fallback;
  }
  if (leagueId == null) return 'Unknown league';
  const hit = LEAGUE_NAMES.get(leagueId);
  if (hit) return hit;
  return `League ${leagueId}`;
}
