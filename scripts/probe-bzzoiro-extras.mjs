// scripts/probe-bzzoiro-extras.mjs
// Last probe: check for single-event fetch, incidents, and prediction shape.
const KEY = process.env.BZZOIRO_API_KEY;
if (!KEY) { console.error('Missing key'); process.exit(1); }
const BASE = 'https://sports.bzzoiro.com/api/v2';
const headers = { Authorization: `Token ${KEY}` };

async function tryGet(label, path) {
  try {
    const res = await fetch(`${BASE}${path}`, { headers });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    console.log(`  ${label} → ${res.status}`);
    if (res.ok && json) return json;
    if (!res.ok) console.log(`    preview: ${text.slice(0, 200)}`);
  } catch (e) {
    console.log(`  ${label} → ERR ${e.message}`);
  }
  return null;
}

(async () => {
  console.log('=== Event 209579 (Fulham vs Man Utd) probes ===');
  const single = await tryGet('/events/209579/', '/events/209579/');
  if (single) {
    console.log('    single-event keys:', Object.keys(single).join(', '));
  }

  const incidents = await tryGet('/events/209579/incidents/', '/events/209579/incidents/');
  if (incidents) {
    const arr = incidents.incidents ?? incidents.results ?? incidents.events ?? incidents;
    console.log('    incidents type:', Array.isArray(arr) ? `array[${arr.length}]` : typeof arr);
    if (Array.isArray(arr) && arr[0]) {
      console.log('    incidents[0]:', JSON.stringify(arr[0], null, 2));
    }
  }

  // Try various names for the events-per-match endpoint
  for (const p of ['/events/209579/events/', '/events/209579/actions/', '/events/209579/live/']) {
    await tryGet(p, p);
  }

  console.log('');
  console.log('=== Prediction for a PL fixture ===');
  const pred = await tryGet('/events/209579/prediction/', '/events/209579/prediction/');
  if (pred) {
    console.log('    FULL:', JSON.stringify(pred, null, 2).slice(0, 1500));
  }

  console.log('');
  console.log('=== Player direct fetch ===');
  const player = await tryGet('/players/9063/', '/players/9063/');
  if (player) {
    console.log('    keys:', Object.keys(player).join(', '));
    console.log('    name:', player.name);
  }
})().catch(e => { console.error(e); process.exit(1); });
