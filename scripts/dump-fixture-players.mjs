// scripts/dump-fixture-players.mjs
// Dumps /fixtures/players raw JSON for a top-5 league fixture.
// Player stats are only available for ~30 top leagues in API-Football.
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.API_FOOTBALL_KEY;
if (!KEY) {
  console.error('Missing API_FOOTBALL_KEY. Run with:');
  console.error('  set -a; source .env.local; set +a; node scripts/dump-fixture-players.mjs');
  process.exit(1);
}

const base = 'https://v3.football.api-sports.io';
const headers = { 'x-apisports-key': KEY };

async function get(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

const LEAGUES = [
  { id: 39,  name: 'Premier League' },
  { id: 140, name: 'La Liga' },
  { id: 135, name: 'Serie A' },
  { id: 78,  name: 'Bundesliga' },
  { id: 61,  name: 'Ligue 1' },
];
const SEASON = 2023; // free tier covers 2021-2023 for player stats

(async () => {
  let picked = null;
  let pickedLeague = null;

  for (const lg of LEAGUES) {
    console.log(`Trying ${lg.name} (id ${lg.id}) season ${SEASON}...`);
    const url = `${base}/fixtures?league=${lg.id}&season=${SEASON}&from=2023-08-01&to=2023-12-31`;
    const data = await get(url);
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.log('  errors:', JSON.stringify(data.errors));
      continue;
    }
    const finished = (data.response || []).filter(
      (f) => f.fixture?.status?.short === 'FT'
    );
    if (finished.length > 0) {
      picked = finished[0];
      pickedLeague = lg;
      console.log(`  picked fixture ${picked.fixture.id}: ${picked.teams.home.name} ${picked.goals.home}-${picked.goals.away} ${picked.teams.away.name}`);
      break;
    }
    console.log('  no finished fixtures in window');
  }

  if (!picked) {
    console.error('No usable fixture found in any top league.');
    process.exit(1);
  }

  console.log(`Fetching /fixtures/players for fixture ${picked.fixture.id}...`);
  const players = await get(`${base}/fixtures/players?fixture=${picked.fixture.id}`);

  const out = {
    fixtureId: picked.fixture.id,
    fixtureLabel: `${picked.teams.home.name} ${picked.goals.home}-${picked.goals.away} ${picked.teams.away.name}`,
    league: pickedLeague.name,
    season: SEASON,
    rawErrors: players.errors,
    rawResults: players.results,
    rawResponse: players.response,
  };

  const outPath = path.join('scripts', 'dump-fixture-players.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`Wrote ${outPath}`);
  console.log(`Errors: ${JSON.stringify(players.errors)}`);
  console.log(`Results: ${players.results}`);
  console.log(`Teams in response: ${players.response?.length ?? 0}`);
  if (players.response?.[0]) {
    const team0 = players.response[0];
    console.log(`Team 0: ${team0.team?.name} — ${team0.players?.length ?? 0} players`);
    if (team0.players?.[0]) {
      const p0 = team0.players[0];
      console.log('Player keys:', Object.keys(p0).join(', '));
      console.log('Statistics[0] keys:', Object.keys(p0.statistics?.[0] ?? {}).join(', '));
      console.log('Sample games:', JSON.stringify(p0.statistics?.[0]?.games));
      console.log('Sample goals:', JSON.stringify(p0.statistics?.[0]?.goals));
    }
  }
})().catch((e) => { console.error(e); process.exit(1); });
