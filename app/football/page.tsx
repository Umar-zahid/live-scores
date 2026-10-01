import Link from 'next/link';
import { FootballMatch } from '@/types';
import { getFootballMatches } from '@/lib/football-api';

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

function EventIcon({ type }: { type: string }) {
  if (type === 'goal') {
    return (
      <span className="material-symbols-outlined text-[14px] text-primary">
        sports_soccer
      </span>
    );
  }
  if (type === 'yellow_card') {
    return (
      <span
        className="inline-block w-2.5 h-3.5 rounded-[2px] bg-yellow-400 shrink-0"
        aria-label="Yellow card"
      />
    );
  }
  if (type === 'red_card') {
    return (
      <span
        className="inline-block w-2.5 h-3.5 rounded-[2px] bg-error shrink-0"
        aria-label="Red card"
      />
    );
  }
  if (type === 'substitution') {
    return (
      <span className="material-symbols-outlined text-[14px] text-secondary">
        swap_horiz
      </span>
    );
  }
  return (
    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
      circle
    </span>
  );
}

function StatusBadge({ match }: { match: FootballMatch }) {
  if (match.status === 'live') {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container/20 border border-error/30 shrink-0">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-error"></span>
        </span>
        <span className="font-label-sm text-[9px] sm:text-label-sm text-error uppercase font-extrabold tracking-wider">
          {`LIVE ${match.minute ?? ''}'`}
        </span>
      </div>
    );
  }
  if (match.status === 'halftime') {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        <span className="font-label-sm text-[9px] sm:text-label-sm text-amber-400 uppercase font-extrabold tracking-wider">
          HT
        </span>
      </div>
    );
  }
  if (match.status === 'upcoming') {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high border border-surface-container-highest shrink-0">
        <span className="material-symbols-outlined text-outline text-[12px]">
          schedule
        </span>
        <span className="font-label-sm text-[9px] sm:text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
          {formatTime(match.startTime)}
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high/90 border border-surface-container-highest shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
      <span className="font-label-sm text-[9px] sm:text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
        FT
      </span>
    </div>
  );
}

