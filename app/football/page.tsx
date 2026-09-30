import Link from 'next/link';
import { FootballMatch } from '@/types';
import matchesData from '@/data/football.json';

const matches = matchesData as unknown as FootballMatch[];

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });

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

const abbrColor: Record<string, string> = {
  ARS: 'text-primary',
  CHE: 'text-secondary',
  LIV: 'text-tertiary-container',
  MCI: 'text-secondary-fixed-dim',
  MUN: 'text-error',
  TOT: 'text-on-surface',
  NEW: 'text-on-surface-variant',
  BHA: 'text-secondary',
  AVL: 'text-tertiary',
  WHU: 'text-on-surface-variant',
};

const getAbbr = (name: string) =>
  abbrMap[name] ?? name.slice(0, 3).toUpperCase();

const eventIcon: Record<string, string> = {
  goal: '⚽',
  yellow_card: '🟨',
  red_card: '🟥',
  substitution: '🔄',
};

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
        <span className="font-label-sm text-label-sm text-error uppercase font-extrabold tracking-wider">{`LIVE ${match.minute ?? ''}'`}</span>
      </div>
    );
  }
  if (match.status === 'halftime') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
        <span className="font-label-sm text-label-sm text-amber-400 uppercase font-extrabold tracking-wider">HT • Interval</span>
      </div>
    );
  }
  if (match.status === 'upcoming') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high border border-surface-container-highest">
        <span className="material-symbols-outlined text-outline text-[14px]">schedule</span>
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">{`UPCOMING ${formatTime(match.startTime)}`}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container-high/90 border border-surface-container-highest">
      <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">FT • Final</span>
    </div>
  );
}

function PeriodLabel({ match }: { match: FootballMatch }) {
  if (match.status === 'live') {
    const text = (match.minute ?? 0) > 45 ? '2nd Half' : '1st Half';
    return (
      <span className="font-label-sm text-label-sm text-error uppercase tracking-widest mt-1 font-bold">{text}</span>
    );
  }
  if (match.status === 'halftime') {
    return (
      <span className="font-label-sm text-label-sm text-amber-400 uppercase tracking-widest mt-1 font-bold">Break</span>
    );
  }
  if (match.status === 'upcoming') {
    return (
      <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest mt-1">{`${formatTime(match.startTime)} GMT`}</span>
    );
  }
  return (
    <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest mt-1">Full Time</span>
  );
}

function MatchRow({ match }: { match: FootballMatch }) {
  const { homeTeam, awayTeam } = match;
  const style = statusStyle[match.status];
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
      className={`match-card group relative block bg-surface-container-low border border-[#232d42] rounded-lg p-5 overflow-hidden transition-all duration-200 hover:bg-[#1a2238] ${style.hover}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${style.bar}`}></div>

      <div className="flex items-center justify-between pb-3.5 border-b border-surface-container-highest/40">
        <div className="flex items-center gap-2">
          <span className={`${style.bullet} text-[10px] font-bold`}>•</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase font-semibold">{match.league}</span>
        </div>
        <StatusBadge match={match} />
      </div>

      <div className="py-4 grid grid-cols-12 items-center gap-2">
        <div className="col-span-5 flex items-center justify-end gap-3 text-right">
          <div className="min-w-0">
            <div className="flex items-center justify-end gap-1.5">
              {homeWon && (
                <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
              )}
              <p className={`font-headline-md text-headline-md text-on-surface tracking-tight truncate font-extrabold transition-colors ${style.titleHover}`}>{homeTeam.name}</p>
            </div>
            <p className={`font-body-sm text-body-sm ${homeWon ? 'text-primary font-medium' : 'text-on-surface-variant'}`}>Home</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-surface-container flex items-center justify-center shrink-0 shadow-inner">
            <span className={`font-headline-md text-headline-md font-black ${abbrColor[homeAbbr] ?? 'text-on-surface'}`}>{homeAbbr}</span>
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
            <span className={`font-score-display text-score-display font-extrabold tabular-nums ${isUpcoming ? 'text-outline' : 'text-on-surface'}`}>
              {isUpcoming ? '—' : homeTeam.score}
            </span>
            <span className={`font-headline-md text-headline-md font-bold ${isUpcoming ? 'text-outline/50' : 'text-outline'}`}>:</span>
            <span className={`font-score-display text-score-display font-extrabold tabular-nums ${isUpcoming || homeWon ? 'text-outline' : 'text-on-surface'}`}>
              {isUpcoming ? '—' : awayTeam.score}
            </span>
          </div>
          <PeriodLabel match={match} />
        </div>

        <div className="col-span-5 flex items-center justify-start gap-3 text-left">
          <div className={`w-10 h-10 rounded-full bg-surface-container-highest border border-surface-container flex items-center justify-center shrink-0 shadow-inner ${homeWon ? 'opacity-75' : ''}`}>
            <span className={`font-headline-md text-headline-md font-black ${abbrColor[awayAbbr] ?? 'text-on-surface'}`}>{awayAbbr}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {awayWon && (
                <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
              )}
              <p className={`font-headline-md text-headline-md tracking-tight truncate ${homeWon ? 'text-on-surface-variant font-semibold' : 'text-on-surface font-extrabold'}`}>{awayTeam.name}</p>
            </div>
            <p className={`font-body-sm text-body-sm ${awayWon ? 'text-primary font-medium' : homeWon ? 'text-outline' : 'text-on-surface-variant'}`}>Away</p>
          </div>
        </div>
      </div>

      {isUpcoming ? (
        <div className="pt-3 border-t border-surface-container-highest/40 flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
          <div className="flex items-center gap-2 text-outline truncate">
            <span>{match.league}</span>
            <span>•</span>
            <span className="text-on-surface-variant font-medium">{`Kickoff ${formatTime(match.startTime)} GMT`}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-surface-container-high border border-surface-container-highest text-on-surface font-label-sm text-label-sm tracking-wider uppercase">
            Pre-Match
          </span>
        </div>
      ) : (
        <div className="pt-3 border-t border-surface-container-highest/40 flex flex-wrap items-center justify-between gap-2 text-on-surface-variant">
          <div className="flex flex-wrap items-center gap-2 font-body-sm text-body-sm">
            {events.length === 0 ? (
              <span className="text-outline">No events yet</span>
            ) : (
              events.map((e, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-high/80 text-on-surface border border-surface-container-highest/50"
                >
                  <span>{eventIcon[e.type] ?? '•'}</span>
                  <span className={`font-bold ${e.team === 'home' ? 'text-primary' : 'text-secondary'}`}>{`${e.minute}'`}</span>
                  <span>{e.player}</span>
                </span>
              ))
            )}
          </div>
          <span className="inline-flex items-center gap-1 font-label-md text-label-md text-primary group-hover:text-primary-fixed transition-colors">
            <span>Match Center</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </span>
        </div>
      )}
    </Link>
  );
}

