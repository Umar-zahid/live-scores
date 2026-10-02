// scripts/test-rating.ts
// Verifies lib/ratings.ts against the two worked examples in the design doc.
// Run with: npx --yes tsx scripts/test-rating.ts

import { explainRating, displayRating, type PlayerStats, type Position } from '../lib/ratings';

function emptyStats(): PlayerStats {
  return {
    minutes: 0,
    goals: 0,
    ownGoals: 0,
    assists: 0,
    keyPasses: 0,
    foulsDrawn: 0,
    foulsCommitted: 0,
    yellowCards: 0,
    redCards: 0,
    penaltyMissed: 0,
    shotsTotal: 0,
    shotsOn: 0,
    passesTotal: 0,
    passesAccuracy: 0,
    tackles: 0,
    blocks: 0,
    interceptions: 0,
    duelsTotal: 0,
    duelsWon: 0,
    dribblesAttempts: 0,
    dribblesSuccess: 0,
    saves: 0,
    penaltySaved: 0,
    goalsConceded: 0,
    cleanSheet: false,
  };
}

// ---------- Case 1: Forward (expected 8.86) ----------
const fwd: PlayerStats = {
  ...emptyStats(),
  minutes: 90,
  goals: 1,
  assists: 1,
  shotsTotal: 4,
  shotsOn: 3,
  passesTotal: 28,
  passesAccuracy: 0.79,
  duelsTotal: 8,
  duelsWon: 5,
  dribblesAttempts: 2,
  dribblesSuccess: 2,
  foulsDrawn: 1,
};

// ---------- Case 2: Defender (expected 7.94) ----------
const def: PlayerStats = {
  ...emptyStats(),
  minutes: 90,
  tackles: 6,
  interceptions: 4,
  blocks: 3,
  passesTotal: 35,
  passesAccuracy: 0.86,
  duelsTotal: 9,
  duelsWon: 7,
  yellowCards: 1,
  goalsConceded: 0,
  cleanSheet: true,
};

function runCase(name: string, stats: PlayerStats, position: Position, expected: number) {
  const r = explainRating(stats, position);
  const pass = Math.abs(r.rating - expected) < 0.01;
  console.log('');
  console.log(`=== ${name} (${position}) ===`);
  console.log(`  rating: ${r.rating}  (expected ${expected})  display: ${displayRating(r.rating)}  ${pass ? 'PASS' : 'FAIL'}`);
  console.log(`  base:   ${r.base}`);
  console.log(`  delta:  ${r.delta}  (minutesFactor ${r.minutesFactor})`);
  console.log('  breakdown:');
  for (const line of r.lines) {
    const sign = line.delta >= 0 ? '+' : '';
    console.log(`    ${sign}${line.delta.toFixed(2)}  ${line.label}`);
  }
  return pass;
}

const ok1 = runCase('Case 1 Forward', fwd, 'FWD', 8.86);
const ok2 = runCase('Case 2 Defender', def, 'DEF', 7.94);

console.log('');
console.log(ok1 && ok2 ? 'ALL PASS' : 'FAILURES');
process.exit(ok1 && ok2 ? 0 : 1);
