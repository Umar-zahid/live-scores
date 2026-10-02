import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const SSE_URL = 'https://livescoremcp.com/sse';

let _client: Client | null = null;
let _connecting: Promise<Client> | null = null;

async function getClient(): Promise<Client> {
  if (_client) return _client;
  if (_connecting) return _connecting;

  _connecting = (async () => {
    const transport = new SSEClientTransport(new URL(SSE_URL));
    const c = new Client(
      { name: 'livescorehub', version: '1.0.0' },
      { capabilities: {} }
    );
    await c.connect(transport);
    _client = c;
    _connecting = null;
    return c;
  })();

  return _connecting;
}

function extractJson(text: string): any {
  const brace = text.indexOf('{');
  const bracket = text.indexOf('[');
  let start = -1;
  if (brace === -1) start = bracket;
  else if (bracket === -1) start = brace;
  else start = Math.min(brace, bracket);
  if (start === -1) return null;
  try {
    return JSON.parse(text.slice(start));
  } catch {
    return null;
  }
}

async function callTool(name: string, args: Record<string, unknown>): Promise<any> {
  try {
    const c = await getClient();
    const result = await c.callTool({ name, arguments: args });
    const text =
      result.content?.find((x: any) => x.type === 'text')?.text ?? '';
    return extractJson(text);
  } catch (err) {
    console.error(`[livescore] ${name} failed:`, err);
    _client = null;
    return null;
  }
}

export async function lsmGetLiveScores(): Promise<any[]> {
  const data = await callTool('get_live_scores', { language: 'en' });
  return Array.isArray(data) ? data : [];
}

export async function lsmGetMatch(id: string): Promise<any | null> {
  return callTool('get_match', { id, h2h: 0, language: 'en' });
}

export async function lsmGetPlayer(id: string): Promise<any | null> {
  return callTool('get_player', { id, language: 'en' });
}

export async function lsmGetTeamImage(id: string): Promise<string | null> {
  const data = await callTool('get_team_image', { id });
  if (typeof data === 'string') return data;
  if (data?.url) return String(data.url);
  if (data?.image) return String(data.image);
  if (data?.png) return String(data.png);
  return null;
}
