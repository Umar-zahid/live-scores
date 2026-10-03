// Full dump of an incidents array so we can design the mapper.
const KEY = process.env.BZZOIRO_API_KEY;
if (!KEY) { console.error('Missing key'); process.exit(1); }

const headers = { Authorization: `Token ${KEY}` };
const BASE = 'https://sports.bzzoiro.com/api/v2';

async function get(path) {
  const r = await fetch(`${BASE}${path}`, { headers });
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  return r.json();
}

(async () => {
  // 209579 = Fulham vs Man Utd (has goals, cards — tested earlier)
  const ev = await get('/events/209579/incidents/');
  const incidents = ev.incidents ?? ev;
  console.log(`Total incidents: ${Array.isArray(incidents) ? incidents.length : 'n/a'}`);
  console.log('');
  console.log('=== Every incident (full JSON) ===');
  for (const [i, inc] of (incidents ?? []).entries()) {
    console.log(`--- incident ${i} ---`);
    console.log(JSON.stringify(inc, null, 2));
  }
  console.log('');
  console.log('=== All unique type values ===');
  const types = new Set();
  for (const inc of incidents ?? []) if (inc.type) types.add(inc.type);
  console.log([...types].join(', '));
})().catch(e => { console.error(e); process.exit(1); });
