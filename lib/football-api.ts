import { FootballMatch, MatchStatus } from '@/types';
import type { TeamLineup } from '@/types';

type ApiStatus = { short: string; elapsed: number | null };
type ApiEvent = {
  time: { elapsed: number | null; extra: number | null };
  team: { id: number };
  player: { name: string | null };
  assist: { name: string | null } | null;
  type: string;
  detail: string;
};
type ApiFixture = {
  fixture: {
    id: number;
    date: string;
    referee: string | null;
    venue: { name: string | null; city: string | null };
    status: ApiStatus;
  };
  league: { name: string; country: string; logo: string; round: string };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
  events: ApiEvent[];
};
type ApiResponse = { results: number; response: ApiFixture[] };

const KEY = process.env.API_FOOTBALL_KEY;
const BASE = 'https://v3.football.api-sports.io';

function computeStatus(raw: ApiFixture): MatchStatus {
  const s = raw.fixture.status.short;
  if (['FT', 'AET', 'PEN', 'ABD', 'AWD', 'WO'].includes(s)) return 'finished';
  if (['NS', 'TBD', 'PST', 'CANC'].includes(s)) return 'upcoming';

  const elapsed = (Date.now() - new Date(raw.fixture.date).getTime()) / 60000;
  if (s === 'HT') return elapsed > 130 ? 'finished' : 'halftime';
  if (['1H', '2H', 'ET', 'BT', 'P', 'LIVE', 'SUSP', 'INT'].includes(s)) {
    if (elapsed > 130) return 'finished';
    return 'live';
  }
  return 'upcoming';
}

function computeMinute(raw: ApiFixture): number | undefined {
  const api = raw.fixture.status.elapsed;
  if (api != null) return api;
  const s = raw.fixture.status.short;
  if (s === 'HT') return 45;
  const elapsed = Math.floor(
    (Date.now() - new Date(raw.fixture.date).getTime()) / 60000
  );
  if (elapsed < 0 || elapsed > 130) return undefined;
  if (elapsed <= 45) return elapsed;
  if (elapsed <= 60) return 45;
  return Math.min(90, elapsed - 15);
}

function mapEventType(type: string, detail: string): string {
  if (type === 'Goal') return 'goal';
  if (type === 'Card' && detail === 'Yellow Card') return 'yellow_card';
  if (type === 'Card' && detail === 'Red Card') return 'red_card';
  if (type === 'subst') return 'substitution';
  return 'other';
}

function normalizeMatch(raw: ApiFixture): FootballMatch {
  const homeId = raw.teams.home.id;
  const events = (raw.events || []).map((e) => ({
    minute: e.time.elapsed ?? 0,
    type: mapEventType(e.type, e.detail),
    player: e.player.name ?? 'Unknown',
    assist: e.assist?.name ?? null,
    detail: e.detail,
    team: e.team.id === homeId ? ('home' as const) : ('away' as const),
  }));

  const venueParts = [raw.fixture.venue?.name, raw.fixture.venue?.city].filter(Boolean);

  return {
    id: String(raw.fixture.id),
    sport: 'football',
    status: computeStatus(raw),
    league: raw.league.name,
    leagueLogo: raw.league.logo,
    leagueCountry: raw.league.country,
    round: raw.league.round,
    venue: venueParts.join(', ') || undefined,
    referee: raw.fixture.referee ?? undefined,
    startTime: raw.fixture.date,
    homeTeam: {
      id: raw.teams.home.id,
      name: raw.teams.home.name,
      logo: raw.teams.home.logo,
      score: raw.goals.home ?? 0,
    },
    awayTeam: {
      id: raw.teams.away.id,
      name: raw.teams.away.name,
      logo: raw.teams.away.logo,
      score: raw.goals.away ?? 0,
    },
    minute: computeMinute(raw),
    events,
  };
}

