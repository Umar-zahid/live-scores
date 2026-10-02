import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

async function main() {
  const transport = new SSEClientTransport(new URL('https://livescoremcp.com/sse'));
  const client = new Client({ name: 'test2', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);
  console.log('✓ Connected');

  // ── 1. Grab a live match ID ─────────────────────────────────
  console.log('\n══════ Finding a live match ID ══════');
  const live = await client.callTool({ name: 'get_live_scores', arguments: { language: 'en' } });
  const liveText = live.content?.find(c => c.type === 'text')?.text ?? '';
  const jsonStart = liveText.indexOf('[');
  const liveArr = JSON.parse(liveText.slice(jsonStart));

  let matchId = null;
  let matchSummary = null;
  for (const country of liveArr) {
    for (const league of country.leagues ?? []) {
      for (const m of league.matches ?? []) {
        if (m.id) {
          matchId = m.id;
          matchSummary = m;
          console.log(`Found: ${m.localteam} vs ${m.visitorteam} (ID: ${m.id})`);
          break;
        }
      }
      if (matchId) break;
    }
    if (matchId) break;
  }

  if (!matchId) {
    console.log('No live match found, using fallback ID');
    matchId = '7258234';
  }

  // ── 2. Get full match detail ────────────────────────────────
  console.log('\n══════ CALLING get_match ══════');
  const match = await client.callTool({ name: 'get_match', arguments: { id: matchId, h2h: 0 } });
  const matchText = match.content?.find(c => c.type === 'text')?.text ?? '';
  console.log(matchText.slice(0, 4000));

  // ── 3. Get a player profile ─────────────────────────────────
  console.log('\n══════ CALLING get_player on ID 474972 ══════');
  const player = await client.callTool({ name: 'get_player', arguments: { id: '474972', language: 'en' } });
  const playerText = player.content?.find(c => c.type === 'text')?.text ?? '';
  console.log(playerText.slice(0, 2500));

  // ── 4. Search for a competition ─────────────────────────────
  console.log('\n══════ CALLING search (Premier League) ══════');
  const search = await client.callTool({ name: 'search', arguments: { q: 'Premier League' } });
  const searchText = search.content?.find(c => c.type === 'text')?.text ?? '';
  console.log(searchText.slice(0, 2000));

  await client.close();
  console.log('\n✓ Done');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
