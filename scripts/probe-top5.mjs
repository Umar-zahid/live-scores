// scripts/probe-top5.mjs
// Run: node scripts/probe-top5.mjs
// Finds recent top-5 league matches and probes:
//   1. Own-goal goal_type value (need a match with a real own goal)
//   2. Prediction probability scale (0-1 or 0-100)
//   3. passes.accuracy shape (percent, count, or ratio)

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
const BZ = ENV.BZZOIRO_API_KEY;
const AF = ENV.API_FOOTBALL_KEY;
const BZ_BASE = 'https://sports.bzzoiro.com/api/v2';
const AF_BASE = 'https://v3.football.api-sports.io';

const TOP5 = [1, 3, 4, 5, 6]; // PL, La Liga, Serie A, Bundesliga, Ligue 1

function hr(label) {
  const pad = Math.max(0, 60 - label.length);
  console.log('\n--- ' + label + ' ' + '-'.repeat(pad));
}

async function bz(pathname) {
  try {
    const res = await fetch(BZ_BASE + pathname, {
      headers: { Authorization: 'Token ' + BZ },
    });
    const t = await res.text();
    let body;
    try { body = JSON.parse(t); } catch { body = t.slice(0, 200); }
    return { status: res.status, body };
  } catch (e) { return { error: String(e) }; }
}

async function af(pathname) {
  try {
    const res = await fetch(AF_BASE + pathname, {
      headers: { 'x-apisports-key': AF },
    });
    return { status: res.status, body: await res.json() };
  } catch (e) { return { error: String(e) }; }
}

