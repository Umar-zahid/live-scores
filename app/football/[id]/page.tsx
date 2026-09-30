import Link from 'next/link';
import { FootballMatch } from '@/types';
import matchesData from '@/data/football.json';

const matches = matchesData as unknown as FootballMatch[];

const eventIcon: Record<string, string> = {
  goal: 'sports_soccer',
  yellow_card: 'square',
  red_card: 'square',
  substitution: 'published_with_changes',
};

const eventTypeLabel: Record<string, string> = {
  goal: 'Goal',
  yellow_card: 'Yellow Card',
  red_card: 'Red Card',
  substitution: 'Substitution',
};

const eventColor: Record<string, string> = {
  goal: 'text-primary',
  yellow_card: 'text-yellow-400',
  red_card: 'text-error',
  substitution: 'text-secondary',
};

const abbrMap: Record<string, string> = {
  Arsenal: 'ARS',
  Chelsea: 'CHE',
  Liverpool: 'LIV',
  'Man City': 'MCI',
  'Man United': 'MUN',
  Tottenham: 'TOT',
  Newcastle: 'NEW',
  Brighton: 'BHA',
  'Aston Villa': 'AVL',
  'West Ham': 'WHU',
};

const getAbbr = (name: string) =>
  abbrMap[name] ?? name.slice(0, 3).toUpperCase();

