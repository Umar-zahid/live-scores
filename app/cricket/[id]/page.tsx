import Link from 'next/link';
import { CricketMatch } from '@/types';
import matchesData from '@/data/cricket.json';

const matches = matchesData as unknown as CricketMatch[];

const abbrMap: Record<string, string> = {
  Australia: 'AUS',
  India: 'IND',
  England: 'ENG',
  Pakistan: 'PAK',
  'Mumbai Indians': 'MI',
  'Chennai Super Kings': 'CSK',
  'South Africa': 'RSA',
  'New Zealand': 'NZ',
};

const getAbbr = (name: string) =>
  abbrMap[name] ?? name.slice(0, 3).toUpperCase();

export default function CricketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const match = matches.find((m) => m.id === params.id);

  if (!match) {
    return (
      <main className="min-h-screen bg-surface-container-lowest p-4">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/cricket"
            className="mb-4 inline-block text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ← Back to matches
          </Link>
          <div className="rounded-lg bg-surface-container-low border border-surface-container-highest p-6 text-center">
            <h1 className="mb-1 text-xl font-bold text-on-surface">Match not found</h1>
            <p className="text-sm text-on-surface-variant">
              There is no match with ID &quot;{params.id}&quot;.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const isLive = match.status === 'live';
  const isUpcoming = match.status === 'upcoming';
  const isFinished = match.status === 'finished';

  const team1Batting = match.currentInnings === 1;
  const team2Batting = match.currentInnings === 2;
  const team1Won = isFinished && match.team1.score > match.team2.score;
  const team2Won = isFinished && match.team2.score > match.team1.score;

  const team1HasScore = match.team1.overs !== '0.0';
  const team2HasScore = match.team2.overs !== '0.0';

  const homeAbbr = getAbbr(match.team1.name);
  const awayAbbr = getAbbr(match.team2.name);

  const formattedTime = new Date(match.startTime).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-secondary-container/25 blur-[130px] rounded-full"></div>
        <div className="absolute top-48 left-1/4 w-[360px] h-[220px] bg-primary-container/20 blur-[110px] rounded-full"></div>
        <div className="absolute top-48 right-1/4 w-[360px] h-[220px] bg-tertiary-container/15 blur-[110px] rounded-full"></div>
      </div>

      <main className="relative z-10 w-full bg-surface-container-lowest min-h-screen">
        <div className="flex flex-col w-full">
          <div className="max-w-7xl mx-auto w-full px-space-md md:px-gutter-desktop py-space-lg flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <Link
                href="/cricket"
                className="inline-flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider transition-colors duration-150 group"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                Back to matches
              </Link>
              <div className="flex items-center gap-space-sm">
                <button
                  className="flex items-center gap-space-xs px-space-md py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">push_pin</span>
                  <span className="hidden sm:inline">Pin Match</span>
                </button>
                <button
                  className="flex items-center gap-space-xs px-space-md py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-secondary transition-colors font-label-md text-label-md"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                  <span className="hidden sm:inline">Alerts On</span>
                </button>
              </div>
            </div>

            <section className="relative overflow-hidden rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-xl p-space-md md:p-space-xl">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-36 bg-secondary-container/10 blur-3xl pointer-events-none rounded-full"></div>

              <div className="relative z-10 flex items-center justify-between pb-space-md mb-space-md">
                <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md uppercase tracking-widest">
                  <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span>{match.league}</span>
                </div>

                <div className="flex items-center gap-space-xs bg-error-container/20 px-space-md py-1 rounded-full">
                  {isLive && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                      <span className="w-2 h-2 rounded-full bg-error -ml-3"></span>
                      <span className="font-label-sm text-label-sm text-error uppercase tracking-wider font-bold">
                        Live {match.currentInnings === 2 ? match.team2.overs : match.team1.overs} Ov
                      </span>
                    </>
                  )}
                  {isUpcoming && (
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-bold">
                      Upcoming
                    </span>
                  )}
                  {isFinished && (
                    <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
                      Match Ended
                    </span>
                  )}
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-space-lg items-center py-space-sm">
                <div className="md:col-span-4 flex items-center md:justify-end gap-space-md text-left md:text-right">
                  <div className="min-w-0 order-2 md:order-1">
                    <div className="flex items-center md:justify-end gap-space-xs">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-secondary/15 text-secondary uppercase font-label-sm">
                        Home
                      </span>
                    </div>
                    <h1
                      className={`font-headline-lg text-headline-lg uppercase tracking-tight mt-0.5 ${
                        team1Won ? 'text-primary font-extrabold' : 'text-on-surface font-extrabold'
                      }`}
                    >
                      {match.team1.name}
                    </h1>
                  </div>
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl flex items-center justify-center font-headline-md text-headline-md font-black shadow-md order-1 md:order-2 ${
                      team1Won
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-surface-container text-secondary'
                    }`}
                  >
                    {homeAbbr}
                  </div>
                </div>

                <div className="md:col-span-4 flex flex-col items-center justify-center px-space-sm py-2">
                  {team1HasScore || team2HasScore ? (
                    <>
                      <div className="flex flex-col items-center gap-1">
                        {team1HasScore && (
                          <div className="flex items-baseline gap-space-sm">
                            <span
                              className={`font-headline-lg text-headline-lg tabular-nums font-extrabold ${
                                isLive && team1Batting ? 'text-secondary' : 'text-on-surface'
                              }`}
                            >
                              {`${match.team1.score}/${match.team1.wickets}`}
                            </span>
                            <span className="font-label-md text-label-md text-on-surface-variant tabular-nums">
                              ({match.team1.overs} ov)
                            </span>
                          </div>
                        )}
                        {team2HasScore && (
                          <div className="flex items-baseline gap-space-sm">
                            <span
                              className={`font-headline-lg text-headline-lg tabular-nums font-extrabold ${
                                isLive && team2Batting ? 'text-secondary' : 'text-on-surface'
                              }`}
                            >
                              {`${match.team2.score}/${match.team2.wickets}`}
                            </span>
                            <span className="font-label-md text-label-md text-on-surface-variant tabular-nums">
                              ({match.team2.overs} ov)
                            </span>
                          </div>
                        )}
                      </div>

                      {isLive && (
                        <div className="mt-space-xs inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container font-label-md text-label-md text-secondary tracking-wider uppercase font-bold">
                          <span className="material-symbols-outlined text-[16px]">timer</span>
                          {team2Batting ? '2nd Innings' : '1st Innings'}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 px-space-md py-2 rounded-full bg-surface-container">
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        schedule
                      </span>
                      <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-bold">
                        Starts {formattedTime} GMT
                      </span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-4 flex items-center justify-start gap-space-md text-left">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl flex items-center justify-center font-headline-md text-headline-md font-black shadow-md ${
                      team2Won
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-surface-container text-secondary'
                    }`}
                  >
                    {awayAbbr}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-space-xs">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-secondary/15 text-secondary uppercase font-label-sm">
                        Away
                      </span>
                    </div>
                    <h2
                      className={`font-headline-lg text-headline-lg uppercase tracking-tight mt-0.5 ${
                        team2Won ? 'text-primary font-extrabold' : 'text-on-surface font-extrabold'
                      }`}
                    >
                      {match.team2.name}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-space-md pt-space-md border-t border-surface-container-highest/40 flex flex-wrap items-center justify-between gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    sports_cricket
                  </span>
                  <span>{match.league}</span>
                </div>
                {isLive && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      speed
                    </span>
                    <span>
                      Run Rate:{' '}
                      <strong className="text-secondary tabular-nums">
                        {match.runRate.toFixed(2)}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </section>

            {isLive && (match.statusText || match.lastOver || match.striker || match.bowler) && (
              <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-space-md md:p-space-lg shadow-lg">
                <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-container-highest/40">
                  <div className="flex items-center gap-space-md min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary text-[22px]">
                        sports_cricket
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">
                        Match Status
                      </span>
                      <p className="font-headline-md text-headline-md text-on-surface font-bold truncate">
                        {match.statusText}
                      </p>
                    </div>
                  </div>
                </div>

                {match.lastOver && match.lastOver.length > 0 && (
                  <div className="mb-space-md pb-space-md border-b border-surface-container-highest/30">
                    <div className="flex items-center justify-between flex-wrap gap-space-sm">
                      <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                        This Over
                      </span>
                      <div className="flex items-center gap-1.5">
                        {match.lastOver.map((ball, idx) => {
                          let badgeStyle = 'bg-surface-container-highest text-on-surface';
                          if (ball === 'W') {
                            badgeStyle = 'bg-error-container text-on-error-container font-bold';
                          } else if (ball === '4' || ball === '6') {
                            badgeStyle = 'bg-secondary-container text-on-secondary font-bold';
                          }
                          return (
                            <span
                              key={idx}
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md font-bold tabular-nums ${badgeStyle}`}
                            >
                              {ball}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {(match.striker || match.bowler) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    {match.striker && (
                      <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container/40">
                        <div className="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-secondary text-[20px]">
                            sports_cricket
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">
                            Striker
                          </span>
                          <span className="font-headline-md text-body-lg text-on-surface font-bold truncate block">
                            {match.striker.name}
                          </span>
                          <span className="font-label-md text-label-md text-secondary font-bold tabular-nums">
                            {match.striker.runs}* ({match.striker.balls})
                          </span>
                        </div>
                      </div>
                    )}

                    {match.bowler && (
                      <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container/40">
                        <div className="w-10 h-10 rounded-lg bg-tertiary-container/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-tertiary text-[20px]">
                            sports_baseball
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">
                            Bowler
                          </span>
                          <span className="font-headline-md text-body-lg text-on-surface font-bold truncate block">
                            {match.bowler.name}
                          </span>
                          <span className="font-label-md text-label-md text-tertiary font-bold tabular-nums">
                            {match.bowler.wickets}/{match.bowler.runs}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {isUpcoming && (
              <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-space-lg text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-2">
                  hourglass_empty
                </span>
                <p className="text-body-lg text-on-surface-variant">
                  Match starts at {formattedTime} GMT. Check back for live coverage.
                </p>
              </section>
            )}

            {isFinished && (
              <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-space-md md:p-space-lg shadow-lg">
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[24px]">
                      emoji_events
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                      Result
                    </span>
                    <p className="font-headline-md text-headline-md text-on-surface font-bold">
                      {match.statusText}
                    </p>
                  </div>
                </div>
              </section>
            )}
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
              LIVESCOREHUB © 2025
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
    </div>
  );
}