export default function FootballPage() {
  const liveCount = matches.filter((m) => m.status === 'live').length;

  return (
    <>
      <main className="w-full bg-surface-container-lowest min-h-screen">
        <div className="flex flex-col w-full">
          <div className="relative w-full overflow-hidden">
            <div className="absolute -top-40 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none"></div>
            <div className="absolute top-20 -left-20 w-80 h-80 bg-secondary-container/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-surface-container-highest/60">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary/15 text-primary">
                      <span className="material-symbols-outlined text-[16px]">sports_soccer</span>
                    </span>
                    <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-bold">Live Hub Telemetry</span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl text-on-surface uppercase tracking-tight">Football</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Premier League • Live Scores &amp; Match Center
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/80 border border-surface-container-highest shadow-sm">
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px]">calendar_today</span>
                    <span className="font-label-md text-label-md text-on-surface uppercase tracking-wide">{`${matches.length} Matches Today`}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-error-container/20 border border-error/40 shadow-sm shadow-error/10">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error"></span>
                    </span>
                    <span className="font-label-md text-label-md text-error uppercase tracking-wider font-extrabold">{`${liveCount} Live Now`}</span>
                  </div>
                </div>
              </section>

              <section className="pt-6 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 p-1 bg-surface-container-lowest/80 rounded-full border border-surface-container-highest/60 w-fit">
                  <button className="px-4 py-1.5 rounded-full bg-surface-container-highest text-on-surface font-label-md text-label-md uppercase tracking-wider shadow-sm transition-all focus:outline-none" type="button">
                    All Matches
                  </button>
                  <button className="px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider transition-all focus:outline-none" type="button">
                    {`Live (${liveCount})`}
                  </button>
                  <button className="px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider transition-all focus:outline-none" type="button">
                    Today
                  </button>
                  <button className="px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider transition-all focus:outline-none" type="button">
                    Finished
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button className="flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-lg bg-surface-container-low border border-surface-container-highest text-on-surface font-label-md text-label-md hover:border-primary/50 transition-colors focus:outline-none" type="button">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span>Premier League</span>
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
                    </button>
                  </div>
                  <div className="relative min-w-[190px]">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">search</span>
                    </span>
                    <input
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container-highest/70 text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                      placeholder="Search clubs, players..."
                      type="text"
                    />
                  </div>
                </div>
              </section>

              <section className="max-w-4xl mx-auto space-y-4 pb-12">
                {matches.map((match) => (
                  <MatchRow key={match.id} match={match} />
                ))}
              </section>

              <section className="max-w-4xl mx-auto rounded-xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low border border-surface-container-highest/70 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-container/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[26px]">notifications_active</span>
                  </div>
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Goal Alerts &amp; VAR Notifications</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Instant push audio telemetry enabled for Premier League fixtures.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button className="px-4 py-2 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-md text-label-md uppercase tracking-wider transition-colors" type="button">
                    Sound: On
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold uppercase tracking-wider hover:bg-primary-fixed transition-colors shadow-md shadow-primary/20" type="button">
                    Customize Feed
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full bg-surface-container-low border-t border-surface-container-highest/60 py-space-xl mt-space-xl">
        <div className="max-w-7xl mx-auto px-gutter-desktop flex flex-col md:flex-row items-center justify-between gap-space-lg text-on-surface-variant font-body-sm text-body-sm">
          <div className="flex items-center gap-space-sm">
            <div className="w-6 h-6 rounded bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[14px]">sports_score</span>
            </div>
            <span className="font-label-md text-label-md text-on-surface uppercase">LIVESCOREHUB © 2025</span>
            <span className="text-outline">|</span>
            <span>Real-Time Multi-Sport Telemetry</span>
          </div>
          <div className="flex items-center gap-space-lg font-label-md text-label-md">
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">Privacy Policy</Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">API Feeds</Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
