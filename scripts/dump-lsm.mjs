import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { writeFileSync } from 'fs';

async function main() {
  const transport = new SSEClientTransport(new URL('https://livescoremcp.com/sse'));
  const client = new Client({ name: 'dump', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);
  console.log('✓ Connected');

  // Live scores
  const live = await client.callTool({ name: 'get_live_scores', arguments: { language: 'en' } });
  const liveText = live.content?.find(c => c.type === 'text')?.text ?? '';
  writeFileSync('scripts/dump-live.txt', liveText);
  console.log('✓ Wrote dump-live.txt');

  // Pick first match id
  const arr = JSON.parse(liveText.slice(liveText.indexOf('[')));
  let matchId = null, leagueKey = null;
  for (const c of arr) for (const l of c.leagues ?? []) for (const m of l.matches ?? []) {
    if (m.id) { matchId = m.id; leagueKey = m.leagueKey; break; }
    if (matchId) break;
  }
  console.log('Match:', matchId, 'League:', leagueKey);

  // Match detail — full
  const match = await client.callTool({ name: 'get_match', arguments: { id: matchId, h2h: 0, language: 'en' } });
  const matchText = match.content?.find(c => c.type === 'text')?.text ?? '';
  writeFileSync('scripts/dump-match.txt', matchText);
  console.log('✓ Wrote dump-match.txt (' + matchText.length + ' chars)');

  // Player full — Vinicius
  const player = await client.callTool({ name: 'get_player', arguments: { id: '474972', language: 'en' } });
  const playerText = player.content?.find(c => c.type === 'text')?.text ?? '';
  writeFileSync('scripts/dump-player.txt', playerText);
  console.log('✓ Wrote dump-player.txt (' + playerText.length + ' chars)');

  // League fixtures (uses a known key from live)
  if (leagueKey) {
    const lf = await client.callTool({ name: 'get_league_fixtures', arguments: { league_key: leagueKey, language: 'en' } });
    const lfText = lf.content?.find(c => c.type === 'text')?.text ?? '';
    writeFileSync('scripts/dump-league.txt', lfText);
    console.log('✓ Wrote dump-league.txt (' + lfText.length + ' chars)');
  }

  await client.close();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
