import Link from 'next/link';
import { getFootballMatches } from '@/lib/football-api';

function StatusPill({ status, minute }: { status: string; minute?: number }) {
  if (status === 'live') {
    return (
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
          {minute ?? 0}&apos; Live
        </span>
      </div>
    );
  }
  if (status === 'halftime') {
    return (
      <span className="font-label-sm text-label-sm text-amber-400 uppercase tracking-wider font-bold">
        HT
      </span>
    );
  }
  return (
    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
      {status === 'upcoming' ? 'Upcoming' : 'FT'}
    </span>
  );
}

export default async function HomePage() {
  const matches = await getFootballMatches();
  const live = matches.filter((m) => m.status === 'live');
  const featured = matches.slice(0, 4);
  const liveCount = live.length;
  const totalCount = matches.length;

  return (
    <>
      <main className="w-full bg-surface-container-lowest min-h-screen">
        <div className="flex flex-col w-full">
          <div className="relative w-full overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary/20 blur-[130px] rounded-full"></div>
              <div className="absolute top-48 left-1/4 w-[360px] h-[220px] bg-secondary-container/20 blur-[110px] rounded-full"></div>
              <div className="absolute top-48 right-1/4 w-[360px] h-[220px] bg-tertiary-container/15 blur-[110px] rounded-full"></div>
            </div>

            <section className="relative z-10 max-w-4xl mx-auto text-center px-4 pt-16 pb-12 md:pt-20 md:pb-16 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/90 shadow-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                  {liveCount > 0 ? `${liveCount} Matches Live Now` : 'Live Match Centers Active'}
                </span>
              </div>
              <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface tracking-tight mb-4 max-w-3xl">
                Live Scores. All Sports. <span className="text-primary">One Place.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                Real-time scores for Football, Cricket, and Formula 1
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2 bg-surface-container px-3.5 py-1.5 rounded-full text-on-surface-variant font-label-md text-label-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span>{totalCount}+ In-Play Events</span>
                </div>
                <div className="flex items-center gap-2 bg-surface-container px-3.5 py-1.5 rounded-full text-on-surface-variant font-label-md text-label-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span>Sub-second Latency</span>
                </div>
                <div className="flex items-center gap-2 bg-surface-container px-3.5 py-1.5 rounded-full text-on-surface-variant font-label-md text-label-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  <span>Official Telemetry Feeds</span>
                </div>
              </div>
            </section>

            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {/* Football card — real data */}
                <Link
                  className="group flex flex-col justify-between rounded-lg bg-surface-container-low hover:bg-surface-container transition-all duration-200 overflow-hidden shadow-md hover:shadow-xl relative text-left"
                  href="/football"
                >
                  <div className="h-1 w-full bg-primary"></div>
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-200">
                        <span className="material-symbols-outlined text-[28px]">
                          sports_soccer
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-primary">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="font-label-sm text-label-sm uppercase tracking-wide">
                          {liveCount > 0 ? `${liveCount} live now` : 'No live'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-5">
                      <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight group-hover:text-primary transition-colors">
                        Football
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Live fixtures from around the world
                      </p>
                    </div>

                    <div className="mt-6 space-y-2.5">
                      {featured.length === 0 && (
                        <div className="bg-surface-container-lowest rounded p-3 text-center text-on-surface-variant text-body-sm">
                          No matches in play right now
                        </div>
                      )}
                      {featured.map((m) => (
                        <div
                          key={m.id}
                          className="bg-surface-container-lowest rounded p-3 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm font-semibold truncate">
                              {m.homeTeam.logo && (
                                <img
                                  src={m.homeTeam.logo}
                                  alt=""
                                  className="w-4 h-4 object-contain shrink-0"
                                />
                              )}
                              <span className="truncate">{m.homeTeam.name}</span>
                              <span className="text-on-surface-variant font-normal">vs</span>
                              {m.awayTeam.logo && (
                                <img
                                  src={m.awayTeam.logo}
                                  alt=""
                                  className="w-4 h-4 object-contain shrink-0"
                                />
                              )}
                              <span className="truncate">{m.awayTeam.name}</span>
                            </div>
                            <div className="mt-0.5">
                              <StatusPill status={m.status} minute={m.minute} />
                            </div>
                          </div>
                          <div className="bg-surface-container-high px-2.5 py-1 rounded font-score-display text-score-display text-on-surface flex items-center gap-1 shrink-0">
                            <span>{m.homeTeam.score}</span>
                            <span className="text-on-surface-variant text-body-sm font-normal">
                              -
                            </span>
                            <span>{m.awayTeam.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 flex items-center justify-between text-primary font-label-md text-label-md uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        View Live Scores
                        <span className="material-symbols-outlined text-[18px]">
                          arrow_forward
                        </span>
                      </span>
                      <span className="text-on-surface-variant font-body-sm text-body-sm lowercase text-[11px]">
                        {totalCount} fixtures today
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Cricket card — placeholder */}
                <Link
                  className="group flex flex-col justify-between rounded-lg bg-surface-container-low hover:bg-surface-container transition-all duration-200 overflow-hidden shadow-md hover:shadow-xl relative text-left"
                  href="/cricket"
                >
                  <div className="h-1 w-full bg-secondary-container"></div>
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary group-hover:scale-105 transition-transform duration-200">
                        <span className="material-symbols-outlined text-[28px]">
                          sports_cricket
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-secondary">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                        <span className="font-label-sm text-label-sm uppercase tracking-wide">
                          Coming soon
                        </span>
                      </div>
                    </div>
                    <div className="mt-5">
                      <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight group-hover:text-secondary transition-colors">
                        Cricket
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        T20, ODI, Test matches
                      </p>
                    </div>
                    <div className="mt-6 bg-surface-container-lowest rounded p-4 text-center text-on-surface-variant font-body-sm text-body-sm">
                      Live cricket feed integration in progress
                    </div>
                    <div className="mt-6 pt-4 flex items-center justify-between text-secondary font-label-md text-label-md uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        View Cricket
                        <span className="material-symbols-outlined text-[18px]">
                          arrow_forward
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>

                {/* F1 card — placeholder */}
                <Link
                  className="group flex flex-col justify-between rounded-lg bg-surface-container-low hover:bg-surface-container transition-all duration-200 overflow-hidden shadow-md hover:shadow-xl relative text-left"
                  href="/f1"
                >
                  <div className="h-1 w-full bg-error-container"></div>
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-error group-hover:scale-105 transition-transform duration-200">
                        <span className="material-symbols-outlined text-[28px]">
                          sports_motorsports
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-error">
                        <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                        <span className="font-label-sm text-label-sm uppercase tracking-wide">
                          Coming soon
                        </span>
                      </div>
                    </div>
                    <div className="mt-5">
                      <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight group-hover:text-error transition-colors">
                        Formula 1
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Race standings, lap times, pit stops
                      </p>
                    </div>
                    <div className="mt-6 bg-surface-container-lowest rounded p-4 text-center text-on-surface-variant font-body-sm text-body-sm">
                      Live F1 feed integration in progress
                    </div>
                    <div className="mt-6 pt-4 flex items-center justify-between text-error font-label-md text-label-md uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        View F1
                        <span className="material-symbols-outlined text-[18px]">
                          arrow_forward
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-low border-t border-surface-container-highest/60 py-space-xl mt-space-xl">
        <div className="max-w-7xl mx-auto px-gutter-desktop flex flex-col md:flex-row items-center justify-between gap-space-lg text-on-surface-variant font-body-sm text-body-sm">
          <div className="flex items-center gap-space-sm">
            <div className="w-6 h-6 rounded bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[14px]">
                sports_score
              </span>
            </div>
            <span className="font-label-md text-label-md text-on-surface uppercase">
              LiveScoreHub © 2025
            </span>
            <span className="text-outline">|</span>
            <span>Real-Time Multi-Sport Telemetry</span>
          </div>
          <div className="flex items-center gap-space-lg font-label-md text-label-md">
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              Privacy Policy
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              API Feeds
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