export default function MatchDetailPage({
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
            href="/football"
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
  const isFinished = match.status === 'finished';
  const isUpcoming = match.status === 'upcoming';
  const isHalftime = match.status === 'halftime';

  const homeAbbr = getAbbr(match.homeTeam.name);
  const awayAbbr = getAbbr(match.awayTeam.name);

  const homeWon = isFinished && match.homeTeam.score > match.awayTeam.score;
  const awayWon = isFinished && match.awayTeam.score > match.homeTeam.score;

  const sortedEvents = [...match.events].sort((a, b) => a.minute - b.minute);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary-container/25 blur-[130px] rounded-full"></div>
        <div className="absolute top-48 left-1/4 w-[360px] h-[220px] bg-secondary-container/20 blur-[110px] rounded-full"></div>
      </div>

      <main className="relative z-10 w-full bg-surface-container-lowest min-h-screen">
        <div className="flex flex-col w-full">
          <div className="max-w-7xl mx-auto w-full px-space-md md:px-gutter-desktop py-space-lg flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <Link
                href="/football"
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
                  className="flex items-center gap-space-xs px-space-md py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                  <span className="hidden sm:inline">Alerts On</span>
                </button>
              </div>
            </div>

            <section className="relative overflow-hidden rounded-xl bg-surface-container-low border border-surface-container-highest/40 shadow-xl p-space-md md:p-space-xl">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-36 bg-primary-container/10 blur-3xl pointer-events-none rounded-full"></div>

              <div className="relative z-10 flex items-center justify-between pb-space-md mb-space-md">
                <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md uppercase tracking-widest">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span>{match.league}</span>
                </div>
                <div className="flex items-center gap-space-xs bg-error-container/20 px-space-md py-1 rounded-full">
                  {isLive && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                      <span className="w-2 h-2 rounded-full bg-error -ml-3"></span>
                      <span className="font-label-sm text-label-sm text-error uppercase tracking-wider font-bold">
                        Live {match.minute}&apos;
                      </span>
                    </>
                  )}
                  {isHalftime && (
                    <span className="font-label-sm text-label-sm text-amber-400 uppercase tracking-wider font-bold">
                      HT
                    </span>
                  )}
                  {isFinished && (
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
                      Full Time
                    </span>
                  )}
                  {isUpcoming && (
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-space-lg items-center py-space-sm">
                <div className="md:col-span-4 flex items-center md:justify-end gap-space-md text-left md:text-right">
                  <div className="min-w-0 order-2 md:order-1">
                    <div className="flex items-center md:justify-end gap-space-xs">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary uppercase font-label-sm">
                        Home
                      </span>
                    </div>
                    <h1
                      className={`font-headline-lg text-headline-lg uppercase tracking-tight mt-0.5 ${
                        homeWon ? 'text-primary font-extrabold' : 'text-on-surface font-extrabold'
                      }`}
                    >
                      {match.homeTeam.name}
                    </h1>
                  </div>
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl flex items-center justify-center font-headline-md text-headline-md font-black shadow-md order-1 md:order-2 ${
                      homeWon
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-surface-container text-primary'
                    }`}
                  >
                    {homeAbbr}
                  </div>
                </div>

                <div className="md:col-span-4 flex flex-col items-center justify-center px-space-sm py-2">
                  <div className="flex items-baseline gap-space-md font-headline-xl text-headline-xl text-on-surface font-extrabold tracking-normal">
                    <span className="tabular-nums">{match.homeTeam.score}</span>
                    <span className="text-outline text-headline-lg font-bold">–</span>
                    <span className="tabular-nums">{match.awayTeam.score}</span>
                  </div>
                  {isLive && (
                    <div className="mt-space-xs inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container font-label-md text-label-md text-primary tracking-wider uppercase font-bold">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        timer
                      </span>
                      <span className="tabular-nums">{match.minute}&apos;</span>
                      <span className="text-on-surface-variant font-normal">
                        · {(match.minute ?? 0) > 45 ? '2nd Half' : '1st Half'}
                      </span>
                    </div>
                  )}
                  {isHalftime && (
                    <div className="mt-space-xs inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-amber-500/10 font-label-md text-label-md text-amber-400 tracking-wider uppercase font-bold">
                      Half Time
                    </div>
                  )}
                  {isFinished && (
                    <div className="mt-space-xs inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container font-label-md text-label-md text-on-surface-variant tracking-wider uppercase font-bold">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Full Time
                    </div>
                  )}
                </div>

                <div className="md:col-span-4 flex items-center justify-start gap-space-md text-left">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl flex items-center justify-center font-headline-md text-headline-md font-black shadow-md ${
                      awayWon
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
                        awayWon ? 'text-primary font-extrabold' : 'text-on-surface font-extrabold'
                      }`}
                    >
                      {match.awayTeam.name}
                    </h2>
                  </div>
                </div>
              </div>
            </section>

            {isLive && (
              <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-space-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md shadow-md">
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[22px]">
                      vital_signs
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                        In-Play Pulse ({match.minute}&apos;)
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface truncate">
                      {match.league} • {match.homeTeam.name} {match.homeTeam.score} - {match.awayTeam.score} {match.awayTeam.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  <button
                    className="flex items-center gap-space-xs px-space-md py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors font-label-md text-label-md"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      headphones
                    </span>
                    <span>Live Audio</span>
                  </button>
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              <section className="lg:col-span-7 flex flex-col gap-space-md rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-space-md md:p-space-lg shadow-lg">
                <div className="flex items-center justify-between pb-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold uppercase tracking-tight">
                      Match Statistics
                    </h2>
                  </div>
                </div>

                <div className="flex items-center justify-between px-space-sm py-1 bg-surface-container/60 rounded-lg text-on-surface font-label-md text-label-md uppercase">
                  <div className="flex items-center gap-space-xs text-primary font-bold">
                    <span className="w-3 h-3 rounded-sm bg-primary inline-block"></span>
                    <span>{match.homeTeam.name}</span>
                  </div>
                  <span className="text-on-surface-variant text-[11px] font-normal tracking-wider">
                    Team Comparison
                  </span>
                  <div className="flex items-center gap-space-xs text-secondary font-bold">
                    <span>{match.awayTeam.name}</span>
                    <span className="w-3 h-3 rounded-sm bg-secondary inline-block"></span>
                  </div>
                </div>

                <div className="flex flex-col gap-space-md mt-space-xs">
                  <div className="p-space-sm rounded-lg hover:bg-surface-container/40 transition-colors">
                    <div className="flex justify-between items-center mb-1 text-on-surface">
                      <span className="font-headline-md text-[18px] font-extrabold tabular-nums text-primary">
                        58%
                      </span>
                      <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                        Ball Possession
                      </span>
                      <span className="font-headline-md text-[18px] font-extrabold tabular-nums text-secondary">
                        42%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden flex">
                      <div className="h-full bg-primary" style={{ width: '58%' }}></div>
                      <div className="h-full bg-secondary" style={{ width: '42%' }}></div>
                    </div>
                  </div>

                  <div className="p-space-sm rounded-lg hover:bg-surface-container/40 transition-colors">
                    <div className="flex justify-between items-center mb-1 text-on-surface">
                      <span className="font-headline-md text-[18px] font-extrabold tabular-nums text-primary">
                        12
                      </span>
                      <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                        Total Shots
                      </span>
                      <span className="font-headline-md text-[18px] font-extrabold tabular-nums text-secondary">
                        7
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden flex">
                      <div className="h-full bg-primary" style={{ width: '63%' }}></div>
                      <div className="h-full bg-secondary" style={{ width: '37%' }}></div>
                    </div>
                  </div>

                  <div className="p-space-sm rounded-lg hover:bg-surface-container/40 transition-colors">
                    <div className="flex justify-between items-center mb-1 text-on-surface">
                      <span className="font-headline-md text-[18px] font-extrabold tabular-nums text-primary">
                        6
                      </span>
                      <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                        Shots on Target
                      </span>
                      <span className="font-headline-md text-[18px] font-extrabold tabular-nums text-secondary">
                        3
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden flex">
                      <div className="h-full bg-primary" style={{ width: '66%' }}></div>
                      <div className="h-full bg-secondary" style={{ width: '34%' }}></div>
                    </div>
                  </div>

                  <div className="p-space-sm rounded-lg hover:bg-surface-container/40 transition-colors">
                    <div className="flex justify-between items-center mb-1 text-on-surface">
                      <span className="font-headline-md text-[18px] font-extrabold tabular-nums text-primary">
                        8
                      </span>
                      <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                        Corner Kicks
                      </span>
                      <span className="font-headline-md text-[18px] font-extrabold tabular-nums text-secondary">
                        3
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden flex">
                      <div className="h-full bg-primary" style={{ width: '72%' }}></div>
                      <div className="h-full bg-secondary" style={{ width: '28%' }}></div>
                    </div>
                  </div>

                  <div className="p-space-sm rounded-lg hover:bg-surface-container/40 transition-colors">
                    <div className="flex justify-between items-center mb-1 text-on-surface">
                      <span className="font-headline-md text-[18px] font-extrabold tabular-nums text-primary">
                        86%
                      </span>
                      <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                        Pass Accuracy
                      </span>
                      <span className="font-headline-md text-[18px] font-extrabold tabular-nums text-secondary">
                        79%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden flex">
                      <div className="h-full bg-primary" style={{ width: '52%' }}></div>
                      <div className="h-full bg-secondary" style={{ width: '48%' }}></div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="lg:col-span-5 flex flex-col gap-space-md rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-space-md md:p-space-lg shadow-lg">
                <div className="flex items-center gap-space-xs pb-space-sm">
                  <span className="material-symbols-outlined text-[20px] text-primary">history</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold uppercase tracking-tight">
                    Match Events
                  </h2>
                </div>

                {sortedEvents.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No events yet.</p>
                ) : (
                  <div className="relative flex flex-col gap-space-xs mt-space-xs">
                    <div className="absolute left-[26px] top-4 bottom-4 w-0.5 bg-surface-container"></div>
                    {sortedEvents.map((event, idx) => {
                      const icon = eventIcon[event.type] ?? 'circle';
                      const label = eventTypeLabel[event.type] ?? event.type;
                      const color = eventColor[event.type] ?? 'text-on-surface';
                      const isGoal = event.type === 'goal';
                      const eventTeamName =
                        event.team === 'home'
                          ? match.homeTeam.name
                          : match.awayTeam.name;

                      return (
                        <div
                          key={idx}
                          className="relative flex items-start gap-space-md p-space-sm rounded-lg hover:bg-surface-container/50 transition-colors"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 font-label-md text-label-md font-black tabular-nums shadow-sm ${
                              isGoal
                                ? event.team === 'home'
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-secondary/20 text-secondary'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {event.minute}&apos;
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-space-xs">
                              <span className={`material-symbols-outlined text-[18px] ${color}`}>
                                {icon}
                              </span>
                              <span className="font-headline-md text-[15px] font-bold text-on-surface">
                                {event.player}
                              </span>
                            </div>
                            <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                              {label} · {eventTeamName}
                            </p>
                          </div>
                          <span className="text-on-surface-variant font-label-sm text-label-sm uppercase">
                            {event.team === 'home' ? homeAbbr : awayAbbr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
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
            <Link
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              href="#"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              href="#"
            >
              API Feeds
            </Link>
            <Link
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              href="#"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