function MatchRow({ match }: { match: FootballMatch }) {
  const { homeTeam, awayTeam } = match;
  const style = statusStyle[match.status] ?? statusStyle.upcoming;
  const isUpcoming = match.status === 'upcoming';
  const isFinished = match.status === 'finished';
  const homeWon = isFinished && homeTeam.score > awayTeam.score;
  const awayWon = isFinished && awayTeam.score > homeTeam.score;
  const events = [...match.events].sort((a, b) => a.minute - b.minute);

  return (
    <Link
      href={`/football/${match.id}`}
      className={`match-card group relative block bg-surface-container-low/40 backdrop-blur-sm border border-surface-container-highest/40 rounded-lg p-3 md:p-5 overflow-hidden transition-all duration-200 hover:bg-surface-container-low/60 ${style.hover}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${style.bar}`}></div>

      {/* League + status row */}
      <div className="flex items-center justify-between gap-2 pb-2.5 md:pb-3.5 border-b border-surface-container-highest/40">
        <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
          <span className={`${style.bullet} text-[10px] font-bold shrink-0`}>•</span>
          {match.leagueLogo && (
            <img
              src={match.leagueLogo}
              alt=""
              className="w-3.5 h-3.5 md:w-4 md:h-4 object-contain shrink-0"
            />
          )}
          <span className="font-label-sm text-[9px] sm:text-label-sm text-on-surface-variant tracking-wider uppercase font-semibold truncate">
            {match.league}
          </span>
        </div>
        <StatusBadge match={match} />
      </div>

      {/* Teams + score — 5/2/5 grid, tightened on mobile */}
      <div className="py-3 md:py-4 grid grid-cols-12 items-center gap-1 md:gap-2">
        {/* Home */}
        <div className="col-span-5 flex items-center justify-end gap-1.5 md:gap-3 text-right min-w-0">
          <div className="min-w-0 flex items-center justify-end gap-1 md:gap-1.5">
            {homeWon && (
              <span className="material-symbols-outlined text-primary text-[14px] shrink-0 hidden sm:inline">
                check_circle
              </span>
            )}
            <p
              className={`text-[12px] sm:text-sm md:text-headline-md text-on-surface tracking-tight truncate font-extrabold transition-colors ${style.titleHover}`}
            >
              {homeTeam.name}
            </p>
          </div>
          <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-surface-container-highest border border-surface-container flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
            {homeTeam.logo ? (
              <img
                src={homeTeam.logo}
                alt={homeTeam.name}
                className="w-5 h-5 md:w-7 md:h-7 object-contain"
              />
            ) : (
              <span className="text-[10px] md:text-headline-md font-black text-primary">
                {homeTeam.name.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="col-span-2 flex flex-col items-center justify-center">
          <div
            className={`flex items-center justify-center gap-1 md:gap-2 px-1.5 md:px-3 py-0.5 md:py-1 rounded border ${
              isUpcoming
                ? 'bg-surface-container-lowest/50 border-surface-container-highest/40'
                : 'bg-surface-container-lowest/80 border-surface-container-highest/60'
            }`}
          >
            <span
              className={`text-[15px] sm:text-lg md:text-score-display font-extrabold tabular-nums ${
                isUpcoming ? 'text-outline' : 'text-on-surface'
              }`}
            >
              {isUpcoming ? '—' : homeTeam.score}
            </span>
            <span
              className={`text-[11px] md:text-headline-md font-bold ${
                isUpcoming ? 'text-outline/50' : 'text-outline'
              }`}
            >
              :
            </span>
            <span
              className={`text-[15px] sm:text-lg md:text-score-display font-extrabold tabular-nums ${
                isUpcoming || homeWon ? 'text-outline' : 'text-on-surface'
              }`}
            >
              {isUpcoming ? '—' : awayTeam.score}
            </span>
          </div>
        </div>

        {/* Away */}
        <div className="col-span-5 flex items-center justify-start gap-1.5 md:gap-3 text-left min-w-0">
          <div className={`w-7 h-7 md:w-10 md:h-10 rounded-full bg-surface-container-highest border border-surface-container flex items-center justify-center shrink-0 shadow-inner overflow-hidden ${homeWon ? 'opacity-75' : ''}`}>
            {awayTeam.logo ? (
              <img
                src={awayTeam.logo}
                alt={awayTeam.name}
                className="w-5 h-5 md:w-7 md:h-7 object-contain"
              />
            ) : (
              <span className="text-[10px] md:text-headline-md font-black text-secondary">
                {awayTeam.name.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex items-center gap-1 md:gap-1.5">
            <p
              className={`text-[12px] sm:text-sm md:text-headline-md tracking-tight truncate ${
                homeWon
                  ? 'text-on-surface-variant font-semibold'
                  : 'text-on-surface font-extrabold'
              }`}
            >
              {awayTeam.name}
            </p>
            {awayWon && (
              <span className="material-symbols-outlined text-primary text-[14px] shrink-0 hidden sm:inline">
                check_circle
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Events row — proper card icons now */}
      {events.length > 0 && (
        <div className="pt-2.5 md:pt-3 border-t border-surface-container-highest/40 flex flex-wrap items-center gap-1.5 md:gap-2">
          {events.slice(0, 3).map((e, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-0.5 rounded bg-surface-container-high/80 text-on-surface border border-surface-container-highest/50 text-[10px] md:text-body-sm max-w-full"
            >
              <EventIcon type={e.type} />
              <span className="font-bold text-primary shrink-0">{`${e.minute}'`}</span>
              <span className="truncate max-w-[90px] sm:max-w-[140px]">{e.player}</span>
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
            <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-gutter-desktop py-4 md:py-space-lg flex flex-col gap-3 md:gap-space-lg">
              {/* Header */}
              <header className="flex flex-col gap-3 md:gap-space-md pb-1 md:pb-space-sm">
                <div className="flex flex-col gap-1 md:gap-space-xs">
                  <div className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full bg-primary-container/20 text-primary">
                    <span className="material-symbols-outlined text-[12px]">
                      sports_soccer
                    </span>
                    <span className="font-label-sm text-[9px] sm:text-label-sm uppercase tracking-wider font-bold">
                      Football Live Telemetry
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-headline-xl uppercase tracking-tight text-on-surface font-black">
                    Football
                  </h1>
                  <p className="text-xs sm:text-sm md:text-body-md text-on-surface-variant">
                    Live Scores &amp; Match Center • Real-Time Data
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-surface-container-high/60 backdrop-blur-sm px-2.5 py-1 md:px-space-md md:py-1.5 rounded-full">
                    <span className="material-symbols-outlined text-primary text-[14px] md:text-[16px]">
                      calendar_today
                    </span>
                    <span className="font-label-md text-[10px] sm:text-label-md text-on-surface font-semibold tracking-wide uppercase">
                      {`${matches.length} Matches`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-error-container/25 px-2.5 py-1 md:px-space-md md:py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                    <span className="font-label-md text-[10px] sm:text-label-md text-error font-bold uppercase tracking-wider">
                      {`${liveCount} Live`}
                    </span>
                  </div>
                </div>
              </header>

              {/* Match list */}
              {matches.length === 0 ? (
                <div className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-8 md:p-12 text-center">
                  <span className="material-symbols-outlined text-[48px] md:text-[64px] text-on-surface-variant mb-3">
                    sports_soccer
                  </span>
                  <h2 className="text-base md:text-headline-md text-on-surface font-bold mb-1.5">
                    No Live Matches Right Now
                  </h2>
                  <p className="text-xs md:text-body-md text-on-surface-variant">
                    Check back soon — live matches will appear here automatically.
                  </p>
                </div>
              ) : (
                <section className="flex flex-col gap-2 md:gap-space-md">
                  {matches.map((match) => (
                    <MatchRow key={match.id} match={match} />
                  ))}
                </section>
              )}
            </div>
          </div>
        </main>
      </div>

      <footer className="w-full bg-surface-container-low border-t border-surface-container-highest/60 py-6 md:py-space-xl mt-8 md:mt-space-xl">
        <div className="max-w-7xl mx-auto px-3 md:px-gutter-desktop flex flex-col md:flex-row items-center justify-between gap-3 md:gap-space-lg text-on-surface-variant text-xs md:text-body-sm">
          <div className="flex items-center gap-1.5 md:gap-space-sm flex-wrap justify-center">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[12px] md:text-[14px]">
                sports_score
              </span>
            </div>
            <span className="font-label-md text-[10px] md:text-label-md text-on-surface uppercase">
              LIVESCOREHUB © 2025
            </span>
            <span className="text-outline hidden sm:inline">|</span>
            <span className="hidden sm:inline">Real-Time Multi-Sport Telemetry</span>
          </div>
          <div className="flex items-center gap-3 md:gap-space-lg font-label-md text-[10px] md:text-label-md flex-wrap justify-center">
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              Privacy
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              API Feeds
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
