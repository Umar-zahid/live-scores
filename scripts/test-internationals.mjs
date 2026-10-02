// scripts/test-internationals.mjs
// Tests whether API-Football's free tier returns /fixtures/players
// data for international competitions.
import fs from 'node:fs';

const KEY = process.env.API_FOOTBALL_KEY;
if (!KEY) {
  console.error('Missing API_FOOTBALL_KEY. Run with:');
  console.error('  set -a; source .env.local; set +a; node scripts/test-internationals.mjs');
  process.exit(1);
}

const base = 'https://v3.football.api-sports.io';
const headers = { 'x-apisports-key': KEY };

async function get(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

const TARGETS = [
  { league: 5,  season: 2022, name: 'UEFA Nations League 2022/23' },
  { league: 32, season: 2021, name: 'WC Qualifiers - Europe 2021' },
  { league: 34, season: 2021, name: 'WC Qualifiers - South America 2021' },
  { league: 9,  season: 2021, name: 'Copa America 2021' },
  { league: 4,  season: 2021, name: 'Euro 2020 (played 2021)' },
];

(async () => {
  const summary = [];
  for (const t of TARGETS) {
    console.log('');
    console.log('===========================================');
    console.log(`${t.name}  (league=${t.league}, season=${t.season})`);
    console.log('===========================================');

    let fixture = null;
    try {
      const data = await get(`${base}/fixtures?league=${t.league}&season=${t.season}`);
      if (data.errors && Object.keys(data.errors).length > 0) {
        console.log(`  /fixtures errors: ${JSON.stringify(data.errors)}`);
        summary.push({ name: t.name, status: 'fixtures-error', detail: JSON.stringify(data.errors) });
        continue;
      }
      const finished = (data.response || []).filter(
        (f) => f.fixture?.status?.short === 'FT'
      );
      if (finished.length === 0) {
        console.log(`  no finished fixtures (got ${data.response?.length ?? 0} total)`);
        summary.push({ name: t.name, status: 'no-fixtures' });
        continue;
      }
      fixture = finished[0];
      console.log(`  picked fixture ${fixture.fixture.id}: ${fixture.teams.home.name} ${fixture.goals.home}-${fixture.goals.away} ${fixture.teams.away.name}`);
    } catch (err) {
      console.log(`  /fixtures fetch error: ${err.message}`);
      summary.push({ name: t.name, status: 'fetch-error', detail: err.message });
      continue;
    }

    try {
      const players = await get(`${base}/fixtures/players?fixture=${fixture.fixture.id}`);
      const errs = players.errors ? JSON.stringify(players.errors) : '[]';
      const teamCount = players.response?.length ?? 0;
      const playerCount = (players.response || []).reduce(
        (sum, block) => sum + (block.players?.length ?? 0), 0
      );
      console.log(`  /fixtures/players errors: ${errs}`);
      console.log(`  teams: ${teamCount}, players: ${playerCount}`);
      if (teamCount > 0 && players.response?.[0]?.players?.[0]) {
        const sample = players.response[0].players[0];
        const stats = sample.statistics?.[0] ?? {};
        console.log(`  sample: ${sample.player?.name} - position ${stats.games?.position}, minutes ${stats.games?.minutes}, goals ${stats.goals?.total}`);
      }
      summary.push({
        name: t.name,
        status: teamCount > 0 ? 'OK' : 'empty',
        teams: teamCount,
        players: playerCount,
        errors: errs,
      });
    } catch (err) {
      console.log(`  /fixtures/players fetch error: ${err.message}`);
      summary.push({ name: t.name, status: 'fetch-error', detail: err.message });
    }
  }

  console.log('');
  console.log('===========================================');
  console.log('SUMMARY');
  console.log('===========================================');
  for (const s of summary) {
    const counts = s.teams !== undefined ? ` (teams=${s.teams}, players=${s.players})` : '';
    const detail = s.detail ? ` - ${s.detail}` : '';
    console.log(`  ${s.name}: ${s.status}${counts}${detail}`);
  }

  fs.writeFileSync('scripts/dump-internationals.json', JSON.stringify(summary, null, 2));
  console.log('');
  console.log('Wrote scripts/dump-internationals.json');
})().catch((e) => { console.error(e); process.exit(1); });
