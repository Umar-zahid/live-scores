import { FootballMatch, MatchStatus } from '@/types';

type ApiStatus = {
  short: string;
  elapsed: number | null;
};

type ApiEvent = {
  time: { elapsed: number | null; extra: number | null };
  team: { id: number };
  player: { name: string | null };
  type: string;
  detail: string;
};

type ApiFixture = {
  fixture: {
    id: number;
    date: string;
    status: ApiStatus;
  };
  league: { name: string };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  goals: { home: number | null; away: number | null };
  events: ApiEvent[];
};

type ApiResponse = {
  results: number;
  response: ApiFixture[];
};

function mapStatus(short: string): MatchStatus {
  if (['1H', '2H', 'ET', 'BT', 'P', 'LIVE'].includes(short)) return 'live';
  if (short === 'HT') return 'halftime';
  if (['FT', 'AET', 'PEN'].includes(short)) return 'finished';
  return 'upcoming';
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
  const awayId = raw.teams.away.id;

  const events = (raw.events || []).map((e) => ({
    minute: e.time.elapsed ?? 0,
    type: mapEventType(e.type, e.detail),
    player: e.player.name ?? 'Unknown',
    team: e.team.id === homeId ? ('home' as const) : ('away' as const),
  }));

  return {
    id: String(raw.fixture.id),
    sport: 'football',
    status: mapStatus(raw.fixture.status.short),
    league: raw.league.name,
    startTime: raw.fixture.date,
    homeTeam: {
      name: raw.teams.home.name,
      score: raw.goals.home ?? 0,
    },
    awayTeam: {
      name: raw.teams.away.name,
      score: raw.goals.away ?? 0,
    },
    minute: raw.fixture.status.elapsed ?? undefined,
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
        headers: {
          'x-apisports-key': key,
        },
        next: { revalidate: 30 },
      }
    );

    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data: ApiResponse = await res.json();

    if (!data.response || !Array.isArray(data.response)) {
      return [];
    }

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

  if (!key) {
    console.error('Missing API_FOOTBALL_KEY in environment');
    return null;
  }

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?id=${id}`,
      {
        headers: {
          'x-apisports-key': key,
        },
        next: { revalidate: 30 },
      }
    );

    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data: ApiResponse = await res.json();

    if (
      !data.response ||
      !Array.isArray(data.response) ||
      data.response.length === 0
    ) {
      return null;
    }

    return normalizeMatch(data.response[0]);
  } catch (err) {
    console.error('Football API fetch failed:', err);
    return null;
  }
}
