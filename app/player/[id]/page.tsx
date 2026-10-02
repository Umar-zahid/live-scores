import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlayerProfile } from '@/lib/football-api';

type StatRow = {
  season: string;
  team: string;
  league: string;
  apps: number;
  goals: number;
  assists: number;
  minutes: number;
  rating: number | null;
};

function num(v: any): number {
  const n = parseInt(String(v ?? '0'), 10);
  return isNaN(n) ? 0 : n;
}

function flt(v: any): number | null {
  if (v === '' || v == null) return null;
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
}

function formatMoney(v: string | number): string {
  const n = typeof v === 'string' ? parseInt(v, 10) : v;
  if (!n || isNaN(n)) return '—';
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `€${(n / 1_000).toFixed(0)}K`;
  return `€${n}`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: 'primary' | 'secondary';
}) {
  const color =
    accent === 'primary' ? 'text-primary' : accent === 'secondary' ? 'text-secondary' : 'text-on-surface';
  return (
    <div className="rounded-lg bg-surface-container/40 border border-surface-container-highest/30 p-3 text-center">
      <div className={`text-lg md:text-2xl font-extrabold tabular-nums ${color}`}>{value}</div>
      <div className="text-[10px] md:text-xs text-on-surface-variant uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-3 sm:p-4 md:p-5 shadow-lg">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-surface-container-highest/40">
        <span className="material-symbols-outlined text-[18px] text-primary">{icon}</span>
        <h2 className="text-sm md:text-base font-extrabold uppercase tracking-tight text-on-surface">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const player = await getPlayerProfile(params.id);
  if (!player) notFound();

  const name = player.name ?? player.commonname ?? 'Unknown Player';
  const position = player.position ?? '—';
  const age = player.age ?? '—';
  const nationality = player.nationality ?? '—';
  const height = player.height ? `${player.height} cm` : '—';
  const foot = player.preferredFoot ?? '—';
  const marketValue = formatMoney(player.marketvalue);

  const rows: StatRow[] = (player.statistics ?? []).map((s: any) => ({
    season: s.season ?? '—',
    team: s.name ?? '—',
    league: s.league ?? '—',
    apps: num(s.appearences),
    goals: num(s.goals),
    assists: num(s.assists),
    minutes: num(s.minutes),
    rating: flt(s.rating),
  }));

  const totalApps = rows.reduce((a, r) => a + r.apps, 0);
  const totalGoals = rows.reduce((a, r) => a + r.goals, 0);
  const totalAssists = rows.reduce((a, r) => a + r.assists, 0);
  const totalMinutes = rows.reduce((a, r) => a + r.minutes, 0);
  const ratingRows = rows.filter((r) => r.rating != null);
  const avgRating = ratingRows.length
    ? ratingRows.reduce((a, r) => a + (r.rating ?? 0), 0) / ratingRows.length
    : null;

  const bySeason = new Map<string, StatRow[]>();
  for (const r of rows) {
    if (!bySeason.has(r.season)) bySeason.set(r.season, []);
    bySeason.get(r.season)!.push(r);
  }
  const seasons = Array.from(bySeason.keys()).sort((a, b) => b.localeCompare(a));

  const transfers = player.transfers ?? [];
  const trophies = player.trophies ?? [];
  const sidelined = player.sidelined ?? [];
  const facts = player.facts ?? [];

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

          <section className="relative overflow-hidden rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div
                className="shrink-0 rounded-full flex items-center justify-center font-black text-2xl md:text-3xl"
                style={{
                  width: 96,
                  height: 96,
                  background: '#191f31',
                  border: '3px solid #4be277',
                  color: '#4be277',
                  boxShadow: '0 0 0 6px rgba(75,226,119,0.1)',
                }}
              >
                {initials(name)}
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className="text-xl md:text-3xl font-black tracking-tight text-on-surface break-words">
                  {name}
                </h1>
                {player.commonname && player.commonname !== name && (
                  <p className="text-xs md:text-sm text-on-surface-variant">{player.commonname}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] md:text-xs font-bold uppercase tracking-wider">
                    {position}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] md:text-xs font-bold uppercase tracking-wider">
                    {nationality}
                  </span>
                  {age !== '—' && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] md:text-xs font-bold uppercase tracking-wider">
                      Age {age}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-4 pt-4 border-t border-surface-container-highest/30">
              <div className="text-center sm:text-left">
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">Market Value</div>
                <div className="text-sm md:text-base font-bold text-primary">{marketValue}</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">Height</div>
                <div className="text-sm md:text-base font-bold text-on-surface">{height}</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">Preferred Foot</div>
                <div className="text-sm md:text-base font-bold text-on-surface">{foot}</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">Birthplace</div>
                <div className="text-sm md:text-base font-bold text-on-surface truncate">
                  {player.birthplace ?? '—'}
                </div>
              </div>
            </div>
          </section>

          <Section title="Career Totals" icon="leaderboard">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
              <StatCard label="Appearances" value={totalApps} />
              <StatCard label="Goals" value={totalGoals} accent="primary" />
              <StatCard label="Assists" value={totalAssists} accent="secondary" />
              <StatCard label="Minutes" value={totalMinutes} />
              <StatCard label="Avg Rating" value={avgRating ? avgRating.toFixed(2) : '—'} />
            </div>
          </Section>

          {seasons.length > 0 && (
            <Section title="Season Stats" icon="calendar_month">
              <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
                <table className="w-full text-left text-[11px] md:text-sm">
                  <thead>
                    <tr className="text-on-surface-variant text-[10px] uppercase tracking-wider">
                      <th className="py-1.5 pr-2 font-bold">Season</th>
                      <th className="py-1.5 px-1 font-bold">Team</th>
                      <th className="py-1.5 px-1 font-bold text-center">Apps</th>
                      <th className="py-1.5 px-1 font-bold text-center">G</th>
                      <th className="py-1.5 px-1 font-bold text-center">A</th>
                      <th className="py-1.5 px-1 font-bold text-center">Min</th>
                      <th className="py-1.5 px-1 font-bold text-center">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasons.flatMap((season) =>
                      bySeason.get(season)!.map((r, i) => (
                        <tr key={`${season}-${i}`} className="border-t border-surface-container-highest/20">
                          <td className="py-2 pr-2 text-on-surface-variant tabular-nums whitespace-nowrap">
                            {i === 0 ? season : ''}
                          </td>
                          <td className="py-2 px-1 text-on-surface truncate max-w-[140px]">{r.team}</td>
                          <td className="py-2 px-1 text-center tabular-nums text-on-surface-variant">{r.apps}</td>
                          <td className="py-2 px-1 text-center tabular-nums text-primary font-bold">{r.goals || ''}</td>
                          <td className="py-2 px-1 text-center tabular-nums text-secondary">{r.assists || ''}</td>
                          <td className="py-2 px-1 text-center tabular-nums text-on-surface-variant">{r.minutes || ''}</td>
                          <td className="py-2 px-1 text-center">
                            {r.rating ? (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  r.rating >= 7.5
                                    ? 'bg-primary/20 text-primary'
                                    : r.rating >= 6.5
                                    ? 'bg-surface-container text-on-surface'
                                    : 'bg-error/15 text-error'
                                }`}
                              >
                                {r.rating.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-outline">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {trophies.length > 0 && (
            <Section title={`Trophies · ${trophies.length}`} icon="emoji_events">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {trophies.map((t: any, i: number) => (
                  <div
                    key={i}
                    className="rounded-lg bg-surface-container/40 border border-surface-container-highest/30 p-2.5 flex items-center gap-3"
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ color: t.rank === 1 ? '#facc15' : '#bccbb9' }}
                    >
                      {t.rank === 1 ? 'emoji_events' : 'military_tech'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] md:text-sm font-bold text-on-surface truncate">
                        {t.league}
                      </div>
                      <div className="text-[10px] md:text-xs text-on-surface-variant">
                        {t.count}× · {t.country}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        t.rank === 1 ? 'bg-primary/15 text-primary' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {t.rank === 1 ? 'Won' : `${t.rank}nd`}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {transfers.length > 0 && (
            <Section title="Transfers" icon="swap_horiz">
              <div className="flex flex-col gap-2">
                {transfers.map((t: any, i: number) => (
                  <div
                    key={i}
                    className="rounded-lg bg-surface-container/40 border border-surface-container-highest/30 p-2.5 flex items-center gap-2 text-[12px] md:text-sm"
                  >
                    <span className="text-on-surface-variant tabular-nums shrink-0 text-[10px] md:text-xs">
                      {t.date}
                    </span>
                    <span className="text-on-surface-variant shrink-0">{t.from}</span>
                    <span className="material-symbols-outlined text-primary text-[16px] shrink-0">
                      arrow_forward
                    </span>
                    <span className="text-on-surface font-bold truncate">{t.to}</span>
                    {t.type && (
                      <span className="ml-auto text-[10px] uppercase tracking-wider text-on-surface-variant shrink-0">
                        {t.type}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {sidelined.length > 0 && (
            <Section title="Injury History" icon="healing">
              <div className="flex flex-col gap-1.5">
                {sidelined.slice(0, 8).map((s: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 py-1.5 border-b border-surface-container-highest/20 last:border-0"
                  >
                    <span className="text-[12px] md:text-sm text-on-surface truncate">{s.type}</span>
                    <span className="text-[10px] md:text-xs text-on-surface-variant tabular-nums shrink-0">
                      {s.date_start} → {s.date_end}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {(player.about || facts.length > 0) && (
            <Section title="Biography" icon="auto_stories">
              {player.about && (
                <p className="text-[12px] md:text-sm text-on-surface-variant leading-relaxed mb-3">
                  {player.about}
                </p>
              )}
              {facts.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {facts.slice(0, 6).map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] md:text-sm text-on-surface-variant leading-snug">
                      <span className="material-symbols-outlined text-primary text-[14px] shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}
        </div>
      </main>
    </div>
  );
}
