// scripts/enumerate-leagues-via-events.mjs
// Bzzoiro /leagues/ caps at 50. /events/ rows carry league_id + league_name,
// so sweep a wide window and collect the actual universe of leagues.

import fs from 'node:fs';
import path from 'node:path';

function loadEnv() {
  const p = path.join(process.cwd(), '.env.local');
  const env = {};
  if (!fs.existsSync(p)) return env;
  for (const raw of fs.readFileSync(p, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[m[1]] = v;
  }
  return env;
}

const ENV = loadEnv();
const KEY = ENV.BZZOIRO_API_KEY;
if (!KEY) { console.error('Missing BZZOIRO_API_KEY'); process.exit(1); }
const BASE = 'https://sports.bzzoiro.com/api/v2';

async function bz(p) {
  const res = await fetch(BASE + p, { headers: { Authorization: 'Token ' + KEY } });
  if (!res.ok) return { status: res.status, body: null };
  return { status: res.status, body: await res.json() };
}

// Pull every page of a date-range query
async function sweepRange(from, to) {
  const all = [];
  for (let page = 1; page <= 40; page++) {
    const r = await bz(`/events/?date_from=${from}&date_to=${to}&page=${page}`);
    const res = r.body?.results;
    if (!res || res.length === 0) break;
    all.push(...res);
    if (all.length >= (r.body?.count ?? 0)) break;
    if (res.length < 50) break;
  }
  return all;
}

(async () => {
  console.log('Sweeping /events/ for league_id → league_name pairs...\n');

  // Wide sweep: 30 days back, 30 days forward
  const now = new Date();
  const from = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);
  const to   = new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10);
  console.log(`  window: ${from} → ${to}`);

  const events = await sweepRange(from, to);
  console.log(`  total events: ${events.length}`);

  // Collect league_id → Set of names
  const leagueMap = new Map();
  for (const e of events) {
    if (!e || e.league_id == null) continue;
    const id = e.league_id;
    const name = e.league_name || '(no name)';
    if (!leagueMap.has(id)) leagueMap.set(id, new Map());
    const names = leagueMap.get(id);
    names.set(name, (names.get(name) || 0) + 1);
  }

  console.log(`  unique leagues seen: ${leagueMap.size}\n`);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Every league_id seen in the sweep (sorted by id)');
  console.log('═══════════════════════════════════════════════════════════════');
  const sorted = [...leagueMap.entries()].sort((a, b) => a[0] - b[0]);
  for (const [id, names] of sorted) {
    // Pick the most common name for this id
    const top = [...names.entries()].sort((a, b) => b[1] - a[1])[0];
    const extras = names.size > 1 ? `  (+${names.size - 1} alt)` : '';
    console.log(`  [${String(id).padStart(4)}] ${top[0]}  (${top[1]} events)${extras}`);
  }

  // Focus: our MAJOR_LEAGUES IDs — are they present?
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  Verification of MAJOR_LEAGUES IDs');
  console.log('═══════════════════════════════════════════════════════════════');
  const expected = [
    [1, 'Premier League'], [2, 'Primeira Liga'], [3, 'La Liga'],
    [4, 'Serie A'], [5, 'Bundesliga'], [6, 'Ligue 1'],
    [7, 'Champions League'], [8, 'Europa League'],
    [9, 'Brasileirão Serie A'], [10, 'Eredivisie'], [11, 'Süper Lig'],
    [12, 'Championship'], [13, 'Scottish Premiership'], [14, 'Pro League'],
    [15, 'Super League'], [17, 'Saudi Pro League'], [18, 'MLS'],
    [19, 'Liga MX'], [20, 'Liga MX'], [23, 'Superliga'], [24, 'Super League'],
    [25, 'Ekstraklasa'], [26, 'Allsvenskan'], [27, 'World Cup 2026'],
    [30, 'Africa Cup of Nations'], [31, 'International Friendlies'],
    [32, 'Copa Libertadores'], [33, 'Copa Sudamericana'],
    [34, 'Brasileirão Serie B'], [39, 'FA Cup'], [40, 'Carabao Cup'],
    [41, 'Copa del Rey'], [42, 'Coppa Italia'], [43, 'DFB Pokal'],
    [44, 'Coupe de France'], [46, 'Puchar Polski'], [49, 'J1 League'],
    [50, 'K League 1'], [54, 'Eliteserien'], [58, 'WC Qualifiers · UEFA'],
    [59, 'WC Qualifiers · CONMEBOL'], [60, 'WC Qualifiers · CAF'],
    [61, 'WC Qualifiers · AFC'], [62, 'WC Qualifiers · CONCACAF'],
    [63, 'WC Qualifiers · OFC'], [64, 'UEFA Nations League'],
    [65, 'CONCACAF Nations League'], [66, 'UEFA Euro 2024'],
    [67, 'Copa América'], [68, 'AFC Asian Cup'], [69, 'CONCACAF Gold Cup'],
    [83, 'Conference League'], [84, 'Danish Superliga'],
    [85, 'Liga Profesional de Fútbol'], [86, 'League One'], [87, 'League Two'],
    [89, 'Ligue 2'], [90, 'UEFA Super Cup'], [94, '2. Bundesliga'],
    [96, 'Austrian Bundesliga'], [99, 'Czech First League'], [136, 'Serie B'],
  ];
  for (const [id, name] of expected) {
    const hit = leagueMap.get(id);
    if (!hit) {
      console.log(`  [MISSING] id=${String(id).padStart(4)}  "${name}"`);
    } else {
      const top = [...hit.entries()].sort((a, b) => b[1] - a[1])[0][0];
      const same = top === name;
      console.log(`  [${same ? 'OK' : 'DIFF'}] id=${String(id).padStart(4)}  ${same ? '' : `expected="${name}"  actual=`}"${top}"`);
    }
  }

  // Any ID we've never seen in our config?
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  Leagues in /events/ NOT in our MAJOR_LEAGUES list');
  console.log('═══════════════════════════════════════════════════════════════');
  const known = new Set(expected.map((e) => e[0]));
  for (const [id, names] of sorted) {
    if (known.has(id)) continue;
    const top = [...names.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top[1] >= 3) {
      console.log(`  [${String(id).padStart(4)}] ${top[0]}  (${top[1]} events)`);
    }
  }
})().catch((e) => { console.error('FATAL:', e); process.exit(1); });
