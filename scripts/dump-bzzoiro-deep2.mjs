// scripts/dump-bzzoiro-deep2.mjs
// Deep dumps of stats / lineups / prediction from a TOP-LEAGUE fixture.
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

  // Step 1: find a top-league fixture (Premier League = 4?? let's list leagues and find one)
  console.log('=== 1. finding top leagues ===');
  const leagues = await get('/leagues/');
  const leagueList = leagues.results ?? leagues.events ?? leagues;
  const top = Array.isArray(leagueList) ? leagueList.filter(l =>
    /Premier League|La Liga|Serie A|Bundesliga|Ligue 1|Champions League/i.test(l.name)
  ) : [];
  console.log('  top leagues:', top.map(l => `${l.id}:${l.name}`).join(' | ') || '(none matched)');
  dump.leaguesTop = top;

  // Take Premier League (first match)
  const pl = top[0];
  if (!pl) {
    console.log('  no top league found; falling back to any league with events');
  }
  const leagueId = pl?.id;

  // Step 2: fixtures from that league
  console.log('');
  console.log(`=== 2. fixtures for league ${leagueId} (${pl?.name}) ===`);
  const now = new Date();
  const from = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString().slice(0,10);
  const to = new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString().slice(0,10);
  const fixtures = await get(`/events/?date_from=${from}&date_to=${to}${leagueId ? `&league=${leagueId}` : ''}`);
  const fList = fixtures.results ?? fixtures.events ?? fixtures;
  console.log(`  fixtures count: ${Array.isArray(fList) ? fList.length : 'n/a'}`);
  if (Array.isArray(fList) && fList[0]) {
    console.log(`  sample fixture keys: ${Object.keys(fList[0]).join(', ')}`);
  }

  // Pick a finished fixture so all stats are available
  const finished = Array.isArray(fList) ? fList.filter(f => f.status === 'finished') : [];
  const target = finished[0] ?? fList?.[0];
  console.log(`  target: ${target?.id} (${target?.home_team} vs ${target?.away_team}, status=${target?.status})`);
  dump.targetFixture = target;
  console.log('');

  if (target) {
    // ---- 3. Full stats ----
    console.log(`=== 3. /events/${target.id}/stats/ ===`);
    try {
      const stats = await get(`/events/${target.id}/stats/`);
      dump.statsFull = stats;
      console.log('  top-level keys:', Object.keys(stats).join(', '));
      console.log('  xg_estimated:', stats.xg_estimated);
      console.log('  xg_per_minute type:', Array.isArray(stats.xg_per_minute) ? `array[${stats.xg_per_minute.length}]` : typeof stats.xg_per_minute);
      console.log('  shotmap type:', Array.isArray(stats.shotmap) ? `array[${stats.shotmap.length}]` : typeof stats.shotmap);
      if (Array.isArray(stats.shotmap) && stats.shotmap[0]) {
        console.log('  shotmap[0]:', JSON.stringify(stats.shotmap[0]));
      }
      console.log('  momentum type:', Array.isArray(stats.momentum) ? `array[${stats.momentum.length}]` : typeof stats.momentum);
      if (Array.isArray(stats.momentum) && stats.momentum[0]) {
        console.log('  momentum[0]:', JSON.stringify(stats.momentum[0]));
      }
      console.log('  average_positions keys:', stats.average_positions ? Object.keys(stats.average_positions).join(', ') : 'null');
      console.log('  --- stats.stats keys and values (this is the key thing) ---');
      if (stats.stats && typeof stats.stats === 'object') {
        console.log(JSON.stringify(stats.stats, null, 2));
      }
    } catch (e) { console.log('  FAIL:', e.message); }
    console.log('');

    // ---- 4. Full lineups ----
    console.log(`=== 4. /events/${target.id}/lineups/ ===`);
    try {
      const lineups = await get(`/events/${target.id}/lineups/`);
      dump.lineupsFull = lineups;
      console.log('  top-level keys:', Object.keys(lineups).join(', '));
      console.log('  lineup_status:', lineups.lineup_status);
      console.log('  lineups type:', Array.isArray(lineups.lineups) ? `array[${lineups.lineups.length}]` : typeof lineups.lineups);
      if (lineups.lineups && typeof lineups.lineups === 'object') {
        const lKeys = Object.keys(lineups.lineups);
        console.log('  lineups keys:', lKeys.join(', '));
        const firstTeam = lineups.lineups[lKeys[0]];
        console.log(`  lineups["${lKeys[0]}"] type:`, Array.isArray(firstTeam) ? `array[${firstTeam.length}]` : typeof firstTeam);
        if (Array.isArray(firstTeam) && firstTeam[0]) {
          console.log('  first team first player:', JSON.stringify(firstTeam[0], null, 2));
        } else if (typeof firstTeam === 'object' && firstTeam !== null) {
          console.log('  first team keys:', Object.keys(firstTeam).join(', '));
          console.log('  first team preview:', JSON.stringify(firstTeam, null, 2).slice(0, 600));
        }
      }
    } catch (e) { console.log('  FAIL:', e.message); }
    console.log('');

    // ---- 5. Prediction ----
    console.log(`=== 5. /events/${target.id}/prediction/ ===`);
    try {
      const pred = await get(`/events/${target.id}/prediction/`);
      dump.predictionFull = pred;
      console.log('  keys:', Object.keys(pred).join(', '));
      console.log('  FULL:', JSON.stringify(pred, null, 2).slice(0, 800));
    } catch (e) { console.log('  FAIL:', e.message); }
    console.log('');
  }

  // ---- 6. Player search (exact name) ----
  console.log('=== 6. /players/?name=Lionel+Messi ===');
  try {
    const players = await get('/players/?name=Lionel+Messi');
    const p = (players.results ?? []).find(x => /lionel/i.test(x.name)) ?? players.results?.[0];
    if (p) {
      dump.playerFull = p;
      console.log(JSON.stringify(p, null, 2));
    } else {
      console.log('  none');
    }
  } catch (e) { console.log('  FAIL:', e.message); }

  fs.writeFileSync('scripts/dump-bzzoiro-deep2.json', JSON.stringify(dump, null, 2));
  console.log('');
  console.log('Wrote scripts/dump-bzzoiro-deep2.json');
})().catch(e => { console.error(e); process.exit(1); });
