import { FootballMatch, MatchStatus } from '@/types';
import type { TeamLineup } from '@/types';
import {
  getBzzoiroEventStats,
  getBzzoiroEventLineups,
  getBzzoiroEventsInRange,
  getBzzoiroLiveEvents,
  getBzzoiroEvent,
  type BzzoiroEvent,
} from './sources/bzzoiro';
import {
  bzzoiroStatsToFixtureStats,
  bzzoiroLineupsToTeamLineups,
} from './sources/bzzoiro-mappers';
import { MAJOR_LEAGUE_IDS } from './sources/leagues';

// ─── API-Football (fallback + ratings source) ─────────────────────

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

async function getApiFootballMatches(): Promise<FootballMatch[]> {
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
    console.error('getApiFootballMatches failed:', err);
    return [];
  }
}

// ─── Bzzoiro ──────────────────────────────────────────────────────

function bzzoiroStatus(e: BzzoiroEvent): MatchStatus {
  if (e.status === 'finished') return 'finished';
  if (e.status === 'notstarted') return 'upcoming';
  if (e.status === 'inprogress') {
    const period = (e.period ?? '').toLowerCase();
    if (period === 'ht' || period.includes('half_time') || period === 'halftime') {
      return 'halftime';
    }
    return 'live';
  }
  return 'upcoming';
}

function normalizeBzzoiroEvent(e: BzzoiroEvent): FootballMatch {
  return {
    id: `bz-${e.id}`,
    sport: 'football',
    status: bzzoiroStatus(e),
    league: e.league_name,
    leagueCountry: '',
    startTime: e.event_date,
    homeTeam: {
      id: e.home_team_id,
      name: e.home_team,
      logo: '',
      score: e.home_score ?? 0,
    },
    awayTeam: {
      id: e.away_team_id,
      name: e.away_team,
      logo: '',
      score: e.away_score ?? 0,
    },
    minute: e.current_minute ?? undefined,
    events: [],
  };
}

