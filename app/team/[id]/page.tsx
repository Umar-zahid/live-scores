import Link from 'next/link';
import { notFound } from 'next/navigation';

const KEY = process.env.API_FOOTBALL_KEY;
const BASE = 'https://v3.football.api-sports.io';

async function getTeam(id: string) {
  if (!KEY) return null;
  try {
    const res = await fetch(`${BASE}/teams?id=${id}`, {
      headers: { 'x-apisports-key': KEY },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.response?.[0] ?? null;
  } catch {
    return null;
  }
}

async function getRecentFixtures(id: string) {
  if (!KEY) return [];
  try {
    const res = await fetch(`${BASE}/fixtures?team=${id}&last=8`, {
      headers: { 'x-apisports-key': KEY },
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.response) ? data.response : [];
  } catch {
    return [];
  }
}

async function getSquad(id: string) {
  if (!KEY) return [];
  try {
    const res = await fetch(`${BASE}/players/squads?team=${id}`, {
      headers: { 'x-apisports-key': KEY },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const block = data.response?.[0];
    return block?.players ?? [];
  } catch {
    return [];
  }
}

export default async function TeamPage({
  params,
}: {
  params: { id: string };
}) {
  const [team, fixtures, squad] = await Promise.all([
    getTeam(params.id),
    getRecentFixtures(params.id),
    getSquad(params.id),
  ]);

  if (!team) notFound();

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary-container/25 blur-[130px] rounded-full"></div>
      </div>

      <main className="relative z-10 w-full bg-surface-container-lowest min-h-screen">
        <div className="max-w-5xl mx-auto w-full px-3 sm:px-4 md:px-6 py-3 md:py-6 flex flex-col gap-3 md:gap-5">
          <Link
            href="/football"
            className="inline-flex items-center gap-1 self-start text-on-surface-variant hover:text-on-surface text-[11px] md:text-xs uppercase tracking-wider font-bold group"
          >
            <span className="material-symbols-outlined text-[16px] md:text-[18px] group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            Back
          </Link>

          {/* Team header */}
          <section className="relative overflow-hidden rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div
                className="shrink-0 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  width: 96,
                  height: 96,
                  background: '#191f31',
                  border: '3px solid #4be277',
                }}
              >
                {team.team?.logo ? (
                  <img
                    src={team.team.logo}
                    alt={team.team.name}
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <span className="font-black text-2xl text-primary">
                    {team.team?.name?.slice(0, 3).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className="text-xl md:text-3xl font-black tracking-tight text-on-surface break-words">
                  {team.team?.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  {team.team?.country && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] md:text-xs font-bold uppercase tracking-wider">
                      {team.team.country}
                    </span>
                  )}
                  {team.team?.founded && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] md:text-xs font-bold uppercase tracking-wider">
                      Est. {team.team.founded}
                    </span>
                  )}
                  {team.venue?.name && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] md:text-xs font-bold uppercase tracking-wider">
                      {team.venue.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Recent fixtures */}
          {fixtures.length > 0 && (
            <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-3 sm:p-4 md:p-5 shadow-lg">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-surface-container-highest/40">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  history
                </span>
                <h2 className="text-sm md:text-base font-extrabold uppercase tracking-tight text-on-surface">
                  Recent Matches
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {fixtures.map((f: any) => (
                  <Link
                    key={f.fixture?.id}
                    href={`/football/${f.fixture.id}`}
                    className="rounded-lg bg-surface-container/40 border border-surface-container-highest/30 p-2.5 flex items-center gap-3 hover:bg-surface-container/60 transition-colors"
                  >
                    <div className="text-[10px] text-on-surface-variant tabular-nums shrink-0 w-16">
                      {new Date(f.fixture.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2 justify-center">
                      <span className="text-[12px] md:text-sm text-on-surface truncate text-right flex-1">
                        {f.teams?.home?.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-high text-[11px] md:text-sm font-bold text-on-surface tabular-nums shrink-0">
                        {f.goals?.home ?? 0} – {f.goals?.away ?? 0}
                      </span>
                      <span className="text-[12px] md:text-sm text-on-surface truncate flex-1">
                        {f.teams?.away?.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider shrink-0 hidden sm:inline">
                      {f.league?.name?.slice(0, 20)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Squad */}
          {squad.length > 0 && (
            <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-3 sm:p-4 md:p-5 shadow-lg">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-surface-container-highest/40">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  groups
                </span>
                <h2 className="text-sm md:text-base font-extrabold uppercase tracking-tight text-on-surface">
                  Squad · {squad.length}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {squad.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/player/${p.id}`}
                    className="rounded-lg bg-surface-container/40 border border-surface-container-highest/30 p-2 flex items-center gap-2 hover:bg-surface-container/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 overflow-hidden">
                      {p.photo ? (
                        <img
                          src={p.photo}
                          alt=""
                          className="w-8 h-8 object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-black text-primary">
                          {p.name?.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] md:text-sm font-bold text-on-surface truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                        {p.position} · #{p.number ?? '–'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