export async function getFootballMatches(): Promise<FootballMatch[]> {
  if (!KEY) return [];
  try {
    const res = await fetch(`${BASE}/fixtures?live=all`, {
      headers: { 'x-apisports-key': KEY },
      next: { revalidate: 15 },
    });
    if (!res.ok) return [];
    const data: ApiResponse = await res.json();
    if (!Array.isArray(data.response)) return [];
    return data.response.map(normalizeMatch);
  } catch (err) {
    console.error('getFootballMatches failed:', err);
    return [];
  }
}

export async function getFootballMatchById(
  id: string
): Promise<FootballMatch | null> {
  if (!KEY) return null;
  try {
    const res = await fetch(`${BASE}/fixtures?id=${id}`, {
      headers: { 'x-apisports-key': KEY },
      next: { revalidate: 15 },
    });
    if (!res.ok) return null;
    const data: ApiResponse = await res.json();
    if (!data.response?.length) return null;
    return normalizeMatch(data.response[0]);
  } catch (err) {
    console.error('getFootballMatchById failed:', err);
    return null;
  }
}

export async function getFixtureLineups(
  fixtureId: string
): Promise<TeamLineup[]> {
  if (!KEY) return [];
  try {
    const res = await fetch(`${BASE}/fixtures/lineups?fixture=${fixtureId}`, {
      headers: { 'x-apisports-key': KEY },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data.response)) return [];

    return data.response.map((block: any) => ({
      teamId: block.team?.id ?? 0,
      teamName: block.team?.name ?? '',
      teamLogo: block.team?.logo ?? '',
      formation: block.formation ?? '',
      startXI: (block.startXI ?? []).map((p: any) => ({
        id: p.player?.id ?? 0,
        name: p.player?.name ?? 'Unknown',
        number: p.player?.number ?? null,
        position: p.player?.pos ?? '',
        grid: p.player?.grid ?? null,
      })),
      substitutes: (block.substitutes ?? []).map((p: any) => ({
        id: p.player?.id ?? 0,
        name: p.player?.name ?? 'Unknown',
        number: p.player?.number ?? null,
        position: p.player?.pos ?? '',
        grid: p.player?.grid ?? null,
      })),
      coach: block.coach
        ? {
            id: block.coach.id ?? 0,
            name: block.coach.name ?? 'Unknown',
            photo: block.coach.photo ?? '',
          }
        : null,
    }));
  } catch (err) {
    console.error('getFixtureLineups failed:', err);
    return [];
  }
}

// ── Fixture statistics ────────────────────────────────────────────
export type FixtureStats = {
  teamId: number;
  teamName: string;
  teamLogo: string;
  stats: { type: string; value: string | number | null }[];
};

export async function getFixtureStatistics(
  fixtureId: string
): Promise<FixtureStats[]> {
  if (!KEY) return [];
  try {
    const res = await fetch(`${BASE}/fixtures/statistics?fixture=${fixtureId}`, {
      headers: { 'x-apisports-key': KEY },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data.response)) return [];

    return data.response.map((block: any) => ({
      teamId: block.team?.id ?? 0,
      teamName: block.team?.name ?? '',
      teamLogo: block.team?.logo ?? '',
      stats: (block.statistics ?? []).map((s: any) => ({
        type: s.type ?? '',
        value: s.value ?? null,
      })),
    }));
  } catch (err) {
    console.error('getFixtureStatistics failed:', err);
    return [];
  }
}

// ── Player profile (from LiveScore MCP) ───────────────────────────
import { unstable_cache } from 'next/cache';
import { lsmGetPlayer } from './livescore';

const _playerCached = unstable_cache(
  async (id: string) => await lsmGetPlayer(id),
  ['lsm-player'],
  { revalidate: 3600 }
);

export async function getPlayerProfile(id: string): Promise<any | null> {
  try {
    return await _playerCached(id);
  } catch (err) {
    console.error('getPlayerProfile failed:', err);
    return null;
  }
}
