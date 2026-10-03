// scripts/sync-league-ids.mjs
// One-shot: fetch all Bzzoiro leagues, sync MAJOR_LEAGUES IDs by name.
// Usage: node scripts/sync-league-ids.mjs

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

async function fetchAll() {
  const all = [];
  for (let page = 1; page <= 5; page++) {
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

function normName(s) {
  return (s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+\d{4}$/, '')
    .replace(/[^a-z0-9]/g, '');
}

(async () => {
  const bz = await fetchAll();
  console.log(`Fetched ${bz.length} Bzzoiro leagues.\n`);

  console.log('═══════════ Bzzoiro leagues, sorted by id ═══════════');
  for (const l of [...bz].sort((a, b) => a.id - b.id)) {
    console.log(`  [${String(l.id).padStart(3)}] ${l.name}  (${l.country})`);
  }

  // Build normalized-name → [leagues]
  const byName = new Map();
  for (const l of bz) {
    const k = normName(l.name);
    if (!byName.has(k)) byName.set(k, []);
    byName.get(k).push(l);
  }

  const TS_PATH = 'lib/sources/leagues.ts';
  const src = fs.readFileSync(TS_PATH, 'utf8');
  const lines = src.split('\n');

  // Preserves everything except the numeric ID.
  const re = /^(\s*\{\s*id:\s*)(\d+)(\s*,\s*name:\s*'([^']+)')(.*)$/;

  const patched = [];
  const unchanged = [];
  const notFound = [];
  const ambiguous = [];
  const out = [];

  for (const line of lines) {
    const m = re.exec(line);
    if (!m) { out.push(line); continue; }

    const pre = m[1], oldId = Number(m[2]), mid = m[3], ourName = m[4], rest = m[5];
    const candidates = byName.get(normName(ourName)) || [];

    if (candidates.length === 0) {
      notFound.push({ oldId, name: ourName });
      out.push(line);
      continue;
    }
    if (candidates.length > 1) {
      ambiguous.push({ oldId, name: ourName, options: candidates.map((c) => `${c.id}(${c.country})`) });
      out.push(line);
      continue;
    }

    const hit = candidates[0];
    if (hit.id === oldId) {
      unchanged.push({ id: hit.id, name: ourName });
      out.push(line);
    } else {
      patched.push({ name: ourName, oldId, newId: hit.id, bzName: hit.name });
      out.push(pre + String(hit.id) + mid + rest);
    }
  }

  if (patched.length > 0) {
    fs.writeFileSync(TS_PATH, out.join('\n'), 'utf8');
    console.log(`\n═══════════ PATCHED (${patched.length}) ═══════════`);
    for (const p of patched) {
      console.log(`  ${p.name}: id ${p.oldId} → ${p.newId}   (Bzzoiro: "${p.bzName}")`);
    }
  } else {
    console.log(`\n· No ID changes needed.`);
  }

  console.log(`\n═══════════ UNCHANGED (${unchanged.length}) ═══════════`);
  for (const u of unchanged) {
    console.log(`  [${u.id}] ${u.name}`);
  }

  if (notFound.length) {
    console.log(`\n═══════════ NOT FOUND in Bzzoiro (${notFound.length}) ═══════════`);
    for (const n of notFound) {
      console.log(`  id=${n.oldId}  "${n.name}"`);
    }
  }
  if (ambiguous.length) {
    console.log(`\n═══════════ AMBIGUOUS — multiple Bzzoiro matches (${ambiguous.length}) ═══════════`);
    for (const a of ambiguous) {
      console.log(`  "${a.name}" (id ${a.oldId}) → options: ${a.options.join(', ')}`);
    }
  }
})().catch((e) => { console.error('FATAL:', e); process.exit(1); });
