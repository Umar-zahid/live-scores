import { FootballMatch, MatchStatus } from '@/types';
import type { TeamLineup, LineupPlayer, LineupCoach } from '@/types';

type ApiStatus = {
  short: string;
  elapsed: number | null;
};

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

type ApiResponse = {
  results: number;
  response: ApiFixture[];
};

// ── Status mapping with time-based sanity check ──────────────────
// The API keeps returning "2H" for a few minutes after full time.
// We cross-check with kickoff time to force-correct it.
function computeStatus(raw: ApiFixture): MatchStatus {
  const s = raw.fixture.status.short;

  // Explicit finished states
  if (['FT', 'AET', 'PEN', 'ABD', 'AWD', 'WO'].includes(s)) return 'finished';

  // Explicit not-started states
  if (['NS', 'TBD', 'PST', 'CANC'].includes(s)) return 'upcoming';

  // Halftime — trust it but still sanity-check
  if (s === 'HT') {
    const elapsed = (Date.now() - new Date(raw.fixture.date).getTime()) / 60000;
    if (elapsed > 130) return 'finished';
    return 'halftime';
  }

  // Live family — sanity-check against elapsed real time
  if (['1H', '2H', 'ET', 'BT', 'P', 'LIVE', 'SUSP', 'INT'].includes(s)) {
    const elapsed = (Date.now() - new Date(raw.fixture.date).getTime()) / 60000;
    // 45 + 15 (HT) + 45 + stoppage (~25) = 130 minutes max realistic
    if (elapsed > 130) return 'finished';
    return 'live';
  }

  return 'upcoming';
}

function computeMinute(raw: ApiFixture): number | undefined {
  const api = raw.fixture.status.elapsed;
  if (api != null) return api;
  if (raw.fixture.status.short === 'HT') return 45;

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
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    console.error('Missing API_FOOTBALL_KEY in environment');
    return [];
  }

  try {
    const res = await fetch(
      'https://v3.football.api-sports.io/fixtures?live=all',
      {
        headers: { 'x-apisports-key': key },
        next: { revalidate: 15 },
      }
    );
    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`);
      return [];
    }
    const data: ApiResponse = await res.json();
    if (!data.response || !Array.isArray(data.response)) return [];
    return data.response.map(normalizeMatch);
  } catch (err) {
    console.error('Football API fetch failed:', err);
    return [];
  }
}

export async function getFootballMatchById(
  id: string
): Promise<FootballMatch | null> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?id=${id}`,
      {
        headers: { 'x-apisports-key': key },
        next: { revalidate: 15 },
      }
    );
    if (!res.ok) return null;
    const data: ApiResponse = await res.json();
    if (!data.response || !Array.isArray(data.response) || !data.response.length) {
      return null;
    }
    return normalizeMatch(data.response[0]);
  } catch (err) {
    console.error('Football API fetch failed:', err);
    return null;
  }
}

export async function getFixtureLineups(
  fixtureId: string
): Promise<TeamLineup[]> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return [];

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixtureId}`,
      {
        headers: { 'x-apisports-key': key },
        next: { revalidate: 300 },
      }
    );
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
    console.error('Fixture lineups failed:', err);
    return [];
  }
}
