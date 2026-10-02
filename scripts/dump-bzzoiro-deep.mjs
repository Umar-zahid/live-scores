// scripts/dump-bzzoiro-deep.mjs
// Deep dump of nested shapes we need for mappers.
import fs from 'node:fs';

const KEY = process.env.BZZOIRO_API_KEY;
if (!KEY) { console.error('Missing BZZOIRO_API_KEY'); process.exit(1); }
const BASE = 'https://sports.bzzoiro.com/api/v2';
const headers = { Authorization: `Token ${KEY}` };

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

(async () => {
  const dump = {};

  // ---- 1. Live events: what statuses exist? ----
  console.log('=== 1. /events/live/ statuses ===');
  const live = await get('/events/live/');
  const events = live.events ?? [];
  const statusCounts = {};
  const periodCounts = {};
  for (const e of events) {
    statusCounts[e.status] = (statusCounts[e.status] ?? 0) + 1;
    periodCounts[e.period] = (periodCounts[e.period] ?? 0) + 1;
  }
  console.log('  status counts:', JSON.stringify(statusCounts));
  console.log('  period counts:', JSON.stringify(periodCounts));
  dump.liveStatusCounts = statusCounts;
  dump.livePeriodCounts = periodCounts;

  // Pick a real in-progress event if any, else use fixtures by date
  let targetEvent = events.find(e => e.status !== 'finished' && e.status !== 'notstarted');
  if (!targetEvent) {
    console.log('  no in-progress live event; picking any for shape exploration');
    targetEvent = events[0];
  }
  console.log(`  target event: ${targetEvent?.id} (${targetEvent?.home_team} vs ${targetEvent?.away_team}, status=${targetEvent?.status})`);
  console.log('');

  if (targetEvent) {
    // ---- 2. Full stats ----
    console.log(`=== 2. /events/${targetEvent.id}/stats/ ===`);
    const stats = await get(`/events/${targetEvent.id}/stats/`);
    dump.statsFull = stats;
    console.log('  stats keys:', Object.keys(stats).join(', '));
    console.log('  stats.stats type:', Array.isArray(stats.stats) ? `array[${stats.stats.length}]` : typeof stats.stats);
    if (Array.isArray(stats.stats) && stats.stats[0]) {
      console.log('  stats.stats[0]:', JSON.stringify(stats.stats[0], null, 2));
      console.log('  all stat names:', stats.stats.map(s => s.name ?? s.type).join(' | '));
    }
    console.log('  xg_estimated:', JSON.stringify(stats.xg_estimated));
    console.log('  shotmap type:', Array.isArray(stats.shotmap) ? `array[${stats.shotmap.length}]` : typeof stats.shotmap);
    if (Array.isArray(stats.shotmap) && stats.shotmap[0]) {
      console.log('  shotmap[0]:', JSON.stringify(stats.shotmap[0], null, 2));
    }
    console.log('  momentum preview:', JSON.stringify(stats.momentum).slice(0, 200));
    console.log('');

    // ---- 3. Full lineups ----
    console.log(`=== 3. /events/${targetEvent.id}/lineups/ ===`);
    const lineups = await get(`/events/${targetEvent.id}/lineups/`);
    dump.lineupsFull = lineups;
    console.log('  keys:', Object.keys(lineups).join(', '));
    console.log('  lineup_status:', lineups.lineup_status);
    console.log('  lineups type:', Array.isArray(lineups.lineups) ? `array[${lineups.lineups.length}]` : typeof lineups.lineups);
    if (Array.isArray(lineups.lineups) && lineups.lineups[0]) {
      console.log('  lineups[0] keys:', Object.keys(lineups.lineups[0]).join(', '));
      console.log('  lineups[0]:', JSON.stringify(lineups.lineups[0], null, 2).slice(0, 800));
    }
    console.log('');

    // ---- 4. Prediction (may 404) ----
    console.log(`=== 4. /events/${targetEvent.id}/prediction/ ===`);
    try {
      const pred = await get(`/events/${targetEvent.id}/prediction/`);
      dump.predictionFull = pred;
      console.log('  keys:', Object.keys(pred).join(', '));
      console.log('  preview:', JSON.stringify(pred).slice(0, 400));
    } catch (e) {
      console.log('  (no prediction available for this event)');
    }
    console.log('');
  }

  // ---- 5. Player profile (full) ----
  console.log('=== 5. /players/?name=messi (full first result) ===');
  const players = await get('/players/?name=messi');
  const p = players.results?.[0];
  if (p) {
    dump.playerFull = p;
    console.log(JSON.stringify(p, null, 2));
  }
  console.log('');

  // ---- 6. Team profile ----
  console.log('=== 6. /teams/?name=arsenal (full first result) ===');
  const teams = await get('/teams/?name=arsenal');
  const t = teams.results?.[0];
  if (t) {
    dump.teamFull = t;
    console.log(JSON.stringify(t, null, 2));
  }

  fs.writeFileSync('scripts/dump-bzzoiro-deep.json', JSON.stringify(dump, null, 2));
  console.log('');
  console.log('Wrote scripts/dump-bzzoiro-deep.json');
})().catch(e => { console.error(e); process.exit(1); });
