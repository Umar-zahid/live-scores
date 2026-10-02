// lib/ratings.ts
// Position-weighted statistical rating for a player's match performance.
// Pure, dependency-free, no API calls. Testable in isolation.
// Formula version: 1.0
//
// rating = BASE + (sum of positive contributions × minutesFactor)
//               + (sum of negative contributions × 1.0)
// clamped to [1.0, 10.0]
//
// Positives scale with minutes played so a 5-minute sub who scores
// doesn't get a 9. Penalties (cards, own goals) do NOT scale — they
// hurt at full weight regardless of time on pitch.
//
// The rating value itself is kept at full precision so ties sort
// correctly. Use displayRating() to get the 1-decimal string for UI.

export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface PlayerStats {
  minutes: number;

  // Universal
  goals: number;
  ownGoals: number;
  assists: number;
  keyPasses: number;
  foulsDrawn: number;
  foulsCommitted: number;
  yellowCards: number;
  redCards: number;
  penaltyMissed: number;

  // Shooting
  shotsTotal: number;
  shotsOn: number;

  // Passing
  passesTotal: number;
  passesAccuracy: number; // 0..1 (e.g. 0.83)

  // Defensive
  tackles: number;
  blocks: number;
  interceptions: number;

  // Duels
  duelsTotal: number;
  duelsWon: number;

  // Dribbles
  dribblesAttempts: number;
  dribblesSuccess: number;

  // GK
  saves: number;
  penaltySaved: number;
  goalsConceded: number;
  cleanSheet: boolean; // caller computes: minutes >= 60 && goalsConceded === 0
}

export interface RatingLine {
  label: string;
  delta: number; // effective delta (already scaled by minutesFactor if positive)
}

export interface RatingResult {
  rating: number; // full precision, e.g. 8.86
  base: number;
  delta: number;
  minutesFactor: number;
  lines: RatingLine[];
  formulaVersion: string;
}

const FORMULA_VERSION = '1.0';
const BASE = 6.0;
const MIN_RATING = 1.0;
const MAX_RATING = 10.0;

// ---------- helpers ----------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// (won / total) - 0.5 ; returns 0 if no duels
function duelRatioDelta(won: number, total: number): number {
  if (total <= 0) return 0;
  return won / total - 0.5;
}

// (accuracy - baseline) ; returns 0 if no passes attempted
function passAccuracyDelta(accuracy: number, baseline: number, total: number): number {
  if (total <= 0) return 0;
  return accuracy - baseline;
}

// ---------- main ----------

export function explainRating(stats: PlayerStats, position: Position): RatingResult {
  const minutesFactor = clamp(stats.minutes / 90, 0, 1);

  // Collect raw (unscaled) contributions
  const raw: RatingLine[] = [];
  const add = (label: string, delta: number) => {
    if (Math.abs(delta) < 1e-9) return;
    raw.push({ label, delta });
  };

  // ---------- universal ----------
  add('Goal', stats.goals * 1.0);
  add('Own goal', stats.ownGoals * -1.0);
  add('Assist', stats.assists * 0.7);
  add('Key pass', stats.keyPasses * 0.15);
  add('Foul drawn', stats.foulsDrawn * 0.05);
  add('Foul committed', stats.foulsCommitted * -0.05);
  add('Yellow card', stats.yellowCards * -0.3);
  add('Red card', stats.redCards * -1.5);
  add('Penalty missed', stats.penaltyMissed * -0.7);

  // ---------- position-specific ----------
  if (position === 'GK') {
    add('Save', stats.saves * 0.15);
    add('Penalty saved', stats.penaltySaved * 1.0);
    add('Goal conceded', stats.goalsConceded * -0.3);
    if (stats.cleanSheet) add('Clean sheet', 0.5);
  }

  if (position === 'DEF') {
    add('Tackle', stats.tackles * 0.1);
    add('Interception', stats.interceptions * 0.1);
    add('Block', stats.blocks * 0.1);
    add(
      'Duels',
      duelRatioDelta(stats.duelsWon, stats.duelsTotal) * 1.5
    );
    add(
      'Pass accuracy',
      passAccuracyDelta(stats.passesAccuracy, 0.75, stats.passesTotal) * 2.0
    );
    if (stats.cleanSheet) add('Clean sheet', 0.3);
    add('Goal conceded', stats.goalsConceded * -0.1);
  }

  if (position === 'MID') {
    add('Tackle', stats.tackles * 0.08);
    add('Interception', stats.interceptions * 0.08);
    add('Dribble', stats.dribblesSuccess * 0.1);
    add('Shot on target', stats.shotsOn * 0.1);
    add('Shot off target', Math.max(0, stats.shotsTotal - stats.shotsOn) * 0.05);
    add(
      'Duels',
      duelRatioDelta(stats.duelsWon, stats.duelsTotal) * 1.0
    );
    add(
      'Pass accuracy',
      passAccuracyDelta(stats.passesAccuracy, 0.80, stats.passesTotal) * 3.0
    );
  }

  if (position === 'FWD') {
    add('Tackle', stats.tackles * 0.05);
    add('Dribble', stats.dribblesSuccess * 0.15);
    add('Shot on target', stats.shotsOn * 0.2);
    add('Shot off target', Math.max(0, stats.shotsTotal - stats.shotsOn) * 0.05);
    add(
      'Duels',
      duelRatioDelta(stats.duelsWon, stats.duelsTotal) * 0.8
    );
    add(
      'Pass accuracy',
      passAccuracyDelta(stats.passesAccuracy, 0.75, stats.passesTotal) * 1.5
    );
  }

  // ---------- scale: positives × minutesFactor, negatives × 1.0 ----------
  const lines: RatingLine[] = raw.map((l) => ({
    label: l.label,
    delta: round2(l.delta >= 0 ? l.delta * minutesFactor : l.delta),
  }));

  const delta = round2(lines.reduce((sum, l) => sum + l.delta, 0));
  const rating = clamp(Math.round((BASE + delta) * 100) / 100, MIN_RATING, MAX_RATING);

  return {
    rating,
    base: BASE,
    delta,
    minutesFactor: round2(minutesFactor),
    lines,
    formulaVersion: FORMULA_VERSION,
  };
}

export function calculateRating(stats: PlayerStats, position: Position): number {
  return explainRating(stats, position).rating;
}

// 1-decimal string for UI, e.g. 8.86 -> "8.9", 7.94 -> "7.9"
export function displayRating(rating: number): string {
  return rating.toFixed(1);
}
