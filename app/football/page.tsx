import Link from 'next/link';
import { FootballMatch } from '@/types';
import { getFootballMatches } from '@/lib/football-api';

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

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });

const statusStyle = {
  live: {
    bar: 'bg-primary shadow-[0_0_8px_rgba(75,226,119,0.7)]',
    hover: 'hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5',
    bullet: 'text-primary',
    titleHover: 'group-hover:text-primary',
  },
  halftime: {
    bar: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    hover: 'hover:border-amber-500/40',
    bullet: 'text-on-surface-variant',
    titleHover: 'group-hover:text-amber-400',
  },
  upcoming: {
    bar: 'bg-slate-600',
    hover: 'opacity-95 hover:opacity-100',
    bullet: 'text-outline',
    titleHover: 'group-hover:text-primary',
  },
  finished: {
    bar: 'bg-outline-variant',
    hover: '',
    bullet: 'text-outline',
    titleHover: '',
  },
} as const;

function StatusBadge({ match }: { match: FootballMatch }) {
  if (match.status === 'live') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container/20 border border-error/30">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
        </span>
        <span className="font-label-sm text-label-sm text-error uppercase font-extrabold tracking-wider">
          {`LIVE ${match.minute ?? ''}'`}
        </span>
      </div>
    );
  }
  if (match.status === 'halftime') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
        <span className="font-label-sm text-label-sm text-amber-400 uppercase font-extrabold tracking-wider">
          HT
        </span>
      </div>
    );
  }
  if (match.status === 'upcoming') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high border border-surface-container-highest">
        <span className="material-symbols-outlined text-outline text-[14px]">
          schedule
        </span>
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
          {`UPCOMING ${formatTime(match.startTime)}`}
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container-high/90 border border-surface-container-highest">
      <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
        FT
      </span>
    </div>
  );
}

function PeriodLabel({ match }: { match: FootballMatch }) {
  if (match.status === 'live') {
    const text = (match.minute ?? 0) > 45 ? '2nd Half' : '1st Half';
    return (
      <span className="font-label-sm text-label-sm text-error uppercase tracking-widest mt-1 font-bold">
        {text}
      </span>
    );
  }
  if (match.status === 'halftime') {
    return (
      <span className="font-label-sm text-label-sm text-amber-400 uppercase tracking-widest mt-1 font-bold">
        Break
      </span>
    );
  }
  if (match.status === 'upcoming') {
    return (
      <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest mt-1">
        {`${formatTime(match.startTime)} GMT`}
      </span>
    );
  }
  return (
    <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest mt-1">
      Full Time
    </span>
  );
}

