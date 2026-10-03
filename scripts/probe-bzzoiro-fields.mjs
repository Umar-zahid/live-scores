// scripts/probe-bzzoiro-fields.mjs
// Answers the open questions from the reviewer — no code changes.
// Run: node scripts/probe-bzzoiro-fields.mjs

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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[m[1]] = v;
  }
  return env;
}

const ENV = loadEnv();
const BZ_KEY = ENV.BZZOIRO_API_KEY;
const AF_KEY = ENV.API_FOOTBALL_KEY;
const BZ = 'https://sports.bzzoiro.com/api/v2';
const AF = 'https://v3.football.api-sports.io';

function hr(label) {
  const pad = Math.max(0, 60 - label.length);
  console.log('\n─── ' + label + ' ' + '─'.repeat(pad));
}

async function bzJson(pathname) {
  try {
    const res = await fetch(BZ + pathname, {
      headers: { Authorization: 'Token ' + BZ_KEY },
    });
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text.slice(0, 300); }
    return { status: res.status, ok: res.ok, body };
  } catch (e) { return { error: String(e) }; }
}

async function afJson(pathname) {
  if (!AF_KEY) return { error: 'no API_FOOTBALL_KEY' };
  try {
    const res = await fetch(AF + pathname, {
      headers: { 'x-apisports-key': AF_KEY },
    });
    const body = await res.json();
    return { status: res.status, ok: res.ok, body };
  } catch (e) { return { error: String(e) }; }
}

