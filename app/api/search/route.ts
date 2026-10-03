import { NextResponse } from 'next/server';
import { searchBzzoiroPlayers, type BzzoiroPlayer } from '@/lib/sources/bzzoiro';

const KEY = process.env.API_FOOTBALL_KEY;
const BASE = 'https://v3.football.api-sports.io';

function age(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

function mapPlayer(p: BzzoiroPlayer) {
  return {
    id: `bz-${p.id}`,
    name: p.name,
    photo: '',
    age: age(p.date_of_birth),
    nationality: p.nationality ?? '',
    position: p.specific_position || p.position || '',
    team: p.current_team?.name ?? '',
    teamLogo: '',
  };
}

async function fetchTeams(q: string) {
  if (!KEY) return [];
  try {
    const res = await fetch(
      `${BASE}/teams?search=${encodeURIComponent(q)}`,
      { headers: { 'x-apisports-key': KEY }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.response ?? []).slice(0, 6).map((t: any) => ({
      id: t.team?.id,
      name: t.team?.name,
      logo: t.team?.logo,
      country: t.venue?.country ?? '',
    }));
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ players: [], teams: [] });
  }

  const [teamsRes, playersRes] = await Promise.allSettled([
    fetchTeams(q),
    searchBzzoiroPlayers(q),
  ]);

  const teams = teamsRes.status === 'fulfilled' ? teamsRes.value : [];
  const players =
    playersRes.status === 'fulfilled'
      ? playersRes.value.slice(0, 8).map(mapPlayer)
      : [];

  return NextResponse.json({ players, teams });
}
