// lib/id-guards.ts
// Centralised ID validation. Guards against garbage IDs burning upstream
// quota or filling the Next.js data cache with junk keys.

export function isValidMatchId(id: string | null | undefined): boolean {
  if (!id) return false;
  if (/^\d+$/.test(id)) return true;      // API-Football numeric fixture ID
  if (/^bz-\d+$/.test(id)) return true;    // Bzzoiro event ID
  return false;
}

export function isValidTeamId(id: string | null | undefined): boolean {
  return /^\d+$/.test(id ?? '');
}
