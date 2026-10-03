// scripts/sync-league-names.mjs
// Syncs MAJOR_LEAGUES ids AND names to Bzzoiro exactly, using fuzzy match.
// Patching names matters: TOP_LEAGUES in FootballList compares by exact string.

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

function norm(s) {
  return (s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+\d{4}$/, '')
    .replace(/[^a-z0-9]/g, '');
}

async function fetchAll() {
  const all = [];
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`https://sports.bzzoiro.com/api/v2/leagues/?page=${page}`, {
      headers: { Authorization: 'Token ' + KEY },
    });
    if (!res.ok) break;
    const data = await res.json();
    if (!data?.results?.length) break;
    all.push(...data.results);
    if (all.length >= (data.count ?? 0)) break;
  }
  return all;
}

(async () => {
  const bz = await fetchAll();
  console.log(`Fetched ${bz.length} Bzzoiro leagues.\n`);

  // Multiple lookup strategies for robustness
  const byId = new Map(bz.map((l) => [l.id, l]));
  const byNorm = new Map();
  for (const l of bz) {
    const k = norm(l.name);
    if (!byNorm.has(k)) byNorm.set(k, []);
    byNorm.get(k).push(l);
  }

  const TS = 'lib/sources/leagues.ts';
  const src = fs.readFileSync(TS, 'utf8');
  const lines = src.split('\n');
  const re = /^(\s*\{\s*id:\s*)(\d+)(\s*,\s*name:\s*'([^']+)')(.*)$/;

  const idFixes = [];
  const nameFixes = [];
  const noMatch = [];
  const out = [];

  for (const line of lines) {
    const m = re.exec(line);
    if (!m) { out.push(line); continue; }
    const pre = m[1], oldId = Number(m[2]), mid = m[3], ourName = m[4], rest = m[5];

    // Strategy 1: ID lookup — if Bzzoiro's entry at our ID is a name-match, use it.
    // Strategy 2: name lookup — if some Bzzoiro entry matches our name, use that.
    let hit = null;

    const atId = byId.get(oldId);
    if (atId && norm(atId.name) === norm(ourName)) {
      hit = atId;
    } else {
      const cands = byNorm.get(norm(ourName)) || [];
      if (cands.length === 1) hit = cands[0];
      else if (cands.length > 1) {
        // Prefer one whose id matches ours
        hit = cands.find((c) => c.id === oldId) || cands[0];
      }
    }

    if (!hit) { noMatch.push({ oldId, name: ourName }); out.push(line); continue; }

    const newId = hit.id;
    const newName = hit.name;

    // Rebuild the line preserving id/name/rest
    let rebuilt = pre + String(newId) + mid + rest;
    if (newName !== ourName) {
      rebuilt = pre + String(newId) + mid.replace("'" + ourName + "'", "'" + newName + "'") + rest;
      // simpler: rebuild explicitly
      rebuilt = pre + String(newId) + ", name: '" + newName + "'" + rest;
      nameFixes.push({ oldId, ourName, newId, bzName: newName });
    }
    if (newId !== oldId) idFixes.push({ name: ourName, oldId, newId });
    out.push(rebuilt);
  }

  if (idFixes.length || nameFixes.length) {
    fs.writeFileSync(TS, out.join('\n'), 'utf8');
    if (idFixes.length) {
      console.log(`═══ ID fixes (${idFixes.length}) ═══`);
      for (const c of idFixes) console.log(`  ${c.name}: id ${c.oldId} → ${c.newId}`);
    }
    if (nameFixes.length) {
      console.log(`\n═══ NAME fixes (${nameFixes.length}) ═══`);
      for (const c of nameFixes) {
        console.log(`  id=${c.newId}  "${c.ourName}"  →  "${c.bzName}"`);
      }
    }
  } else {
    console.log('· No changes needed.');
  }

  if (noMatch.length) {
    console.log(`\n═══ NO BZZOIRO MATCH (${noMatch.length}) — left alone ═══`);
    for (const n of noMatch) console.log(`  id=${n.oldId}  "${n.name}"`);
  }
})().catch((e) => { console.error('FATAL:', e); process.exit(1); });