async function getMajorLeagueMatches(): Promise<FootballMatch[]> {
  const now = new Date();
  // Cover: recently finished (up to 1 day ago) → live → upcoming (next 3 days)
  const from = new Date(now.getTime() - 1 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const to = new Date(now.getTime() + 3 * 24 * 3600 * 1000).toISOString().slice(0, 10);

  const results = await Promise.all(
    MAJOR_LEAGUE_IDS.map((id) => getBzzoiroEventsInRange(from, to, id))
  );

  const all = results.flat();

  // Deduplicate by (homeId, awayId, kickoffHour)
  const seen = new Set<string>();
  const deduped: BzzoiroEvent[] = [];
  for (const e of all) {
    const key = `${e.home_team_id}-${e.away_team_id}-${e.event_date.slice(0, 13)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(e);
  }

  return deduped.map(normalizeBzzoiroEvent);
}

// ─── Public API ───────────────────────────────────────────────────

export async function getFootballMatches(): Promise<FootballMatch[]> {
  // 1. Try major leagues from Bzzoiro (unlimited, top-5 + cups)
  try {
    const major = await getMajorLeagueMatches();
    if (major.length > 0) {
      console.log(`getFootballMatches: Bzzoiro major leagues -> ${major.length}`);
      return major;
    }
  } catch (err) {
    console.error('getMajorLeagueMatches failed:', err);
  }

  // 2. Try Bzzoiro live feed (broader, includes friendlies + smaller leagues)
  try {
    const live = await getBzzoiroLiveEvents();
    if (live.length > 0) {
      console.log(`getFootballMatches: Bzzoiro live -> ${live.length}`);
      return live.map(normalizeBzzoiroEvent);
    }
  } catch (err) {
    console.error('getBzzoiroLiveEvents failed:', err);
  }

  // 3. Fall back to API-Football (lower-league live feed)
  console.log('getFootballMatches: falling back to API-Football');
  return getApiFootballMatches();
}

export async function getFootballMatchById(
  id: string
): Promise<FootballMatch | null> {
  // Bzzoiro match
  if (id.startsWith('bz-')) {
    const numericId = id.slice(3);
    try {
      const e = await getBzzoiroEvent(numericId);
      if (!e) return null;
      return normalizeBzzoiroEvent(e);
    } catch (err) {
      console.error('getBzzoiroEvent failed:', err);
      return null;
    }
  }

  // API-Football match
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
  fixtureId: string,
  homeLogo = '',
  awayLogo = ''
): Promise<TeamLineup[]> {
  const isBz = fixtureId.startsWith('bz-');
  const numericId = isBz ? fixtureId.slice(3) : fixtureId;

  // Try Bzzoiro first
  try {
    const bz = await getBzzoiroEventLineups(numericId);
    if (bz && bz.lineups?.home && bz.lineups?.away) {
      const mapped = bzzoiroLineupsToTeamLineups(bz, homeLogo, awayLogo);
      if (mapped) return mapped;
    }
  } catch (err) {
    console.error('Bzzoiro lineups failed:', err);
  }

  // Fall back to API-Football (only for API-Football IDs)
  if (isBz || !KEY) return [];
  try {
    const res = await fetch(`${BASE}/fixtures/lineups?fixture=${numericId}`, {
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
    console.error('getFixtureLineups fallback failed:', err);
    return [];
  }
}

export type FixtureStats = {
  teamId: number;
  teamName: string;
  teamLogo: string;
  stats: { type: string; value: string | number | null }[];
};

export async function getFixtureStatistics(
  fixtureId: string,
  homeTeam?: { id: number; name: string },
  awayTeam?: { id: number; name: string }
): Promise<FixtureStats[]> {
  const isBz = fixtureId.startsWith('bz-');
  const numericId = isBz ? fixtureId.slice(3) : fixtureId;

  // Try Bzzoiro first
  try {
    const bz = await getBzzoiroEventStats(numericId);
    if (bz) {
      const mapped = bzzoiroStatsToFixtureStats(
        bz,
        homeTeam ?? { id: 0, name: 'Home' },
        awayTeam ?? { id: 1, name: 'Away' }
      );
      if (mapped) return mapped;
    }
  } catch (err) {
    console.error('Bzzoiro stats failed:', err);
  }

  // Fall back to API-Football
  if (isBz || !KEY) return [];
  try {
    const res = await fetch(`${BASE}/fixtures/statistics?fixture=${numericId}`, {
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
    console.error('getFixtureStatistics fallback failed:', err);
    return [];
  }
}

// ─── Player ratings (input: /fixtures/players from API-Football) ──
import { calculateRating, type PlayerStats, type Position } from './ratings';

export interface FixturePlayer {
  playerId: number;
  playerName: string;
  playerPhoto: string;
  number: number | null;
  teamId: number;
  teamName: string;
  teamLogo: string;
  team: 'home' | 'away';
  position: string;
  positionGroup: Position | 'UNKNOWN';
  minutes: number;
  substitute: boolean;
  rating: number;
  stats: PlayerStats;
}

function mapPosition(raw: string): Position | 'UNKNOWN' {
  switch (raw) {
    case 'G': return 'GK';
    case 'D': return 'DEF';
    case 'M': return 'MID';
    case 'F': return 'FWD';
    default: return 'UNKNOWN';
  }
}

function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function parsePassAccuracy(raw: unknown, total: number): number {
  if (raw === null || raw === undefined) return 0;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n <= 1) return n;
  if (n >= 40) return n / 100;
  if (total > 0 && n <= total) return n / total;
  return n / 100;
}

export async function getFixturePlayers(
  fixtureId: string
): Promise<FixturePlayer[]> {
  // Ratings rely on API-Football per-player stats, which requires an API-Football ID.
  // Bzzoiro doesn't expose per-player match stats, so Bzzoiro matches show empty ratings.
  if (fixtureId.startsWith('bz-')) return [];
  if (!KEY) return [];

  try {
    const res = await fetch(`${BASE}/fixtures/players?fixture=${fixtureId}`, {
      headers: { 'x-apisports-key': KEY },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data.response)) return [];
    if (data.response.length < 2) return [];

    const homeTeamId = data.response[0]?.team?.id;
    const out: FixturePlayer[] = [];

    for (const block of data.response) {
      const teamId = block.team?.id ?? 0;
      const teamName = block.team?.name ?? '';
      const teamLogo = block.team?.logo ?? '';
      const team: 'home' | 'away' = teamId === homeTeamId ? 'home' : 'away';

      for (const entry of block.players ?? []) {
        const p = entry.player ?? {};
        const s = entry.statistics?.[0] ?? {};
        const games = s.games ?? {};
        const goals = s.goals ?? {};
        const shots = s.shots ?? {};
        const passes = s.passes ?? {};
        const tackles = s.tackles ?? {};
        const duels = s.duels ?? {};
        const dribbles = s.dribbles ?? {};
        const fouls = s.fouls ?? {};
        const cards = s.cards ?? {};
        const penalty = s.penalty ?? {};

        const minutes = num(games.minutes);
        const goalsConceded = num(goals.conceded);
        const passesTotal = num(passes.total);

        const stats: PlayerStats = {
          minutes,
          goals: num(goals.total),
          ownGoals: 0,
          assists: num(goals.assists),
          keyPasses: num(passes.key),
          foulsDrawn: num(fouls.drawn),
          foulsCommitted: num(fouls.committed),
          yellowCards: num(cards.yellow),
          redCards: num(cards.red),
          penaltyMissed: num(penalty.missed),
          shotsTotal: num(shots.total),
          shotsOn: num(shots.on),
          passesTotal,
          passesAccuracy: parsePassAccuracy(passes.accuracy, passesTotal),
          tackles: num(tackles.total),
          blocks: num(tackles.blocks),
          interceptions: num(tackles.interceptions),
          duelsTotal: num(duels.total),
          duelsWon: num(duels.won),
          dribblesAttempts: num(dribbles.attempts),
          dribblesSuccess: num(dribbles.success),
          saves: num(goals.saves),
          penaltySaved: num(penalty.saved),
          goalsConceded,
          cleanSheet: minutes >= 60 && goalsConceded === 0,
        };

        const positionGroup = mapPosition(games.position ?? '');
        const rating =
          positionGroup === 'UNKNOWN'
            ? 6.0
            : calculateRating(stats, positionGroup);

        out.push({
          playerId: p.id ?? 0,
          playerName: p.name ?? 'Unknown',
          playerPhoto: p.photo ?? '',
          number: games.number ?? null,
          teamId,
          teamName,
          teamLogo,
          team,
          position: games.position ?? '',
          positionGroup,
          minutes,
          substitute: Boolean(games.substitute),
          rating,
          stats,
        });
      }
    }

    return out;
  } catch (err) {
    console.error('getFixturePlayers failed:', err);
    return [];
  }
}

// ─── Player profile (from LiveScore MCP) ──────────────────────────
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
