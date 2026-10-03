// lib/player-ratings.ts
// Incident-derived player ratings for matches where we don't have full
// per-player stat sheets (i.e. all Bzzoiro-sourced matches).
//
// This is a v1 formula: base 6.0 + per-event contributions + team-result
// modifier. Works with whatever we have — goals, assists, cards — and
// degrades gracefully (a player with no incidents stays at base).

import type { TeamLineup } from '@/types';

export interface RatingInput {
  lineups: TeamLineup[];
  events: {
    minute: number;
    type: string;
    player: string;
    assist?: string | null;
    detail?: string | null;
    team: 'home' | 'away';
  }[];
  homeScore: number;
  awayScore: number;
}

export interface BasicRating {
  playerId: number;
  playerName: string;
  team: 'home' | 'away';
  position: string;
  jerseyNumber: number | null;
  rating: number;
  lines: { label: string; delta: number }[];
}

const BASE = 6.0;

// Match a scored/assisted/carded name to a lineup player by fuzzy name match.
// Handles "M. Cunha" vs "Matheus Cunha" style differences.
function findPlayerId(
  lineups: TeamLineup[],
  team: 'home' | 'away',
  name: string
): number | null {
  if (!name) return null;
  const idx = team === 'home' ? 0 : 1;
  const lu = lineups[idx];
  if (!lu) return null;

  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 ]/g, '')
      .trim();

  const target = clean(name);
  const targetTokens = target.split(/\s+/).filter(Boolean);
  const targetLast = targetTokens[targetTokens.length - 1] ?? '';

  const pool = [...lu.startXI, ...lu.substitutes];

  // Exact full-name match
  for (const p of pool) {
    if (clean(p.name) === target) return p.id;
  }

  // Last-token match (e.g. "Cunha" matches "Matheus Cunha")
  for (const p of pool) {
    const tokens = clean(p.name).split(/\s+/).filter(Boolean);
    const last = tokens[tokens.length - 1] ?? '';
    if (last && last === targetLast) return p.id;
  }

  // Fallback: any player whose full name contains target as substring
  // Only run for names of at least 3 chars to avoid false positives on initials.
  if (target.length >= 3) {
    for (const p of pool) {
      if (clean(p.name).includes(target)) return p.id;
    }
  }

  return null;
}

export function computeIncidentRatings(input: RatingInput): BasicRating[] {
  const { lineups, events, homeScore, awayScore } = input;
  if (lineups.length < 2) return [];

  // Collect per-player contributions
  const buckets = new Map<number, { lines: { label: string; delta: number }[] }>();

  const ensure = (playerId: number) => {
    if (!buckets.has(playerId)) buckets.set(playerId, { lines: [] });
    return buckets.get(playerId)!;
  };

  for (const ev of events) {
    const t = ev.team;
    if (ev.type === 'goal') {
      // Own goals are reported as type 'goal' with detail 'Own Goal'.
      // They should NOT credit the scorer (and, arguably, should be
      // attributed to the opposing team — that's a separate fix).
      const d = (ev.detail ?? '').toLowerCase();
      if (d.includes('own goal') || d === 'own_goal') continue;
      const pid = findPlayerId(lineups, t, ev.player);
      if (pid != null) ensure(pid).lines.push({ label: 'Goal', delta: 1.0 });
      if (ev.assist) {
        const aid = findPlayerId(lineups, t, ev.assist);
        if (aid != null) ensure(aid).lines.push({ label: 'Assist', delta: 0.7 });
      }
    } else if (ev.type === 'yellow_card') {
      const pid = findPlayerId(lineups, t, ev.player);
      if (pid != null) ensure(pid).lines.push({ label: 'Yellow card', delta: -0.3 });
    } else if (ev.type === 'red_card') {
      const pid = findPlayerId(lineups, t, ev.player);
      if (pid != null) ensure(pid).lines.push({ label: 'Red card', delta: -1.5 });
    }
    // Substitutions don't affect our simple rating
  }

  // Team-result modifier: winning team +0.3, losing team -0.2, draw 0
  const homeDelta = homeScore > awayScore ? 0.3 : homeScore < awayScore ? -0.2 : 0;
  const awayDelta = awayScore > homeScore ? 0.3 : awayScore < homeScore ? -0.2 : 0;

  // Who actually set foot on the pitch: starters plus anyone who came on
  // as a substitute. Substitution events carry the player coming ON in
  // `assist` (the player going off is in `player` — see bzzoiroIncidentsToEvents).
  const appeared = new Set<number>();
  for (const lu of lineups) {
    for (const p of lu.startXI) appeared.add(p.id);
  }
  for (const ev of events) {
    if (ev.type === 'substitution' && ev.assist) {
      const subOnId = findPlayerId(lineups, ev.team, ev.assist);
      if (subOnId != null) appeared.add(subOnId);
    }
  }

  const out: BasicRating[] = [];
  for (let teamIdx = 0; teamIdx < 2; teamIdx++) {
    const lu = lineups[teamIdx];
    const team: 'home' | 'away' = teamIdx === 0 ? 'home' : 'away';
    const teamDelta = team === 'home' ? homeDelta : awayDelta;

    const all = [...lu.startXI, ...lu.substitutes];
    for (const p of all) {
      const bucket = buckets.get(p.id);
      const lines: { label: string; delta: number }[] = bucket ? [...bucket.lines] : [];
      if (teamDelta !== 0 && appeared.has(p.id)) {
        lines.push({
          label: teamDelta > 0 ? 'Team won' : 'Team lost',
          delta: teamDelta,
        });
      }
      const delta = lines.reduce((s, l) => s + l.delta, 0);
      const rating = Math.max(1, Math.min(10, BASE + delta));
      out.push({
        playerId: p.id,
        playerName: p.name,
        team,
        position: p.position,
        jerseyNumber: p.number,
        rating,
        lines,
      });
    }
  }

  return out;
}
