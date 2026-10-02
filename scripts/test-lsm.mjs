import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const SSE_URL = 'https://livescoremcp.com/sse';

async function main() {
  console.log('Connecting to', SSE_URL, '...');
  const transport = new SSEClientTransport(new URL(SSE_URL));
  const client = new Client(
    { name: 'livescorehub-test', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log('✓ Connected\n');

  // List available tools
  const tools = await client.listTools();
  console.log('══════ AVAILABLE TOOLS ══════');
  for (const t of tools.tools) {
    console.log(`\n▸ ${t.name}`);
    if (t.description) console.log(`  ${t.description}`);
    if (t.inputSchema) {
      console.log('  Inputs:', JSON.stringify(t.inputSchema, null, 2).slice(0, 400));
    }
  }

  // Try health
  try {
    console.log('\n══════ CALLING health ══════');
    const health = await client.callTool({ name: 'health', arguments: { message: 'ping' } });
    console.log(JSON.stringify(health, null, 2).slice(0, 500));
  } catch (err) {
    console.log('health failed:', err.message);
  }

  // Try live scores
  try {
    console.log('\n══════ CALLING get_live_scores ══════');
    const live = await client.callTool({ name: 'get_live_scores', arguments: {} });
    const text = live.content?.find(c => c.type === 'text')?.text ?? '';
    console.log(text.slice(0, 1500));
  } catch (err) {
    console.log('get_live_scores failed:', err.message);
  }

  await client.close();
  console.log('\n✓ Done');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
