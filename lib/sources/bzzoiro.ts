// lib/sources/bzzoiro.ts
// Raw client for the Bzzoiro Sports Data API v2.
// Auth: Authorization: Token <BZZOIRO_API_KEY>

const KEY = process.env.BZZOIRO_API_KEY;
const BASE = 'https://sports.bzzoiro.com/api/v2';

function authHeaders(): Record<string, string> {
  if (!KEY) throw new Error('Missing BZZOIRO_API_KEY');
  return { Authorization: `Token ${KEY}` };
}

async function fetchJson<T>(path: string, revalidate: number): Promise<T | null> {
  if (!KEY) return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: authHeaders(),
      next: { revalidate },
    });
    if (!res.ok) {
      console.error(`Bzzoiro ${res.status} for ${path}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`Bzzoiro fetch error for ${path}:`, err);
    return null;
  }
}

// ---- Types ----

export interface BzzoiroEvent {
  id: number;
  league_id: number;
  league_name: string;
  home_team_id: number;
  home_team: string;
  away_team_id: number;
  away_team: string;
  event_date: string;
  status: 'finished' | 'inprogress' | 'notstarted' | string;
  period: string;
  current_minute: number | null;
  home_score: number | null;
  away_score: number | null;
  home_score_ht: number | null;
  away_score_ht: number | null;
  penalty_shootout: [number, number] | null;
  extra_time_score: [number, number] | null;
  live_websocket: boolean;
  websocket_plus: boolean;
  last_updated: string;
  head_to_head?: BzzoiroH2H | null;
  highlights?: Record<string, any> | null;
}

export interface BzzoiroH2HMatch {
  date: string;
  home: string;
  away: string;
  home_team_id: number;
  away_team_id: number;
  home_score: number;
  away_score: number;
  score: string;
  event_id: number;
}

export interface BzzoiroH2H {
  total_matches: number;
  home_wins: number;
  draws: number;
  away_wins: number;
  home_goals: number;
  away_goals: number;
  avg_total_goals: number;
  home_win_rate: number;
  away_win_rate: number;
  recent_matches: BzzoiroH2HMatch[];
}

export interface BzzoiroShotmapEntry {
  pos: { x: number; y: number; z?: number };
  gm: { x: number; y: number; z?: number };
  xg: number;
  gml?: string;
  min: number;
  added?: number | null;
  sit?: string;
  body?: string;
  home: boolean;
  type: string; // "goal" | "save" | "miss" | "block" | "post" | ...
  xgot?: number | null;
  player_id: number;
  xg_estimated?: boolean;
  block?: { x: number; y: number; z?: number };
}

export interface BzzoiroMomentumPoint {
  m: number; // minute (may be fractional)
  v: number; // -100..100, positive = home pressuring
}

export interface BzzoiroXgPoint {
  m: number;
  xg_home: number;
  xg_away: number;
  cum_home: number;
  cum_away: number;
  estimated: boolean;
}

export interface BzzoiroAveragePosition {
  n: number;
  x: number;
  y: number;
  pos: string;
  name: string;
  player_id: number;
}

export interface BzzoiroEventStats {
  event_id: number;
  xg_estimated: boolean;
  stats: {
    home: Record<string, any>;
    away: Record<string, any>;
    first_half?: { home: Record<string, any>; away: Record<string, any> };
    second_half?: { home: Record<string, any>; away: Record<string, any> };
  };
  shotmap: BzzoiroShotmapEntry[];
  momentum: BzzoiroMomentumPoint[];
  average_positions: {
    home?: BzzoiroAveragePosition[];
    away?: BzzoiroAveragePosition[];
  };
  xg_per_minute: BzzoiroXgPoint[];
}

export interface BzzoiroLineupPlayer {
  id: number;
  name: string;
  short_name: string;
  position: string;
  jersey_number: number | null;
  captain: boolean;
  ai_score: number | null;
}

export interface BzzoiroLineupTeam {
  team_id: number;
  team_name: string;
  formation: string;
  confidence: number | null;
  players: BzzoiroLineupPlayer[];
  substitutes: BzzoiroLineupPlayer[];
}

export interface BzzoiroEventLineups {
  event_id: number;
  lineup_status: 'confirmed' | 'predicted' | 'unavailable' | string;
  beta: boolean;
  lineups: { home: BzzoiroLineupTeam; away: BzzoiroLineupTeam };
  unavailable_players: Record<string, any>;
  updated_at: string;
}

export interface BzzoiroIncident {
  type: string; // "period" | "injuryTime" | "goal" | "card" | "substitution"
  minute?: number | null;
  added_time?: number | null;

  // "period" + "goal"
  text?: string;
  is_live?: boolean;
  home_score?: number | null;
  away_score?: number | null;

  // "injuryTime"
  length?: number;

  // "goal"
  player?: string;
  player_id?: number;
  assist?: string | null;
  goal_type?: string;
  sequence?: any[];

  // "card"
  card_type?: string; // "yellow" | "red"
  reason?: string;

  // "substitution"
  player_in?: string;
  player_out?: string;
  player_in_id?: number;
  player_out_id?: number;

  // goal / card / sub all have this — home or away side
  is_home?: boolean;

  // alternate field names (safety net for other API responses)
  player_name?: string;
  assist_player_name?: string;
  player_in_name?: string;
  player_out_name?: string;
  team_id?: number;
  assist_player_id?: number;
}

export interface BzzoiroEventIncidents {
  event_id: number;
  incidents: BzzoiroIncident[];
}

export interface BzzoiroPlayer {
  id: number;
  name: string;
  short_name: string;
  position: string;
  specific_position: string;
  jersey_number: number | null;
  date_of_birth: string;
  height_cm: number | null;
  weight_kg: number | null;
  preferred_foot: string;
  nationality: string;
  current_team_id: number | null;
  national_team_id: number | null;
  current_team: { id: number; name: string; short_name: string } | null;
  national_team: { id: number; name: string; short_name: string } | null;
  market_value_eur: number | null;
  contract_until: string | null;
  availability: string;
  injury_type: string;
  injury_expected_return: string | null;
  attributes: any;
  strengths: string[];
  weaknesses: string[];
  rating: number | null;
  potential: number | null;
  injury_risk: number | null;
  wage_eur_annual: number | null;
}

export interface BzzoiroTeam {
  id: number;
  name: string;
  short_name: string;
  country: string;
  country_code: string;
  venue_id: number | null;
}

export interface BzzoiroLeague {
  id: number;
  name: string;
  country: string;
  is_women: boolean;
  is_active: boolean;
  current_season: number | string;
}

// ---- Public API ----

export async function getBzzoiroLiveEvents(): Promise<BzzoiroEvent[]> {
  const data = await fetchJson<{ count: number; events: BzzoiroEvent[] }>(
    '/events/live/',
    15
  );
  return data?.events ?? [];
}

export async function getBzzoiroEvent(id: number | string): Promise<BzzoiroEvent | null> {
  return await fetchJson<BzzoiroEvent>(`/events/${id}/`, 30);
}

export async function getBzzoiroEventsInRange(
  dateFrom: string,
  dateTo: string,
  leagueId?: number
): Promise<BzzoiroEvent[]> {
  const all: BzzoiroEvent[] = [];
  const MAX_PAGES = 40;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
      page: String(page),
    });
    if (leagueId) params.set('league', String(leagueId));

    const data = await fetchJson<{ count: number; results: BzzoiroEvent[] }>(
      `/events/?${params}`,
      60
    );
    if (!data?.results || data.results.length === 0) break;
    all.push(...data.results);
    if (all.length >= (data.count ?? 0)) break;
    if (data.results.length < 50) break;
  }

  return all;
}

export async function getBzzoiroEventStats(
  eventId: number | string,
  isLive = false
): Promise<BzzoiroEventStats | null> {
  return await fetchJson<BzzoiroEventStats>(
    `/events/${eventId}/stats/`,
    isLive ? 30 : 3600
  );
}

export async function getBzzoiroEventLineups(
  eventId: number | string
): Promise<BzzoiroEventLineups | null> {
  return await fetchJson<BzzoiroEventLineups>(
    `/events/${eventId}/lineups/`,
    300
  );
}

export async function getBzzoiroEventIncidents(
  eventId: number | string,
  isLive = false
): Promise<BzzoiroEventIncidents | null> {
  return await fetchJson<BzzoiroEventIncidents>(
    `/events/${eventId}/incidents/`,
    isLive ? 15 : 3600
  );
}

export async function getBzzoiroPrediction(
  eventId: number | string
): Promise<any | null> {
  return await fetchJson<any>(`/events/${eventId}/prediction/`, 120);
}

export async function searchBzzoiroPlayers(name: string): Promise<BzzoiroPlayer[]> {
  const data = await fetchJson<{ count: number; results: BzzoiroPlayer[] }>(
    `/players/?name=${encodeURIComponent(name)}`,
    3600
  );
  return data?.results ?? [];
}

export async function getBzzoiroPlayer(id: number | string): Promise<BzzoiroPlayer | null> {
  return await fetchJson<BzzoiroPlayer>(`/players/${id}/`, 3600);
}

export async function searchBzzoiroTeams(name: string): Promise<BzzoiroTeam[]> {
  const data = await fetchJson<{ count: number; results: BzzoiroTeam[] }>(
    `/teams/?name=${encodeURIComponent(name)}`,
    3600
  );
  return data?.results ?? [];
}

export async function getBzzoiroLeagues(): Promise<BzzoiroLeague[]> {
  const data = await fetchJson<{ count: number; results: BzzoiroLeague[] }>(
    '/leagues/',
    86400
  );
  return data?.results ?? [];
}

// ─── League season / standings / top scorers (Bzzoiro v2) ────────

export interface BzzoiroSeasonInfo {
  league_id: number;
  season: {
    id: number;
    name: string;
    year: number;
    start_date: string;
    end_date: string;
    is_current: boolean;
    stages?: Array<{
      stage: string;
      stage_name: string;
      matches: number;
      rounds: number;
      start_date: string;
      end_date: string;
    }>;
  };
}

export interface BzzoiroZone {
  key: string;
  label: string;
  type: string;
}

export interface BzzoiroStandingRow {
  position: number;
  team_id: number;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  xgf?: number;
  xga?: number;
  xgd?: number;
  xg_games?: number;
  form?: string;
  live?: boolean;
  zone?: BzzoiroZone | null;
}

export interface BzzoiroStandingsResponse {
  league_id: number;
  season: BzzoiroSeasonInfo['season'];
  grouped?: boolean;
  zones?: BzzoiroZone[];
  standings: BzzoiroStandingRow[];
}

export interface BzzoiroScorerEntry {
  player_id: number;
  player_name?: string;
  name?: string;
  short_name?: string;
  team_id?: number;
  team_name?: string;
  value?: number;
  goals?: number;
  matches?: number;
  assists?: number;
  position?: number;
  rank?: number;
}

export interface BzzoiroTopResponse {
  league_id: number;
  team_id?: number | null;
  season: BzzoiroSeasonInfo['season'];
  stat: string;
  label: string;
  leaders: BzzoiroScorerEntry[];
}

export async function getBzzoiroLeagueSeason(
  leagueId: number
): Promise<BzzoiroSeasonInfo | null> {
  return await fetchJson<BzzoiroSeasonInfo>(`/leagues/${leagueId}/season/`, 3600);
}

export async function getBzzoiroLeagueStandings(
  leagueId: number,
  seasonId: number
): Promise<BzzoiroStandingsResponse | null> {
  return await fetchJson<BzzoiroStandingsResponse>(
    `/leagues/${leagueId}/standings/?season_id=${seasonId}`,
    3600
  );
}

export async function getBzzoiroLeagueTop(
  leagueId: number,
  seasonId: number,
  stat: 'scorers' | 'assists' = 'scorers'
): Promise<BzzoiroTopResponse | null> {
  return await fetchJson<BzzoiroTopResponse>(
    `/leagues/${leagueId}/top/${stat}/?season_id=${seasonId}`,
    3600
  );
}
