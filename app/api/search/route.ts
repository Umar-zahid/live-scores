import { NextResponse } from 'next/server';

const KEY = process.env.API_FOOTBALL_KEY;
const BASE = 'https://v3.football.api-sports.io';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ players: [], teams: [] });
  }
  if (!KEY) {
    return NextResponse.json({ players: [], teams: [], error: 'missing key' });
  }

  try {
    const [teamsRes, playersRes] = await Promise.all([
      fetch(`${BASE}/teams?search=${encodeURIComponent(q)}`, {
        headers: { 'x-apisports-key': KEY },
        next: { revalidate: 3600 },
      }),
      fetch(
        `${BASE}/players?search=${encodeURIComponent(q)}&season=2023`,
        {
          headers: { 'x-apisports-key': KEY },
          next: { revalidate: 3600 },
        }
      ),
    ]);

    const teamsData = teamsRes.ok ? await teamsRes.json() : { response: [] };
    const playersData = playersRes.ok ? await playersRes.json() : { response: [] };

    const teams = (teamsData.response ?? []).slice(0, 6).map((t: any) => ({
      id: t.team?.id,
      name: t.team?.name,
      logo: t.team?.logo,
      country: t.venue?.country ?? '',
    }));

    const players = (playersData.response ?? []).slice(0, 6).map((p: any) => ({
      id: p.player?.id,
      name: p.player?.name,
      photo: p.player?.photo,
      age: p.player?.age,
      nationality: p.player?.nationality,
      position: p.statistics?.[0]?.games?.position ?? '',
      team: p.statistics?.[0]?.team?.name ?? '',
      teamLogo: p.statistics?.[0]?.team?.logo ?? '',
    }));

    return NextResponse.json({ players, teams });
  } catch (err) {
    console.error('search failed:', err);
    return NextResponse.json({ players: [], teams: [], error: String(err) });
  }
}
