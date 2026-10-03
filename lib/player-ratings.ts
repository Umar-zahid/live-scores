// lib/player-ratings.ts
// Incident-derived player ratings for matches where we don't have full
// per-player stat sheets (i.e. all Bzzoiro-sourced matches).
//
// v1 formula: base 6.0 + per-event contributions + team-result modifier.
// Works with whatever we have — goals, assists, cards — and degrades
// gracefully (a player with no incidents stays at base).
//
// Also exports getPlayerMatchEvents() used by the Lineups component to
// place event icons on the formation and to know who actually stepped
// on the pitch (starters + subs who came on).

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
  appeared: boolean;
  lines: { label: string; delta: number }[];
}

export type PlayerMatchEventType =
  | 'goal'
  | 'yellow_card'
  | 'red_card'
  | 'sub_on'
  | 'sub_off';

export interface PlayerMatchEvent {
  type: PlayerMatchEventType;
  minute: number;
}

const BASE = 6.0;

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

  for (const p of pool) {
    if (clean(p.name) === target) return p.id;
  }

  for (const p of pool) {
    const tokens = clean(p.name).split(/\s+/).filter(Boolean);
    const last = tokens[tokens.length - 1] ?? '';
    if (last && last === targetLast) return p.id;
  }

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

  const buckets = new Map<number, { lines: { label: string; delta: number }[] }>();
  const ensure = (playerId: number) => {
    if (!buckets.has(playerId)) buckets.set(playerId, { lines: [] });
    return buckets.get(playerId)!;
  };

  for (const ev of events) {
    const t = ev.team;
    if (ev.type === 'goal') {
      const d = (ev.detail ?? '').toLowerCase().replace(/[^a-z]/g, '');
      if (d.includes('owngoal') || d === 'og') continue;
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
  }

  const homeDelta = homeScore > awayScore ? 0.3 : homeScore < awayScore ? -0.2 : 0;
  const awayDelta = awayScore > homeScore ? 0.3 : awayScore < homeScore ? -0.2 : 0;

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
      const played = appeared.has(p.id);
      if (teamDelta !== 0 && played) {
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
        appeared: played,
        lines,
      });
    }
  }

  return out;
}

// Builds per-player event maps used by the Lineups pitch and bench.
// Goal events credit the scorer (own goals are skipped); substitution
// events credit BOTH the player coming off (sub_off) and the player
// coming on (sub_on). `assist` on a substitution event carries the
// incoming player — see bzzoiroIncidentsToEvents.
export function getPlayerMatchEvents(
  lineups: TeamLineup[],
  events: RatingInput['events']
): Map<number, PlayerMatchEvent[]> {
  const map = new Map<number, PlayerMatchEvent[]>();
  if (lineups.length < 2) return map;

  const add = (pid: number, ev: PlayerMatchEvent) => {
    if (!map.has(pid)) map.set(pid, []);
    map.get(pid)!.push(ev);
  };

  for (const ev of events) {
    if (ev.type === 'goal') {
      const d = (ev.detail ?? '').toLowerCase().replace(/[^a-z]/g, '');
      if (d.includes('owngoal') || d === 'og') continue;
      const pid = findPlayerId(lineups, ev.team, ev.player);
      if (pid != null) add(pid, { type: 'goal', minute: ev.minute });
    } else if (ev.type === 'yellow_card') {
      const pid = findPlayerId(lineups, ev.team, ev.player);
      if (pid != null) add(pid, { type: 'yellow_card', minute: ev.minute });
    } else if (ev.type === 'red_card') {
      const pid = findPlayerId(lineups, ev.team, ev.player);
      if (pid != null) add(pid, { type: 'red_card', minute: ev.minute });
    } else if (ev.type === 'substitution') {
      const offId = findPlayerId(lineups, ev.team, ev.player);
      if (offId != null) add(offId, { type: 'sub_off', minute: ev.minute });
      if (ev.assist) {
        const onId = findPlayerId(lineups, ev.team, ev.assist);
        if (onId != null) add(onId, { type: 'sub_on', minute: ev.minute });
      }
    }
  }

  return map;
}