(async () => {
  console.log('===============================================================');
  console.log('  TOP-5 LEAGUE PROBE');
  console.log('===============================================================');

  // ── Find candidate matches (past 5 days, top-5 leagues) ────────
  const now = new Date();
  const from = new Date(now.getTime() - 5 * 86400000).toISOString().slice(0, 10);
  const to   = now.toISOString().slice(0, 10);

  hr('Fetching recent top-5 matches');
  const candidates = [];
  for (const lid of TOP5) {
    const r = await bz(`/events/?date_from=${from}&date_to=${to}&league=${lid}&page=1`);
    const results = r.body?.results || [];
    const finished = results.filter((e) => e.status === 'finished');
    console.log(`  league ${lid}: ${results.length} total, ${finished.length} finished`);
    for (const e of finished) candidates.push({ ...e, _lid: lid });
  }

  if (candidates.length === 0) {
    console.log('  ✗ No finished top-5 matches in window. Trying live feed.');
    const lv = await bz('/events/live/');
    for (const e of lv.body?.events || []) {
      if (TOP5.includes(e.league_id)) candidates.push({ ...e, _lid: e.league_id });
    }
  }

  console.log(`  candidates: ${candidates.length}`);
  if (candidates.length === 0) {
    console.log('  ✗ Nothing to probe. Try again on a matchday.');
    return;
  }

  // ── Pick the highest-scoring one (likely has incidents/own goals) ──
  candidates.sort((a, b) => {
    const sa = (a.home_score || 0) + (a.away_score || 0);
    const sb = (b.home_score || 0) + (b.away_score || 0);
    return sb - sa;
  });
  const pick = candidates[0];
  console.log(`  pick: [${pick._lid}] ${pick.home_team} ${pick.home_score}-${pick.away_score} ${pick.away_team} (id ${pick.id})`);

  // ── 1. Incidents: goal_type and card_type values ───────────────
  hr('1. Incidents — goal_type / card_type');
  const inc = await bz(`/events/${pick.id}/incidents/`);
  const incidents = inc.body?.incidents || [];
  console.log(`  incidents: ${incidents.length}`);
  const goals = incidents.filter((i) => i.type === 'goal');
  const cards = incidents.filter((i) => i.type === 'card');
  const goalTypes = [...new Set(goals.map((g) => g.goal_type))];
  const cardTypes = [...new Set(cards.map((c) => c.card_type))];
  console.log('  goal_type values:', goalTypes);
  console.log('  card_type values:', cardTypes);
  console.log('  first goal sample:', JSON.stringify(goals[0] || null));
  console.log('  first card sample:', JSON.stringify(cards[0] || null));

  // Look for own goals in this window across many matches
  hr('1b. Scanning candidates for own-goal goal_type');
  const ownGoalTypes = new Set();
  for (const c of candidates.slice(0, 8)) {
    const r = await bz(`/events/${c.id}/incidents/`);
    for (const i of r.body?.incidents || []) {
      if (i.type === 'goal' && i.goal_type && i.goal_type !== 'regular') {
        ownGoalTypes.add(i.goal_type);
      }
    }
  }
  if (ownGoalTypes.size > 0) {
    console.log('  non-regular goal_type values seen:', [...ownGoalTypes]);
  } else {
    console.log('  no own-goals found in scanned matches — value still unknown');
  }

  // ── 2. Prediction probability scale ────────────────────────────
  hr('2. Prediction probability scale');
  const pred = await bz(`/events/${pick.id}/prediction/`);
  if (pred.body?.markets?.match_result) {
    const mr = pred.body.markets.match_result;
    console.log('  match_result:', JSON.stringify(mr));
    console.log('  model:', JSON.stringify(pred.body.model));
    const maxP = Math.max(mr.prob_home, mr.prob_draw, mr.prob_away);
    console.log('  max probability:', maxP);
    console.log('  → scale:', maxP <= 1 ? '0-1 (ratio)' : '0-100 (percent)');
    const ou = pred.body.markets.over_under;
    if (ou) {
      console.log('  over_under:', JSON.stringify(ou));
      const maxOU = Math.max(ou.prob_over_15 || 0, ou.prob_over_25 || 0, ou.prob_over_35 || 0);
      console.log('  max O/U prob:', maxOU);
      console.log('  → O/U scale:', maxOU <= 1 ? '0-1 (ratio)' : '0-100 (percent)');
    }
  } else {
    console.log('  ✗ prediction:', pred.status, JSON.stringify(pred.body)?.slice(0, 200));
  }

  // ── 3. API-Football passes.accuracy shape ──────────────────────
  hr('3. passes.accuracy shape (API-Football)');
  if (!AF) {
    console.log('  skipped (no AF key)');
  } else {
    // Find the API-Football fixture id — search by date+teams
    // Simpler: pull live/all fixtures and match by team names.
    const afFix = await af(`/fixtures?date=${pick.event_date.slice(0, 10)}`);
    const matches = afFix.body?.response || [];
    const hit = matches.find((f) => {
      const h = (f.teams?.home?.name || '').toLowerCase();
      const a = (f.teams?.away?.name || '').toLowerCase();
      const ph = pick.home_team.toLowerCase();
      const pa = pick.away_team.toLowerCase();
      return (h.includes(ph.split(' ')[0]) || ph.includes(h.split(' ')[0]))
          && (a.includes(pa.split(' ')[0]) || pa.includes(a.split(' ')[0]));
    });
    if (!hit) {
      console.log('  ✗ no API-Football fixture matched on', pick.event_date.slice(0, 10));
      console.log('    (league name:', pick.league_name, ')');
    } else {
      const fid = hit.fixture.id;
      console.log(`  API-Football fixture id: ${fid} (${hit.teams.home.name} vs ${hit.teams.away.name})`);
      const players = await af(`/fixtures/players?fixture=${fid}`);
      const blocks = players.body?.response || [];
      console.log(`  team blocks: ${blocks.length}`);
      // Find a player with 20+ passes
      let sample = null;
      for (const b of blocks) {
        for (const p of b.players || []) {
          const st = p.statistics?.[0];
          if (st?.passes?.total >= 20) { sample = { player: p.player, st }; break; }
        }
        if (sample) break;
      }
      if (sample) {
        console.log(`  sample player: ${sample.player.name}`);
        console.log(`  passes:`, JSON.stringify(sample.st.passes));
        console.log(`  type: ${typeof sample.st.passes.accuracy}`);
        const n = Number(sample.st.passes.accuracy);
        console.log('  → interpretation:',
          typeof sample.st.passes.accuracy === 'string' && sample.st.passes.accuracy.includes('%')
            ? 'percent string like "83%"'
            : Number.isFinite(n) && n <= 1 ? '0-1 ratio'
            : Number.isFinite(n) && n <= (sample.st.passes.total || 0) ? 'count (accurate passes)'
            : Number.isFinite(n) ? 'percent (0-100 number)'
            : 'UNKNOWN');
      } else {
        console.log('  ✗ no player with 20+ passes found');
        // Fall back: show whatever we got
        const p0 = blocks[0]?.players?.[0];
        if (p0) console.log('  fallback sample:', JSON.stringify(p0.statistics?.[0]?.passes));
      }
    }
  }

  console.log('\n===============================================================');
  console.log('  TOP-5 PROBE COMPLETE');
  console.log('===============================================================');
})().catch((e) => { console.error('FATAL:', e); process.exit(1); });
