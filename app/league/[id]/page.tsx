import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getBzzoiroEventsInRange,
} from '@/lib/sources/bzzoiro';
import {
  getLeagueStandings,
  getLeagueTopScorers,
} from '@/lib/football-api';
import { findLeagueById } from '@/lib/sources/leagues';
import { resolveLeagueName } from '@/lib/sources/league-names';
import LeagueStandings from '@/components/football/LeagueStandings';
import LeagueTopScorers from '@/components/football/LeagueTopScorers';

export const dynamic = 'force-dynamic';

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fmtKickoff(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

interface FixtureRow {
  id: string;
  status: string;
  startTime: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  minute: number | null;
}

async function getLeagueFixtures(bzzoiroLeagueId: number): Promise<FixtureRow[]> {
  const now = new Date();
  const from = ymd(new Date(now.getTime() - 3 * 86400000));
  const to = ymd(new Date(now.getTime() + 7 * 86400000));

  const events = await getBzzoiroEventsInRange(from, to, bzzoiroLeagueId);
  return events
    .filter((e) => e && e.event_date && e.home_team && e.away_team)
    .map((e) => ({
      id: `bz-${e.id}`,
      status: (e.status ?? '').toLowerCase(),
      startTime: e.event_date,
      homeTeam: e.home_team,
      awayTeam: e.away_team,
      homeScore: e.home_score,
      awayScore: e.away_score,
      minute: e.current_minute,
    }))
    .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
}

export default async function LeaguePage({
  params,
}: {
  params: { id: string };
}) {
  const leagueId = parseInt(params.id, 10);
  if (!Number.isFinite(leagueId)) notFound();

  const league = findLeagueById(leagueId);
  if (!league) notFound();

  const [fixtures, standings, topScorers] = await Promise.all([
    getLeagueFixtures(league.id),
    league.afId ? getLeagueStandings(league.afId) : Promise.resolve(null),
    league.afId ? getLeagueTopScorers(league.afId) : Promise.resolve(null),
  ]);

  const displayName = resolveLeagueName(league.id, league.name);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary-container/25 blur-[130px] rounded-full" />
      </div>

      <main className="relative z-10 w-full bg-surface-container-lowest min-h-screen">
        <div className="max-w-5xl mx-auto w-full px-3 sm:px-4 md:px-6 py-3 md:py-6 flex flex-col gap-4 md:gap-5">

          <Link
            href="/football"
            className="inline-flex items-center gap-1 text-on-surface-variant hover:text-on-surface text-[11px] md:text-xs uppercase tracking-wider font-bold w-fit"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back
          </Link>

          {/* Header */}
          <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-xl p-4 md:p-5">
            <div className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1.5">
              <span className="material-symbols-outlined text-[14px] text-primary">
                emoji_events
              </span>
              League
            </div>
            <h1 className="text-xl md:text-3xl font-black text-on-surface tracking-tight">
              {displayName}
            </h1>
            <p className="text-[11px] md:text-sm text-on-surface-variant mt-1">
              {league.country}
            </p>
          </section>

          {/* Standings */}
          {standings && standings.length > 0 && (
            <LeagueStandings standings={standings} />
          )}

          {/* Fixtures */}
          <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 sm:px-4 md:px-5 py-3 border-b border-surface-container-highest/40">
              <span className="material-symbols-outlined text-[18px] text-primary">
                calendar_month
              </span>
              <h2 className="text-sm md:text-base font-extrabold uppercase tracking-tight text-on-surface">
                Fixtures &amp; Results
              </h2>
              <span className="text-[10px] md:text-xs text-on-surface-variant ml-auto">
                {fixtures.length} in window
              </span>
            </div>

            {fixtures.length === 0 ? (
              <div className="p-6 md:p-8 text-center">
                <span className="material-symbols-outlined text-[36px] text-on-surface-variant mb-2">
                  event_busy
                </span>
                <p className="text-xs text-on-surface-variant">
                  No matches scheduled in the next 7 days.
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {fixtures.map((f) => {
                  const finished = ['finished', 'ft'].some((x) =>
                    f.status.includes(x)
                  );
                  const live = f.status.includes('progress') || f.status.includes('live') || f.status.includes('1h') || f.status.includes('2h');
                  return (
                    <Link
                      key={f.id}
                      href={`/football/${f.id}`}
                      className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 border-t border-surface-container-highest/30 first:border-t-0 hover:bg-surface-container/40 transition-colors"
                    >
                      <div className="text-[10px] md:text-[11px] text-on-surface-variant tabular-nums shrink-0 w-20 md:w-28">
                        {fmtKickoff(f.startTime)}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center gap-2 justify-center">
                        <span className="text-[12px] md:text-sm text-on-surface truncate text-right flex-1">
                          {f.homeTeam}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] md:text-sm font-bold tabular-nums shrink-0 ${
                          live
                            ? 'bg-error-container/30 text-error'
                            : 'bg-surface-container-high text-on-surface'
                        }`}>
                          {finished || live
                            ? `${f.homeScore ?? 0} – ${f.awayScore ?? 0}`
                            : '—'}
                        </span>
                        <span className="text-[12px] md:text-sm text-on-surface truncate flex-1">
                          {f.awayTeam}
                        </span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider shrink-0 hidden sm:inline">
                        {finished ? 'FT' : live ? 'LIVE' : ''}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Top scorers */}
          {topScorers && topScorers.length > 0 && (
            <LeagueTopScorers scorers={topScorers} />
          )}

        </div>
      </main>
    </div>
  );
}
