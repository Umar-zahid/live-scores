// scripts/dump-bzzoiro-final.mjs — closes the last two gaps.
import fs from 'node:fs';

const KEY = process.env.BZZOIRO_API_KEY;
if (!KEY) { console.error('Missing BZZOIRO_API_KEY'); process.exit(1); }
const BASE = 'https://sports.bzzoiro.com/api/v2';
const headers = { Authorization: `Token ${KEY}` };

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${path} — ${(await res.text()).slice(0,150)}`);
  return res.json();
}

(async () => {
  const dump = {};

  // ---- 1. Lineups for event 605099 (known: lineup_status=confirmed) ----
  console.log('=== 1. lineups for event 605099 (confirmed) ===');
  try {
    const lu = await get('/events/605099/lineups/');
    dump.lineupsConfirmed = lu;
    console.log('  lineup_status:', lu.lineup_status);
    console.log('  lineups top keys:', Object.keys(lu.lineups ?? {}).join(', '));
    const homeSide = lu.lineups?.home ?? lu.lineups?.home_team;
    const awaySide = lu.lineups?.away ?? lu.lineups?.away_team;
    console.log('  home side type:', Array.isArray(homeSide) ? `array[${homeSide.length}]` : typeof homeSide);
    if (Array.isArray(homeSide) && homeSide[0]) {
      console.log('  home[0] keys:', Object.keys(homeSide[0]).join(', '));
      console.log('  home[0] full:', JSON.stringify(homeSide[0], null, 2));
    } else if (homeSide && typeof homeSide === 'object') {
      console.log('  home side keys:', Object.keys(homeSide).join(', '));
      console.log('  home side preview:', JSON.stringify(homeSide, null, 2).slice(0, 800));
    }
    console.log('  unavailable_players type:', Array.isArray(lu.unavailable_players) ? `array[${lu.unavailable_players.length}]` : typeof lu.unavailable_players);
  } catch (e) { console.log('  FAIL:', e.message); }
  console.log('');

  // ---- 2. Premier League finished fixtures with has_xg ----
  console.log('=== 2. Premier League fixtures with has_xg ===');
  const now = new Date();
  const from = new Date(now.getTime() - 60 * 24 * 3600 * 1000).toISOString().slice(0,10);
  const to = now.toISOString().slice(0,10);
  const fixtures = await get(`/events/?date_from=${from}&date_to=${to}&league=1`);
  const list = fixtures.results ?? fixtures.events ?? [];
  console.log(`  total PL fixtures in window: ${list.length}`);
  const withXg = list.filter(f => f.has_xg && f.status === 'finished');
  console.log(`  finished with has_xg: ${withXg.length}`);
  const target = withXg[0];
  console.log(`  target: ${target?.id} (${target?.home_team} vs ${target?.away_team})`);
  console.log('');

  if (target) {
    // ---- 3. Real stats for a PL fixture ----
    console.log(`=== 3. /events/${target.id}/stats/ (real PL stats) ===`);
    try {
      const stats = await get(`/events/${target.id}/stats/`);
      dump.statsPL = stats;
      console.log('  xg_estimated:', stats.xg_estimated);
      console.log('  stats.stats:', JSON.stringify(stats.stats, null, 2));
      console.log('  shotmap length:', Array.isArray(stats.shotmap) ? stats.shotmap.length : 'n/a');
      if (Array.isArray(stats.shotmap) && stats.shotmap[0]) {
        console.log('  shotmap[0]:', JSON.stringify(stats.shotmap[0], null, 2));
      }
      console.log('  momentum length:', Array.isArray(stats.momentum) ? stats.momentum.length : 'n/a');
      if (Array.isArray(stats.momentum) && stats.momentum[0]) {
        console.log('  momentum[0]:', JSON.stringify(stats.momentum[0], null, 2));
      }
      console.log('  average_positions:', JSON.stringify(stats.average_positions).slice(0, 400));
      console.log('  xg_per_minute length:', Array.isArray(stats.xg_per_minute) ? stats.xg_per_minute.length : 'n/a');
      if (Array.isArray(stats.xg_per_minute) && stats.xg_per_minute[0]) {
        console.log('  xg_per_minute[0]:', JSON.stringify(stats.xg_per_minute[0]));
      }
    } catch (e) { console.log('  FAIL:', e.message); }
    console.log('');

    // ---- 4. Prediction on a PL fixture ----
    console.log(`=== 4. /events/${target.id}/prediction/ (PL) ===`);
    try {
      const pred = await get(`/events/${target.id}/prediction/`);
      dump.predictionPL = pred;
      console.log('  keys:', Object.keys(pred).join(', '));
      console.log('  FULL:', JSON.stringify(pred, null, 2));
    } catch (e) { console.log('  FAIL:', e.message); }
  }

  fs.writeFileSync('scripts/dump-bzzoiro-final.json', JSON.stringify(dump, null, 2));
  console.log('');
  console.log('Wrote scripts/dump-bzzoiro-final.json');
})().catch(e => { console.error(e); process.exit(1); });
