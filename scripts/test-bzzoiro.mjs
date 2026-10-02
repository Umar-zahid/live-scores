// scripts/test-bzzoiro.mjs
// Verifies Bzzoiro auth + discovers real response shapes.

const KEY = process.env.BZZOIRO_API_KEY;
if (!KEY) {
  console.error('Missing BZZOIRO_API_KEY. Run with:');
  console.error('  set -a; source .env.local; set +a; node scripts/test-bzzoiro.mjs');
  process.exit(1);
}

const BASE = 'https://sports.bzzoiro.com/api/v2';
console.log(`Using key: ${KEY.slice(0, 6)}...${KEY.slice(-4)} (len ${KEY.length})`);
console.log(`Base URL: ${BASE}`);
console.log('');

async function tryFetch(label, url, authHeaders) {
  try {
    const res = await fetch(url, { headers: authHeaders });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* not json */ }
    return { ok: res.ok, status: res.status, statusText: res.statusText, json, textPreview: text.slice(0, 300) };
  } catch (err) {
    return { ok: false, status: 0, error: String(err) };
  }
}

(async () => {
  // ---- Step 1: Which auth header does Bzzoiro accept? ----
  console.log('=== STEP 1: auth header probe ===');
  const authVariants = [
    { name: 'Authorization: Token <key>', headers: { Authorization: `Token ${KEY}` } },
    { name: 'Authorization: Bearer <key>', headers: { Authorization: `Bearer ${KEY}` } },
    { name: 'X-API-Key: <key>', headers: { 'X-API-Key': KEY } },
    { name: 'api-key: <key>', headers: { 'api-key': KEY } },
  ];
  let winningHeader = null;
  for (const v of authVariants) {
    const r = await tryFetch('probe', `${BASE}/events/live/`, v.headers);
    const marker = r.ok ? 'OK' : `FAIL ${r.status}`;
    console.log(`  ${marker.padEnd(10)} ${v.name}`);
    if (r.ok && !winningHeader) winningHeader = v.headers;
    if (!r.ok) console.log(`            preview: ${(r.textPreview || r.error || '').slice(0, 200)}`);
  }

  if (!winningHeader) {
    console.log('');
    console.log('No auth variant worked. Possible issues:');
    console.log('  - Base URL is wrong (try https://sports.bzzoiro.com/api/v2 or /api/ or /v2/)');
    console.log('  - Key is wrong / not activated (check email verification)');
    console.log('  - Different auth scheme (check Bzzoiro dashboard docs)');
    process.exit(1);
  }
  console.log('');
  console.log('WINNING AUTH HEADER: found');
  console.log('');

  // ---- Step 2: Live matches ----
  console.log('=== STEP 2: /events/live/ ===');
  const live = await tryFetch('live', `${BASE}/events/live/`, winningHeader);
  console.log(`  status: ${live.status}`);
  if (live.json) {
    console.log(`  top-level keys: ${Object.keys(live.json).join(', ')}`);
    const results = live.json.results || live.json.data || live.json.events || live.json;
    const arr = Array.isArray(results) ? results : [];
    console.log(`  results count: ${arr.length}`);
    if (arr[0]) {
      console.log(`  first item keys: ${Object.keys(arr[0]).join(', ')}`);
      console.log(`  first item preview:`);
      console.log(JSON.stringify(arr[0], null, 2).split('\n').slice(0, 30).join('\n'));
    }
  } else {
    console.log(`  raw preview: ${live.textPreview}`);
  }
  console.log('');

  const firstLive = (() => {
    const results = live.json?.results || live.json?.data || live.json?.events || live.json;
    const arr = Array.isArray(results) ? results : [];
    return arr[0] ?? null;
  })();

  // ---- Step 3: Event stats + prediction (only if we have a live event) ----
  if (firstLive) {
    const eventId = firstLive.id ?? firstLive.event_id ?? firstLive.match_id;
    console.log(`=== STEP 3: event ${eventId} sub-resources ===`);
    for (const sub of ['stats', 'lineups', 'prediction']) {
      const r = await tryFetch(sub, `${BASE}/events/${eventId}/${sub}/`, winningHeader);
      console.log(`  /events/${eventId}/${sub}/ → ${r.ok ? 'OK' : `FAIL ${r.status}`}`);
      if (r.ok && r.json) {
        console.log(`    keys: ${Object.keys(r.json).join(', ')}`);
      } else if (!r.ok) {
        console.log(`    preview: ${r.textPreview || ''}`);
      }
    }
    console.log('');
  } else {
    console.log('=== STEP 3 skipped: no live events to test with ===');
    console.log('');
  }

  // ---- Step 4: Player search ----
  console.log('=== STEP 4: /players/?name=... ===');
  for (const q of ['messi', 'haaland']) {
    const r = await tryFetch('players', `${BASE}/players/?name=${q}`, winningHeader);
    console.log(`  query="${q}" → ${r.ok ? 'OK' : `FAIL ${r.status}`}`);
    if (r.ok && r.json) {
      const arr = r.json.results || r.json.data || r.json;
      const a = Array.isArray(arr) ? arr : [];
      console.log(`    count: ${a.length}`);
      if (a[0]) console.log(`    first keys: ${Object.keys(a[0]).join(', ')}`);
    } else if (!r.ok) {
      console.log(`    preview: ${r.textPreview || ''}`);
    }
  }
  console.log('');

  // ---- Step 5: Teams + leagues + standings probe ----
  console.log('=== STEP 5: other endpoint probes ===');
  const probes = [
    '/teams/?name=arsenal',
    '/leagues/',
    '/events/?date_from=2024-12-01&date_to=2024-12-03',
  ];
  for (const p of probes) {
    const r = await tryFetch('probe', `${BASE}${p}`, winningHeader);
    console.log(`  ${p} → ${r.ok ? 'OK' : `FAIL ${r.status}`}`);
    if (r.ok && r.json) {
      const arr = r.json.results || r.json.data || r.json;
      if (Array.isArray(arr)) {
        console.log(`    count: ${arr.length}`);
        if (arr[0]) console.log(`    first keys: ${Object.keys(arr[0]).join(', ')}`);
      } else {
        console.log(`    keys: ${Object.keys(r.json).join(', ')}`);
      }
    }
  }

  console.log('');
  console.log('=== DONE ===');
})().catch((e) => { console.error(e); process.exit(1); });
