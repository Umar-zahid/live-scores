import { FootballMatch, MatchStatus } from '@/types';
import type { TeamLineup } from '@/types';
import teamLogosRaw from '@/data/team-logos.json';
import {
  getBzzoiroEventStats,
  getBzzoiroEventLineups,
  getBzzoiroEventsInRange,
  getBzzoiroLiveEvents,
  getBzzoiroEvent,
  getBzzoiroEventIncidents,
  getBzzoiroPrediction,
  type BzzoiroEvent,
} from './sources/bzzoiro';
import {
  bzzoiroStatsToFixtureStats,
  bzzoiroLineupsToTeamLineups,
  bzzoiroIncidentsToEvents,
  bzzoiroShotmapToUI,
  type UIShot,
} from './sources/bzzoiro-mappers';
import { MAJOR_LEAGUE_IDS } from './sources/leagues';
import { calculateRating, type PlayerStats, type Position } from './ratings';
import { isValidMatchId } from './id-guards';
import { resolveLeagueName } from './sources/league-names';
import { unstable_cache } from 'next/cache';
import { lsmGetPlayer } from './livescore';

type TeamLogoEntry = { name: string; logo: string };
const TEAM_LOGOS = teamLogosRaw as Record<string, TeamLogoEntry>;

function normalizeTeamName(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(fc|cf|ac|sc|afc|cp|sv|vfl|vfb|tsv|as|asd|ss|ssc|usl|rc|rcd|sd|fk|bk|sk|if)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function teamLogo(name: string): string {
  const key = normalizeTeamName(name);
  if (!key) return '';
  return TEAM_LOGOS[key]?.logo ?? '';
}

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
  if (['1H', '2H', 'LIVE', 'SUSP', 'INT'].includes(s)) {
    if (elapsed > 130) return 'finished';
    return 'live';
  }
  // Extra time and penalty shootouts legitimately run to ~200 minutes.
  // Using the 130-min cutoff here flipped them to 'finished' while still live.
  if (['ET', 'BT', 'P'].includes(s)) {
    if (elapsed > 200) return 'finished';
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
  const d = (detail ?? '').toLowerCase();
  if (type === 'Goal') {
    // API-Football reports missed penalties as type='Goal',
    // detail='Missed Penalty' — those must not count as goals.
    if (d.includes('missed')) return 'other';
    return 'goal';
  }
  if (type === 'Card') {
    if (d === 'yellow card') return 'yellow_card';
    if (d === 'red card') return 'red_card';
    if (d.includes('second yellow')) return 'red_card';
    return 'other';
  }
  if (type === 'subst') return 'substitution';
  return 'other';
}

function normalizeMatch(raw: ApiFixture): FootballMatch {
  const homeId = raw.teams.home.id;
  const events = (raw.events || [])
    .map((e) => ({
      minute: e.time.elapsed ?? 0,
      type: mapEventType(e.type, e.detail),
      player: e.player.name ?? 'Unknown',
      assist: e.assist?.name ?? null,
      detail: e.detail,
      team: e.team.id === homeId ? ('home' as const) : ('away' as const),
    }))
    .filter((ev) => ev.type && ev.type !== 'other');

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
  const raw = (e.status ?? '').toLowerCase().replace(/[\s-]/g, '_');
  const period = (e.period ?? '').toLowerCase().replace(/[\s-]/g, '_');

  // Halftime — check first since it's more specific
  if (
    period === 'ht' ||
    period === 'half_time' ||
    period === 'halftime' ||
    period === 'break' ||
    raw === 'halftime' ||
    raw === 'half_time' ||
    raw === 'ht'
  ) {
    return 'halftime';
  }

  // Finished
  if (
    raw === 'finished' ||
    raw === 'ft' ||
    raw === 'full_time' ||
    raw === 'aet' ||
    raw === 'after_extra_time' ||
    raw === 'pen' ||
    raw === 'after_penalties' ||
    raw === 'after_penalty_shootout' ||
    period === 'ft' ||
    period === 'full_time'
  ) {
    return 'finished';
  }

  // Not started
  if (
    raw === 'notstarted' ||
    raw === 'not_started' ||
    raw === 'ns' ||
    raw === 'scheduled' ||
    raw === 'upcoming' ||
    raw === 'pre_match' ||
    raw === 'prematch' ||
    raw === 'tbd'
  ) {
    return 'upcoming';
  }

  // Postponed / cancelled / abandoned — no result. The feeds drop these
  // rows; a direct match link must not show a fake FT 0-0.
  if (
    raw === 'postponed' || raw === 'pst' ||
    raw === 'cancelled' || raw === 'canceled' || raw === 'canc' ||
    raw === 'abandoned' || raw === 'abd'
  ) {
    return 'upcoming';
  }

  // Suspended / interrupted can resume the same day — decide by time.
  if (
    raw === 'suspended' || raw === 'susp' ||
    raw === 'interrupted' || raw === 'int'
  ) {
    const kickoff = e.event_date ? new Date(e.event_date).getTime() : 0;
    const mins = kickoff > 0 ? (Date.now() - kickoff) / 60000 : 0;
    return mins > 0 && mins < 200 ? 'live' : 'finished';
  }

  // Awarded / walkover — a decision was made; treat as finished.
  if (
    raw === 'awarded' || raw === 'awd' ||
    raw === 'walkover' || raw === 'wo'
  ) {
    return 'finished';
  }

  // Penalty shootout: status string alone can mean in-progress OR
  // just-finished. Use kickoff time to decide.
  if (
    raw === 'penalties' ||
    raw === 'penalty_shootout' ||
    raw === 'shootout'
  ) {
    const kickoff = e.event_date ? new Date(e.event_date).getTime() : 0;
    const mins = kickoff > 0 ? (Date.now() - kickoff) / 60000 : 0;
    return mins > 0 && mins < 200 ? 'live' : 'finished';
  }

  // Live detection: any in-progress keyword OR a period marker
  if (
    raw === 'inprogress' ||
    raw === 'in_progress' ||
    raw === 'live' ||
    raw === 'inplay' ||
    raw === 'in_play' ||
    raw === 'playing' ||
    raw === '1h' ||
    raw === '2h' ||
    raw === 'et' ||
    raw === 'bt' ||
    period === '1st_half' ||
    period === '2nd_half' ||
    period === 'first_half' ||
    period === 'second_half' ||
    period === '1h' ||
    period === '2h' ||
    period === 'extra_time'
  ) {
    return 'live';
  }

  // Fallback: only trust current_minute when the raw status was empty/unknown.
  // This prevents a stale 'live' label on finished matches with leftover minutes.
  if (!raw && typeof e.current_minute === 'number' && e.current_minute > 0) {
    return 'live';
  }

  return 'upcoming';
}

function normalizeBzzoiroEvent(e: BzzoiroEvent): FootballMatch {
  return {
    id: `bz-${e.id}`,
    sport: 'football',
    status: bzzoiroStatus(e),
    league: resolveLeagueName(e.league_id, e.league_name),
    leagueCountry: '',
    startTime: e.event_date ?? '',
    homeTeam: {
      id: e.home_team_id,
      name: e.home_team ?? 'TBD',
      logo: teamLogo(e.home_team),
      score: e.home_score ?? 0,
    },
    awayTeam: {
      id: e.away_team_id,
      name: e.away_team ?? 'TBD',
      logo: teamLogo(e.away_team),
      score: e.away_score ?? 0,
    },
    minute: e.current_minute ?? undefined,
    events: [],
  };
}

async function getMajorLeagueMatches(
  from?: string,
  to?: string
): Promise<FootballMatch[]> {
  const now = new Date();
  // Default window: recently finished (up to 7 days ago) → live → upcoming (next 3 days)
  const windowFrom = from ?? new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const windowTo = to ?? new Date(now.getTime() + 3 * 24 * 3600 * 1000).toISOString().slice(0, 10);

  // One paginated fetch for the whole window, then filter client-side by
  // league. The response carries league_id on every event, so 16 pages
  // beats 64 parallel per-league requests — and won't truncate at 50.
  const all = await getBzzoiroEventsInRange(windowFrom, windowTo);

  const filtered = all.filter((e) => {
    if (!e) return false;
    if (!e.event_date) return false;
    if (!e.home_team || !e.away_team) return false;
    if (!MAJOR_LEAGUE_IDS.includes(e.league_id)) return false;
    const st = (e.status ?? '').toLowerCase().replace(/[\s-]/g, '_');
    if (
      st === 'postponed' || st === 'pst' ||
      st === 'cancelled' || st === 'canceled' || st === 'canc' ||
      st === 'abandoned' || st === 'abd'
    ) return false;
    return true;
  });

  // Deduplicate by (homeId, awayId, kickoffHour)
  const seen = new Set<string>();
  const deduped: BzzoiroEvent[] = [];
  for (const e of filtered) {
    const key = `${e.home_team_id ?? 'x'}-${e.away_team_id ?? 'x'}-${(e.event_date ?? '').slice(0, 13)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(e);
  }

  return deduped.map(normalizeBzzoiroEvent);
}

// ─── Public API ───────────────────────────────────────────────────

export async function getFootballMatches(date?: string): Promise<FootballMatch[]> {
  const today = new Date().toISOString().slice(0, 10);
  const isToday = !date || date === today;
  const validDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;

  // When a specific non-today date is requested, scope the scheduled
  // fetch to that single day and skip the global live feed entirely
  // (live matches today shouldn't appear when browsing past/future).
  const majorPromise = validDate && !isToday
    ? getMajorLeagueMatches(validDate, validDate)
    : getMajorLeagueMatches();

  const livePromise: Promise<FootballMatch[]> = isToday
    ? getBzzoiroLiveEvents().then((events) =>
        events
          .filter((e) => {
            if (!e || !e.event_date || !e.home_team || !e.away_team) return false;
            const st = (e.status ?? '').toLowerCase().replace(/[\s-]/g, '_');
            if (
              st === 'postponed' || st === 'pst' ||
              st === 'cancelled' || st === 'canceled' || st === 'canc' ||
              st === 'abandoned' || st === 'abd'
            ) return false;
            return true;
          })
          .map(normalizeBzzoiroEvent)
      )
    : Promise.resolve([]);

  const [majorRes, liveRes] = await Promise.allSettled([majorPromise, livePromise]);

  const majorArr = majorRes.status === 'fulfilled' ? majorRes.value : [];
  const liveArr = liveRes.status === 'fulfilled' ? liveRes.value : [];

  // Deduplicate by (home team, away team, kickoff hour).
  // Insertion order: live feed first, then major leagues overwrite on conflict
  // (major-league rows have richer metadata like round info).
  const byKey = new Map<string, FootballMatch>();
  const keyOf = (m: FootballMatch) =>
    `${m.homeTeam.name.toLowerCase()}|${m.awayTeam.name.toLowerCase()}|${m.startTime.slice(0, 13)}`;

  for (const m of liveArr) byKey.set(keyOf(m), m);
  for (const m of majorArr) byKey.set(keyOf(m), m);

  let merged = Array.from(byKey.values());

  // Only call API-Football if Bzzoiro gave us nothing at all.
  if (merged.length === 0) {
    console.log('getFootballMatches: nothing from Bzzoiro, falling back to API-Football');
    merged = await getApiFootballMatches();
  }

  // Sort: live > halftime > upcoming (soonest first) > finished (most recent first).
  const order: Record<MatchStatus, number> = {
    live: 0,
    halftime: 1,
    upcoming: 2,
    finished: 3,
  };
  merged.sort((a, b) => {
    const sa = order[a.status] ?? 4;
    const sb = order[b.status] ?? 4;
    if (sa !== sb) return sa - sb;
    if (a.status === 'upcoming') {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    }
    if (a.status === 'finished') {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    }
    return 0;
  });

  if (process.env.NODE_ENV === 'development') {
    const liveCount = merged.filter((m) => m.status === 'live' || m.status === 'halftime').length;
    console.log(
      `getFootballMatches: merged=${merged.length} (major=${majorArr.length}, live=${liveArr.length}, liveFinal=${liveCount})`
    );
  }

  return merged;
}

export async function getFootballMatchById(
  id: string
): Promise<FootballMatch | null> {
  // Reject anything that isn't a valid match ID shape before hitting
  // upstream APIs — a garbage ID would burn quota and pollute the cache.
  if (!isValidMatchId(id)) return null;

  // Bzzoiro match
  if (id.startsWith('bz-')) {
    const numericId = id.slice(3);
    try {
      const e = await getBzzoiroEvent(numericId);
      if (!e) return null;
      const base = normalizeBzzoiroEvent(e);
      // Enrich with incidents (goals, cards, subs)
      try {
        const isLive = base.status === 'live' || base.status === 'halftime';
        const inc = await getBzzoiroEventIncidents(numericId, isLive);
        if (inc) base.events = bzzoiroIncidentsToEvents(inc);
      } catch (err) {
        console.error('Bzzoiro incidents enrichment failed:', err);
      }
      return base;
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

// ─── Match prediction (Bzzoiro CatBoost ML) ───────────────────────
export interface MatchPrediction {
  event_id: number;
  match_result: {
    prob_home: number;
    prob_draw: number;
    prob_away: number;
    predicted: 'H' | 'D' | 'A' | '';
  };
  expected_goals: { home: number; away: number };
  over_under: {
    prob_over_15: number;
    prob_over_25: number;
    prob_over_35: number;
  };
  btts: { prob_yes: number };
  score: { most_likely: string };
  corners?: {
    prob_over_85?: number;
    prob_over_95?: number;
    prob_over_105?: number;
  };
  model: { confidence: number; version: string };
}

export async function getMatchPrediction(
  fixtureId: string
): Promise<MatchPrediction | null> {
  // Predictions only come from Bzzoiro, so only attempt for bz- IDs.
  if (!fixtureId.startsWith('bz-')) return null;
  const numericId = fixtureId.slice(3);
  try {
    const raw = await getBzzoiroPrediction(numericId);
    if (!raw || !raw.markets) return null;
    const m = raw.markets;
    return {
      event_id: raw.event?.id ?? Number(numericId),
      match_result: {
        prob_home: m.match_result?.prob_home ?? 0,
        prob_draw: m.match_result?.prob_draw ?? 0,
        prob_away: m.match_result?.prob_away ?? 0,
        predicted: m.match_result?.predicted ?? '',
      },
      expected_goals: {
        home: m.expected_goals?.home ?? 0,
        away: m.expected_goals?.away ?? 0,
      },
      over_under: {
        prob_over_15: m.over_under?.prob_over_15 ?? 0,
        prob_over_25: m.over_under?.prob_over_25 ?? 0,
        prob_over_35: m.over_under?.prob_over_35 ?? 0,
      },
      btts: { prob_yes: m.btts?.prob_yes ?? 0 },
      score: { most_likely: m.score?.most_likely ?? '' },
      corners: m.corners ?? undefined,
      model: {
        confidence: raw.model?.confidence ?? 0,
        version: raw.model?.version ?? '',
      },
    };
  } catch (err) {
    console.error('getMatchPrediction failed:', err);
    return null;
  }
}

// ─── Shotmap + momentum data (Bzzoiro-only) ───────────────────────

export interface MomentumPoint {
  minute: number;
  value: number; // -100..100, positive = home
}

export interface XgPoint {
  minute: number;
  cumHome: number;
  cumAway: number;
}

export interface MatchVisualData {
  shotmap: UIShot[];
  momentum: MomentumPoint[];
  xgTimeline: XgPoint[];
}

export async function getShotmapData(
  fixtureId: string,
  isLive = false
): Promise<MatchVisualData | null> {
  if (!fixtureId.startsWith('bz-')) return null;
  const numericId = fixtureId.slice(3);
  try {
    const raw = await getBzzoiroEventStats(numericId);
    if (!raw) return null;

    const shotmap = bzzoiroShotmapToUI(raw.shotmap ?? []);

    const momentum: MomentumPoint[] = Array.isArray(raw.momentum)
      ? raw.momentum
          .filter((p) => p && typeof p.m === 'number' && typeof p.v === 'number')
          .map((p) => ({ minute: p.m, value: p.v }))
      : [];

    const xgTimeline: XgPoint[] = Array.isArray(raw.xg_per_minute)
      ? raw.xg_per_minute
          .filter((p) => p && typeof p.m === 'number')
          .map((p) => ({
            minute: p.m,
            cumHome: Number.isFinite(p.cum_home) ? p.cum_home : 0,
            cumAway: Number.isFinite(p.cum_away) ? p.cum_away : 0,
          }))
      : [];

    if (!shotmap.length && !momentum.length && !xgTimeline.length) return null;

    return { shotmap, momentum, xgTimeline };
  } catch (err) {
    console.error('getShotmapData failed:', err);
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

  // Bzzoiro path — only when the fixture ID is actually a Bzzoiro ID.
  // Never send an API-Football numeric ID to the Bzzoiro endpoint:
  // the ID namespaces are different, and a collision would return
  // another match's lineups under the right team names.
  if (isBz) {
    try {
      const bz = await getBzzoiroEventLineups(numericId);
      if (bz && bz.lineups?.home && bz.lineups?.away) {
        const mapped = bzzoiroLineupsToTeamLineups(bz, homeLogo, awayLogo);
        if (mapped) return mapped;
      }
    } catch (err) {
      console.error('Bzzoiro lineups failed:', err);
    }
    return [];
  }

  // API-Football path
  if (!KEY) return [];
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
  awayTeam?: { id: number; name: string },
  isLive = false
): Promise<FixtureStats[]> {
  const isBz = fixtureId.startsWith('bz-');
  const numericId = isBz ? fixtureId.slice(3) : fixtureId;

  // Try Bzzoiro first — only for bz- IDs. Sending an API-Football
  // numeric ID to the Bzzoiro endpoint would return another match's
  // stats (different ID namespaces).
  try {
    const bz = isBz ? await getBzzoiroEventStats(numericId, isLive) : null;
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
        // Use MID as the fallback so the badge rating matches the
        // expanded breakdown in PlayerRatings.tsx (which also falls back
        // to MID). Otherwise the badge shows 6.0 while the breakdown
        // computes as a midfielder.
        const ratingPosition: Position =
          positionGroup === 'UNKNOWN' ? 'MID' : positionGroup;
        const rating = calculateRating(stats, ratingPosition);

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
