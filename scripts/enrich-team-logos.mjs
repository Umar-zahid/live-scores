// scripts/enrich-team-logos.mjs
// Fetches teams from API-Football for major leagues + cups.
// Writes data/team-logos.json (normalized name -> {name, logo}).
// Free tier: 10 req/min → sleep 6s between requests.
// Idempotent: merges into existing cache.

import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.API_FOOTBALL_KEY;
if (!KEY) { console.error('Missing API_FOOTBALL_KEY'); process.exit(1); }

const BASE = 'https://v3.football.api-sports.io';
const SEASON = new Date().getFullYear();
const OUT = path.join('data', 'team-logos.json');
const SLEEP_MS = 6500; // 10 req/min max → 6s is safe with margin

const LEAGUES = [
  // top-5 (already have, will be merged)
  39, 140, 135, 78, 61,
  88, 94,                    // Eredivisie, Primeira Liga
  40, 79, 136,               // Championship, 2. Bundesliga, Serie B
  // remaining
  62,                        // Ligue 2
  2, 3, 848,                 // UCL, UEL, UECL
  71,                        // Brasileirão
  45, 81, 137, 143, 66,      // FA Cup, DFB Pokal, Coppa Italia, Copa del Rey, Coupe de France
];

// Aggressive but careful normalization.
// Strips accents + club-type words (fc/cf/ac/etc) but KEEPS meaningful tokens
// like "united", "city", "real", "atletico", "sporting".
function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(fc|cf|ac|sc|afc|cp|sv|vfl|vfb|tsv|as|asd|ss|ssc|usl|rc|rcd|sd|fk|bk|sk|if)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'x-apisports-key': KEY } });
  if (res.status === 429) {
    throw new Error(`RATE_LIMIT: ${url}`);
  }
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

(async () => {
  const existing = fs.existsSync(OUT)
    ? JSON.parse(fs.readFileSync(OUT, 'utf8'))
    : {};
  console.log(`${Object.keys(existing).length} entries already in cache`);
  console.log('');

  let okLeagues = 0;
  let failed = [];

  for (const league of LEAGUES) {
    try {
      const data = await fetchJson(`${BASE}/teams?league=${league}&season=${SEASON}`);
      const teams = data.response ?? [];
      let added = 0;
      for (const entry of teams) {
        const t = entry.team;
        if (!t?.name || !t?.logo) continue;
        const key = normalize(t.name);
        if (!key) continue;
        if (!existing[key]) added++;
        existing[key] = { name: t.name, logo: t.logo };
      }
      okLeagues++;
      console.log(`  ✓ league ${league}: ${teams.length} teams (${added} new)`);
    } catch (err) {
      console.error(`  ✗ league ${league}: ${err.message}`);
      failed.push(league);
    }
    await new Promise((r) => setTimeout(r, SLEEP_MS));
  }

  fs.writeFileSync(OUT, JSON.stringify(existing, null, 2));
  console.log('');
  console.log(`Done. ${okLeagues}/${LEAGUES.length} leagues fetched.`);
  console.log(`Total unique in cache: ${Object.keys(existing).length}`);
  if (failed.length) console.log(`Failed leagues: ${failed.join(', ')}`);
})().catch(e => { console.error(e); process.exit(1); });
