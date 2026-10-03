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
  shotmap: any[];
  momentum: any[];
  average_positions: Record<string, any>;
  xg_per_minute: any[];
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
  const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
  if (leagueId) params.set('league', String(leagueId));
  const data = await fetchJson<{ count: number; results: BzzoiroEvent[] }>(
    `/events/?${params}`,
    60
  );
  return data?.results ?? [];
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
