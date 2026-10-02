// lib/sources/bzzoiro-mappers.ts
// Maps Bzzoiro responses to the app's internal types.

import type { FixtureStats } from '@/lib/football-api';
import type { TeamLineup, LineupPlayer } from '@/types';
import type {
  BzzoiroEventStats,
  BzzoiroEventLineups,
  BzzoiroLineupTeam,
  BzzoiroLineupPlayer,
} from './bzzoiro';

// ---- Stats ----

function hasAnyData(side: Record<string, any>): boolean {
  if (!side) return false;
  if (side.ball_possession != null) return true;
  if (side.total_shots != null) return true;
  if (side.xg?.actual != null) return true;
  return false;
}

function pct(v: any): string | null {
  if (v == null) return null;
  return `${v}%`;
}

function fmt2(v: any): string | null {
  if (v == null || typeof v !== 'number') return null;
  return v.toFixed(2);
}

function ratioStat(v: any): string | null {
  if (!v || typeof v !== 'object') return null;
  if (v.value == null || v.total == null) return null;
  return `${v.value}/${v.total}${v.pct != null ? ` (${v.pct}%)` : ''}`;
}

// Ordered list of [display label, source key, formatter].
// Only stats that come back non-null are included in the output.
const STAT_ORDER: [string, string, (v: any) => string | number | null][] = [
  ['Ball Possession', 'ball_possession', (v) => (v != null ? `${v}%` : null)],
  ['Expected Goals (xG)', 'expected_goals', (v) => fmt2(v)],
  ['Total Shots', 'total_shots', (v) => v],
  ['Shots on Target', 'shots_on_target', (v) => v],
  ['Shots off Target', 'shots_off_target', (v) => v],
  ['Blocked Shots', 'blocked_shots', (v) => v],
  ['Shots Inside Box', 'shots_inside_box', (v) => v],
  ['Shots Outside Box', 'shots_outside_box', (v) => v],
  ['Big Chances', 'big_chances', (v) => v],
  ['Big Chances Missed', 'big_chances_missed', (v) => v],
  ['Hit Woodwork', 'hit_woodwork', (v) => v],
  ['Corner Kicks', 'corner_kicks', (v) => v],
  ['Fouls', 'fouls', (v) => v],
  ['Offsides', 'offsides', (v) => v],
  ['Yellow Cards', 'yellow_cards', (v) => v],
  ['Red Cards', 'red_cards', (v) => v],
  ['Goalkeeper Saves', 'goalkeeper_saves', (v) => v],
  ['Total Saves', 'total_saves', (v) => v],
  ['Big Saves', 'big_saves', (v) => v],
  ['Duels', 'duels', (v) => v],
  ['Aerial Duels', 'aerial_duels', ratioStat],
  ['Ground Duels', 'ground_duels', ratioStat],
  ['Tackles', 'tackles', (v) => v],
  ['Total Tackles', 'total_tackles', (v) => v],
  ['Interceptions', 'interceptions', (v) => v],
  ['Clearances', 'clearances', (v) => v],
  ['Recoveries', 'recoveries', (v) => v],
  ['Passes', 'passes', (v) => v],
  ['Accurate Passes', 'accurate_passes', (v) => v],
  ['Pass Accuracy', 'pass_accuracy_pct', pct],
  ['Crosses', 'crosses', ratioStat],
  ['Long Balls', 'long_balls', ratioStat],
  ['Dribbles', 'dribbles', ratioStat],
  ['Throw-ins', 'throw_ins', (v) => v],
  ['Free Kicks', 'free_kicks', (v) => v],
  ['Goal Kicks', 'goal_kicks', (v) => v],
  ['Dispossessed', 'dispossessed', (v) => v],
  ['Distance Covered', 'distance_covered', (v) => (v != null ? String(v) : null)],
  ['Sprints', 'number_of_sprints', (v) => v],
  ['Touches in Box', 'touches_in_penalty_area', (v) => v],
  ['Errors Leading to Shot', 'errors_lead_to_a_shot', (v) => v],
  ['Goals Prevented', 'goals_prevented', (v) => fmt2(v)],
  ['Average Rating', 'average_rating', (v) => fmt2(v)],
];

function mapSide(side: Record<string, any>): { type: string; value: string | number | null }[] {
  const out: { type: string; value: string | number | null }[] = [];
  for (const [label, key, fmt] of STAT_ORDER) {
    const raw = side?.[key];
    const mapped = fmt(raw);
    if (mapped == null) continue;
    out.push({ type: label, value: mapped });
  }
  return out;
}

export function bzzoiroStatsToFixtureStats(
  data: BzzoiroEventStats,
  homeTeam: { id: number; name: string },
  awayTeam: { id: number; name: string }
): FixtureStats[] | null {
  if (!data?.stats?.home || !data?.stats?.away) return null;
  if (!hasAnyData(data.stats.home) && !hasAnyData(data.stats.away)) return null;

  return [
    {
      teamId: homeTeam.id,
      teamName: homeTeam.name,
      teamLogo: '',
      stats: mapSide(data.stats.home),
    },
    {
      teamId: awayTeam.id,
      teamName: awayTeam.name,
      teamLogo: '',
      stats: mapSide(data.stats.away),
    },
  ];
}

// ---- Lineups ----

// Bzzoiro doesn't provide grid coordinates. We infer them from the player's
// position letter (G/D/M/F) and their index within that position group.
// Rows: GK=1, DEF=2, MID=3, FWD=4. Columns start at 1 left to right.
function inferGrid(position: string, indexInGroup: number, groupSize: number): string {
  const row = position === 'G' ? 1 : position === 'D' ? 2 : position === 'M' ? 3 : 4;
  const col = indexInGroup + 1;
  return `${row}:${col}`;
}

function mapLineupPlayers(players: BzzoiroLineupPlayer[]): LineupPlayer[] {
  // Group by position letter to compute index within group.
  const groups: Record<string, number> = {};
  return players.map((p) => {
    const pos = p.position ?? '';
    const idx = groups[pos] ?? 0;
    groups[pos] = idx + 1;
    return {
      id: p.id,
      name: p.name,
      number: p.jersey_number ?? null,
      position: pos,
      grid: inferGrid(pos, idx, 0),
    };
  });
}

function mapTeamSide(
  side: BzzoiroLineupTeam,
  logo: string
): TeamLineup {
  return {
    teamId: side.team_id,
    teamName: side.team_name,
    teamLogo: logo,
    formation: side.formation ?? '',
    startXI: mapLineupPlayers(side.players ?? []),
    substitutes: mapLineupPlayers(side.substitutes ?? []),
    coach: null,
  };
}

export function bzzoiroLineupsToTeamLineups(
  data: BzzoiroEventLineups,
  homeLogo: string,
  awayLogo: string
): TeamLineup[] | null {
  if (!data?.lineups?.home || !data?.lineups?.away) return null;
  if (!data.lineups.home.players?.length || !data.lineups.away.players?.length) return null;

  return [
    mapTeamSide(data.lineups.home, homeLogo),
    mapTeamSide(data.lineups.away, awayLogo),
  ];
}