(async () => {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  LIVESCOREHUB — PROBE: Bzzoiro + API-Football field shapes');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  BZZOIRO key:', BZ_KEY ? 'present' : 'MISSING');
  console.log('  API_FOOTBALL key:', AF_KEY ? 'present' : 'MISSING');

  // ── Q9. Bzzoiro /leagues/ ────────────────────────────────────
  hr('Q9. /leagues/ names + count');
  const L = await bzJson('/leagues/');
  if (L.body?.results) {
    const arr = L.body.results;
    console.log(`  count: ${L.body.count} / returned: ${arr.length}`);
    console.log('  sample (first 15):');
    for (const l of arr.slice(0, 15)) {
      console.log(`    [${l.id}] "${l.name}" (${l.country})`);
    }
    const superLig = arr.find((l) => /per lig/i.test(l.name || ''));
    console.log('  Süper Lig style:', superLig ? `"${superLig.name}" (id ${superLig.id})` : '(none)');
    const ligaMx = arr.filter((l) => l.name === 'Liga MX');
    console.log('  exact "Liga MX" entries:', ligaMx.map((l) => `${l.id}/${l.country}`));
  } else {
    console.log('  ✗', L.status, L.body?.slice?.(0, 200));
  }

  // ── Q1 + Q2. /events/?league= pagination + date format ───────
  hr('Q1 + Q2. /events/ shape, pagination, date format');
  const now = new Date();
  const from = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const to = new Date(now.getTime() + 3 * 86400000).toISOString().slice(0, 10);
  const E = await bzJson(`/events/?date_from=${from}&date_to=${to}`);
  let finishedId = null;
  if (E.body?.results) {
    console.log(`  range: ${from} → ${to} (all leagues)`);
    console.log(`  count: ${E.body.count}, results: ${E.body.results.length}`);
    console.log('  pagination:', E.body.count === E.body.results.length
      ? 'no (single response covers all)'
      : 'LIKELY (count > results length)');
    for (const e of E.body.results.slice(0, 3)) {
      console.log(`    id=${e.id} event_date="${e.event_date}" status="${e.status}" period="${e.period}" min=${e.current_minute}`);
    }
    const first = E.body.results[0]?.event_date;
    if (first) {
      const hasOffset = /[+-]\d{2}:?\d{2}$/.test(first) || first.endsWith('Z');
      console.log(`  timezone marker on "${first}":`, hasOffset ? 'YES' : 'NO — parsed as local time');
    }
    finishedId = E.body.results.find((e) => e.status === 'finished')?.id ?? null;
  } else {
    console.log('  ✗', E.status, E.body?.slice?.(0, 200));
  }

  // Try a busy league for pagination pressure
  const E2 = await bzJson(`/events/?date_from=${from}&date_to=${to}&league=31`);
  if (E2.body?.results) {
    console.log(`  (league=31 friendlies) count=${E2.body.count}, returned=${E2.body.results.length}`);
  }

  // ── Q3 + Q6 + Q5. stats xG key, lineup position enum, own-goal ─
  hr('Q3 + Q6. Inspect a finished Bzzoiro match');
  if (!finishedId) {
    const lv = await bzJson('/events/live/');
    finishedId = lv.body?.events?.[0]?.id ?? null;
  }
  console.log('  probing event id:', finishedId ?? '(none)');

  if (finishedId) {
    const ST = await bzJson(`/events/${finishedId}/stats/`);
    if (ST.body?.stats?.home) {
      const keys = Object.keys(ST.body.stats.home);
      console.log('  stats.home keys:', keys.join(', '));
      console.log('  stats.home.xg                =', JSON.stringify(ST.body.stats.home.xg));
      console.log('  stats.home.expected_goals    =', JSON.stringify(ST.body.stats.home.expected_goals));
      console.log('  stats.home.xG                =', JSON.stringify(ST.body.stats.home.xG));
      console.log('  → xG location:',
        ST.body.stats.home.xg ? 'stats.home.xg'
        : ST.body.stats.home.expected_goals ? 'stats.home.expected_goals'
        : 'UNKNOWN');
    } else {
      console.log('  ✗ stats:', ST.status, ST.body?.slice?.(0, 200));
    }

    const LU = await bzJson(`/events/${finishedId}/lineups/`);
    if (LU.body?.lineups?.home?.players?.length) {
      const positions = [...new Set(LU.body.lineups.home.players.map((p) => p.position))];
      console.log('  lineup position enum:', positions);
      console.log('  sample player:', JSON.stringify(LU.body.lineups.home.players[0]));
    } else {
      console.log('  ✗ lineups:', LU.status, LU.body?.slice?.(0, 200));
    }

    const INC = await bzJson(`/events/${finishedId}/incidents/`);
    if (INC.body?.incidents) {
      const goals = INC.body.incidents.filter((i) => i.type === 'goal');
      const cards = INC.body.incidents.filter((i) => i.type === 'card');
      console.log(`  incidents: ${INC.body.incidents.length} (goals ${goals.length}, cards ${cards.length})`);
      if (goals[0]) {
        console.log('  first goal:', JSON.stringify(goals[0]));
        console.log('  all goal_type values:', [...new Set(goals.map((g) => g.goal_type))]);
      }
      if (cards[0]) {
        console.log('  first card:', JSON.stringify(cards[0]));
        console.log('  all card_type values:', [...new Set(cards.map((c) => c.card_type))]);
      }
    } else {
      console.log('  ✗ incidents:', INC.status, INC.body?.slice?.(0, 200));
    }

    const PR = await bzJson(`/events/${finishedId}/prediction/`);
    if (PR.body?.markets?.match_result) {
      const mr = PR.body.markets.match_result;
      console.log('  prediction match_result:', JSON.stringify(mr));
      console.log('  prediction model:', JSON.stringify(PR.body.model));
      const scale = (mr.prob_home > 1 || mr.prob_draw > 1 || mr.prob_away > 1)
        ? '0-100 (percentages)'
        : '0-1 (probabilities)';
      console.log('  → probability scale:', scale);
    } else {
      console.log('  ✗ prediction:', PR.status, PR.body?.slice?.(0, 200));
    }
  }

  // ── Q7. Do Bzzoiro event IDs and API-Football fixture IDs overlap?
  hr('Q7. Bzzoiro event ID vs API-Football fixture ID overlap');
  if (finishedId && AF_KEY) {
    const afProbe = await afJson(`/fixtures?id=${finishedId}`);
    const hit = afProbe.body?.response?.[0];
    console.log(`  Bzzoiro id=${finishedId} → API-Football /fixtures?id=${finishedId}`);
    if (hit) {
      console.log('  ⚠ OVERLAP — API-Football returned:', hit.fixture.id,
        hit.teams.home.name, 'vs', hit.teams.away.name);
    } else {
      console.log('  ✓ no overlap — 0 results');
    }
    const afLive = await afJson('/fixtures?live=all');
    const afId = afLive.body?.response?.[0]?.fixture?.id;
    if (afId) {
      console.log(`  reverse: API-Football id=${afId} → Bzzoiro /events/${afId}/`);
      const bzProbe = await bzJson(`/events/${afId}/`);
      if (bzProbe.body?.id) {
        console.log('  ⚠ OVERLAP — Bzzoiro returned:', bzProbe.body.home_team, 'vs', bzProbe.body.away_team);
      } else {
        console.log('  ✓ no overlap —', bzProbe.status);
      }
    }
  } else {
    console.log('  skipped');
  }

  // ── Q8. API-Football passes.accuracy ────────────────────────
  hr('Q8. API-Football passes.accuracy shape');
  if (AF_KEY) {
    const afLive = await afJson('/fixtures?live=all');
    const fid = afLive.body?.response?.[0]?.fixture?.id;
    if (fid) {
      const PL = await afJson(`/fixtures/players?fixture=${fid}`);
      const p0 = PL.body?.response?.[0]?.players?.[0];
      const s0 = p0?.statistics?.[0];
      if (s0) {
        console.log('  fixture id:', fid, '| player:', p0.player?.name);
        console.log('  passes:', JSON.stringify(s0.passes));
        console.log('  type of accuracy:', typeof s0.passes?.accuracy);
        console.log('  → interpretation:',
          typeof s0.passes?.accuracy === 'number' && s0.passes.accuracy > 40 ? 'likely % or count ≥40'
          : typeof s0.passes?.accuracy === 'number' && s0.passes.accuracy <= 1 ? 'ratio 0-1'
          : 'see value');
      } else { console.log('  ✗ no player stats'); }
    } else { console.log('  ✗ no live fixtures'); }
  } else {
    console.log('  skipped (no key)');
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  PROBE COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');
})().catch((e) => { console.error('FATAL:', e); process.exit(1); });
