import { FootballMatch, MatchStatus } from '@/types';

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

  const events = (raw.events || []).map((e) => ({
    minute: e.time.elapsed ?? 0,
    type: mapEventType(e.type, e.detail),
    player: e.player.name ?? 'Unknown',
    assist: e.assist?.name ?? null,
    detail: e.detail,
    team: e.team.id === homeId ? ('home' as const) : ('away' as const),
  }));

  const venueParts = [raw.fixture.venue?.name, raw.fixture.venue?.city].filter(
    Boolean
  );

  return {
    id: String(raw.fixture.id),
    sport: 'football',
    status: mapStatus(raw.fixture.status.short),
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
        headers: { 'x-apisports-key': key },
        next: { revalidate: 30 },
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
  if (!key) {
    console.error('Missing API_FOOTBALL_KEY in environment');
    return null;
  }

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?id=${id}`,
      {
        headers: { 'x-apisports-key': key },
        next: { revalidate: 30 },
      }
    );
    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`);
      return null;
    }
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

// ── Player stats for a specific fixture ───────────────────────────
export async function getFixturePlayerStats(
  fixtureId: string
): Promise<import('@/types').PlayerMatchStat[]> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return [];

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures/players?fixture=${fixtureId}`,
      {
        headers: { 'x-apisports-key': key },
        next: { revalidate: 120 },
      }
    );
    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data.response)) return [];

    const out: import('@/types').PlayerMatchStat[] = [];

    data.response.forEach((teamBlock: any, index: number) => {
      const team: 'home' | 'away' = index === 0 ? 'home' : 'away';
      for (const p of teamBlock.players ?? []) {
        const s = p.statistics?.[0] ?? {};
        out.push({
          playerId: p.player?.id ?? 0,
          name: p.player?.name ?? 'Unknown',
          photo: p.player?.photo ?? '',
          number: s.games?.number ?? null,
          position: s.games?.position ?? '',
          rating: s.games?.rating ? Number(s.games.rating) : null,
          minutes: s.games?.minutes ?? 0,
          goals: s.goals?.total ?? 0,
          assists: s.goals?.assists ?? 0,
          shots: s.shots?.total ?? 0,
          passes: s.passes?.total ?? 0,
          yellow: s.cards?.yellow ?? 0,
          red: s.cards?.red ?? 0,
          team,
        });
      }
    });

    return out;
  } catch (err) {
    console.error('Fixture player stats failed:', err);
    return [];
  }
}

// ── Season stats for a single player (aggregated across competitions) ──
export async function getPlayerSeasonStats(
  playerId: number,
  season: number
): Promise<import('@/types').PlayerSeasonStat | null> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/players?id=${playerId}&season=${season}`,
      {
        headers: { 'x-apisports-key': key },
        next: { revalidate: 86400 }, // 24h — season stats don't change often
      }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const entry = data.response?.[0];
    if (!entry?.statistics?.length) return null;

    let appearances = 0,
      goals = 0,
      assists = 0,
      minutes = 0,
      yellow = 0,
      red = 0,
      ratingSum = 0,
      ratingCount = 0;
    let teamName = '';

    for (const s of entry.statistics) {
      appearances += s.games?.appearences ?? 0;
      minutes += s.games?.minutes ?? 0;
      goals += s.goals?.total ?? 0;
      assists += s.goals?.assists ?? 0;
      yellow += s.cards?.yellow ?? 0;
      red += s.cards?.red ?? 0;
      const r = s.games?.rating;
      if (r) {
        ratingSum += Number(r);
        ratingCount++;
      }
      if (!teamName && s.team?.name) teamName = s.team.name;
    }

    return {
      playerId: entry.player?.id ?? playerId,
      name: entry.player?.name ?? 'Unknown',
      photo: entry.player?.photo ?? '',
      age: entry.player?.age ?? null,
      nationality: entry.player?.nationality ?? '',
      team: teamName,
      appearances,
      goals,
      assists,
      minutes,
      yellow,
      red,
      rating: ratingCount
        ? Number((ratingSum / ratingCount).toFixed(2))
        : null,
    };
  } catch (err) {
    console.error('Player season stats failed:', err);
    return null;
  }
}