function MatchRow({ match }: { match: FootballMatch }) {
  const { homeTeam, awayTeam } = match;
  const style = statusStyle[match.status] ?? statusStyle.upcoming;
  const isUpcoming = match.status === 'upcoming';
  const isFinished = match.status === 'finished';
  const homeWon = isFinished && homeTeam.score > awayTeam.score;
  const awayWon = isFinished && awayTeam.score > homeTeam.score;
  const homeAbbr = getAbbr(homeTeam.name);
  const awayAbbr = getAbbr(awayTeam.name);
  const events = [...match.events].sort((a, b) => a.minute - b.minute);

  return (
    <Link
      href={`/football/${match.id}`}
      className={`match-card group relative block bg-surface-container-low/40 backdrop-blur-sm border border-surface-container-highest/40 rounded-lg p-5 overflow-hidden transition-all duration-200 hover:bg-surface-container-low/60 ${style.hover}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${style.bar}`}></div>

      <div className="flex items-center justify-between pb-3.5 border-b border-surface-container-highest/40">
        <div className="flex items-center gap-2">
          <span className={`${style.bullet} text-[10px] font-bold`}>•</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase font-semibold truncate">
            {match.league}
          </span>
        </div>
        <StatusBadge match={match} />
      </div>

      <div className="py-4 grid grid-cols-12 items-center gap-2">
        <div className="col-span-5 flex items-center justify-end gap-3 text-right">
          <div className="min-w-0">
            <div className="flex items-center justify-end gap-1.5">
              {homeWon && (
                <span className="material-symbols-outlined text-primary text-[16px]">
                  check_circle
                </span>
              )}
              <p
                className={`font-headline-md text-headline-md text-on-surface tracking-tight truncate font-extrabold transition-colors ${style.titleHover}`}
              >
                {homeTeam.name}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-surface-container flex items-center justify-center shrink-0 shadow-inner">
            <span className="font-headline-md text-headline-md font-black text-primary">
              {homeAbbr}
            </span>
          </div>
        </div>

        <div className="col-span-2 flex flex-col items-center justify-center">
          <div
            className={`flex items-center justify-center gap-2 px-3 py-1 rounded border w-full max-w-[96px] ${
              isUpcoming
                ? 'bg-surface-container-lowest/50 border-surface-container-highest/40'
                : 'bg-surface-container-lowest/80 border-surface-container-highest/60'
            }`}
          >
            <span
              className={`font-score-display text-score-display font-extrabold tabular-nums ${
                isUpcoming ? 'text-outline' : 'text-on-surface'
              }`}
            >
              {isUpcoming ? '—' : homeTeam.score}
            </span>
            <span
              className={`font-headline-md text-headline-md font-bold ${
                isUpcoming ? 'text-outline/50' : 'text-outline'
              }`}
            >
              :
            </span>
            <span
              className={`font-score-display text-score-display font-extrabold tabular-nums ${
                isUpcoming || homeWon ? 'text-outline' : 'text-on-surface'
              }`}
            >
              {isUpcoming ? '—' : awayTeam.score}
            </span>
          </div>
          <PeriodLabel match={match} />
        </div>

        <div className="col-span-5 flex items-center justify-start gap-3 text-left">
          <div
            className={`w-10 h-10 rounded-full bg-surface-container-highest border border-surface-container flex items-center justify-center shrink-0 shadow-inner ${
              homeWon ? 'opacity-75' : ''
            }`}
          >
            <span className="font-headline-md text-headline-md font-black text-secondary">
              {awayAbbr}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {awayWon && (
                <span className="material-symbols-outlined text-primary text-[16px]">
                  check_circle
                </span>
              )}
              <p
                className={`font-headline-md text-headline-md tracking-tight truncate ${
                  homeWon
                    ? 'text-on-surface-variant font-semibold'
                    : 'text-on-surface font-extrabold'
                }`}
              >
                {awayTeam.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {events.length > 0 && (
        <div className="pt-3 border-t border-surface-container-highest/40 flex flex-wrap items-center gap-2">
          {events.slice(0, 4).map((e, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-high/80 text-on-surface border border-surface-container-highest/50 text-body-sm"
            >
              <span className="material-symbols-outlined text-[14px]">
                {e.type === 'goal'
                  ? 'sports_soccer'
                  : e.type === 'yellow_card'
                  ? 'square'
                  : e.type === 'red_card'
                  ? 'square'
                  : 'swap_horiz'}
              </span>
              <span className="font-bold text-primary">{`${e.minute}'`}</span>
              <span>{e.player}</span>
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

export default async function FootballPage() {
  const matches = await getFootballMatches();
  const liveCount = matches.filter((m) => m.status === 'live').length;

  return (
    <>
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary-container/25 blur-[130px] rounded-full"></div>
          <div className="absolute top-48 left-1/4 w-[360px] h-[220px] bg-secondary-container/20 blur-[110px] rounded-full"></div>
          <div className="absolute top-48 right-1/4 w-[360px] h-[220px] bg-tertiary-container/15 blur-[110px] rounded-full"></div>
        </div>

        <main className="relative z-10 w-full bg-surface-container-lowest min-h-screen">
          <div className="flex flex-col w-full">
            <div className="max-w-7xl mx-auto w-full px-gutter md:px-gutter-desktop py-space-lg flex flex-col gap-space-lg">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-sm">
                <div className="flex flex-col gap-space-xs">
                  <div className="inline-flex items-center gap-space-xs self-start px-space-sm py-0.5 rounded-full bg-primary-container/20 text-primary">
                    <span className="material-symbols-outlined text-[14px]">
                      sports_soccer
                    </span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">
                      Football Live Telemetry
                    </span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl uppercase tracking-tight text-on-surface font-black">
                    Football
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Live Scores &amp; Match Center • Real-Time Data
                  </p>
                </div>

                <div className="flex items-center gap-space-sm flex-wrap">
                  <div className="flex items-center gap-space-xs bg-surface-container-high/60 backdrop-blur-sm px-space-md py-1.5 rounded-full">
                    <span className="material-symbols-outlined text-primary text-[16px]">
                      calendar_today
                    </span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wide uppercase">
                      {`${matches.length} Matches Live`}
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs bg-error-container/25 px-space-md py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                    <span className="font-label-md text-label-md text-error font-bold uppercase tracking-wider">
                      {`${liveCount} Live Now`}
                    </span>
                  </div>
                </div>
              </header>

              {matches.length === 0 ? (
                <div className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-12 text-center">
                  <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">
                    sports_soccer
                  </span>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">
                    No Live Matches Right Now
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Check back soon — live matches will appear here automatically.
                  </p>
                </div>
              ) : (
                <section className="flex flex-col gap-space-md">
                  {matches.map((match) => (
                    <MatchRow key={match.id} match={match} />
                  ))}
                </section>
              )}
            </div>
          </div>
        </main>
      </div>

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
    </>
  );
}
