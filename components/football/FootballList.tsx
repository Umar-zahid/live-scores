'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { FootballMatch } from '@/types';

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

  return (
    <Link
      href={`/football/${match.id}`}
      className={`match-card group relative block bg-surface-container-low/40 backdrop-blur-sm border border-surface-container-highest/40 rounded-lg p-3 md:p-4 overflow-hidden transition-all duration-200 hover:bg-surface-container-low/60 h-full ${style.hover}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${style.bar}`}></div>

      <div className="flex items-center justify-between gap-2 pb-2 md:pb-2.5 border-b border-surface-container-highest/40">
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

      <div className="py-2.5 md:py-3 grid grid-cols-12 items-center gap-1 md:gap-2">
        <div className="col-span-5 flex items-center justify-end gap-1.5 md:gap-2 text-right min-w-0">
          <div className="min-w-0 flex items-center justify-end gap-1 md:gap-1.5">
            {homeWon && (
              <span className="material-symbols-outlined text-primary text-[14px] shrink-0 hidden sm:inline">
                check_circle
              </span>
            )}
            <p
              className={`text-[12px] sm:text-sm md:text-[15px] text-on-surface tracking-tight truncate font-extrabold transition-colors ${style.titleHover}`}
            >
              {homeTeam.name}
            </p>
          </div>
          <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-surface-container-highest border border-surface-container flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
            {homeTeam.logo ? (
              <img
                src={homeTeam.logo}
                alt={homeTeam.name}
                className="w-5 h-5 md:w-6 md:h-6 object-contain"
              />
            ) : (
              <span className="text-[10px] md:text-[12px] font-black text-primary">
                {homeTeam.name.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="col-span-2 flex flex-col items-center justify-center">
          <div
            className={`flex items-center justify-center gap-1 md:gap-2 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded border ${
              isUpcoming
                ? 'bg-surface-container-lowest/50 border-surface-container-highest/40'
                : 'bg-surface-container-lowest/80 border-surface-container-highest/60'
            }`}
          >
            <span
              className={`text-[15px] sm:text-base md:text-[20px] font-extrabold tabular-nums ${
                isUpcoming ? 'text-outline' : 'text-on-surface'
              }`}
            >
              {isUpcoming ? '—' : homeTeam.score}
            </span>
            <span
              className={`text-[11px] md:text-[14px] font-bold ${
                isUpcoming ? 'text-outline/50' : 'text-outline'
              }`}
            >
              :
            </span>
            <span
              className={`text-[15px] sm:text-base md:text-[20px] font-extrabold tabular-nums ${
                isUpcoming || homeWon ? 'text-outline' : 'text-on-surface'
              }`}
            >
              {isUpcoming ? '—' : awayTeam.score}
            </span>
          </div>
        </div>

        <div className="col-span-5 flex items-center justify-start gap-1.5 md:gap-2 text-left min-w-0">
          <div
            className={`w-7 h-7 md:w-9 md:h-9 rounded-full bg-surface-container-highest border border-surface-container flex items-center justify-center shrink-0 shadow-inner overflow-hidden ${
              homeWon ? 'opacity-75' : ''
            }`}
          >
            {awayTeam.logo ? (
              <img
                src={awayTeam.logo}
                alt={awayTeam.name}
                className="w-5 h-5 md:w-6 md:h-6 object-contain"
              />
            ) : (
              <span className="text-[10px] md:text-[12px] font-black text-secondary">
                {awayTeam.name.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex items-center gap-1 md:gap-1.5">
            <p
              className={`text-[12px] sm:text-sm md:text-[15px] tracking-tight truncate ${
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

      <div className="pt-2 md:pt-2.5 border-t border-surface-container-highest/40 flex items-center justify-between text-on-surface-variant text-[10px] md:text-label-sm uppercase tracking-wider">
        <span className="inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px] md:text-[14px] text-primary">
            info
          </span>
          View details
        </span>
        <span className="material-symbols-outlined text-[14px] md:text-[16px] text-primary group-hover:translate-x-0.5 transition-transform">
          arrow_forward
        </span>
      </div>
    </Link>
  );
}

function dateHeaderLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  const now = new Date();
  const todayUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const targetUTC = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate()
  );
  const diffDays = Math.round((targetUTC - todayUTC) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export default function FootballList({ matches }: { matches: FootballMatch[] }) {
  const [selectedLeague, setSelectedLeague] = useState<string>('__all__');

  const leagues = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of matches) {
      counts.set(m.league, (counts.get(m.league) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
  }, [matches]);

  const filtered = useMemo(() => {
    return selectedLeague === '__all__'
      ? matches
      : matches.filter((m) => m.league === selectedLeague);
  }, [matches, selectedLeague]);

  const liveMatches = useMemo(
    () =>
      filtered
        .filter((m) => m.status === 'live' || m.status === 'halftime')
        .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime)),
    [filtered]
  );

  const upcomingMatches = useMemo(
    () =>
      filtered
        .filter((m) => m.status === 'upcoming')
        .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime)),
    [filtered]
  );

  const upcomingByDate = useMemo(() => {
    const groups: { date: string; matches: FootballMatch[] }[] = [];
    const map = new Map<string, FootballMatch[]>();
    for (const m of upcomingMatches) {
      const key = m.startTime.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    const sortedDates = Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
    for (const [date, ms] of sortedDates) {
      groups.push({ date, matches: ms });
    }
    return groups;
  }, [upcomingMatches]);

  return (
    <>
      {/* League filter pills */}
      <div
        className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        <button
          type="button"
          onClick={() => setSelectedLeague('__all__')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border transition-colors ${
            selectedLeague === '__all__'
              ? 'bg-primary text-on-primary border-primary'
              : 'bg-surface-container text-on-surface-variant border-surface-container-highest hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          All · {matches.length}
        </button>
        {leagues.map(([name, count]) => (
          <button
            key={name}
            type="button"
            onClick={() => setSelectedLeague(name)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border transition-colors max-w-[220px] truncate ${
              selectedLeague === name
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container text-on-surface-variant border-surface-container-highest hover:bg-surface-container-high hover:text-on-surface'
            }`}
            title={name}
          >
            {name} · {count}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-8 md:p-12 text-center">
          <span className="material-symbols-outlined text-[48px] md:text-[64px] text-on-surface-variant mb-3">
            sports_soccer
          </span>
          <h2 className="text-base md:text-headline-md text-on-surface font-bold mb-1.5">
            No Matches in This League
          </h2>
          <p className="text-xs md:text-body-md text-on-surface-variant">
            Pick another league above, or select &quot;All&quot;.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 md:gap-10">
          {/* Live Matches section */}
          {liveMatches.length > 0 && (
            <section className="flex flex-col gap-3 md:gap-4">
              <h2 className="flex items-center gap-2 text-[13px] md:text-sm font-extrabold uppercase tracking-widest text-on-surface pb-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error"></span>
                </span>
                Live Matches
                <span className="ml-1 px-2 py-0.5 rounded-full bg-error-container/30 text-error text-[10px] md:text-[11px] font-bold tracking-wider">
                  {liveMatches.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {liveMatches.map((match) => (
                  <MatchRow key={match.id} match={match} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Matches section, grouped by date */}
          {upcomingMatches.length > 0 && (
            <section className="flex flex-col gap-5 md:gap-6">
              <h2 className="flex items-center gap-2 text-[13px] md:text-sm font-extrabold uppercase tracking-widest text-on-surface pb-1">
                <span className="material-symbols-outlined text-[16px] md:text-[18px] text-secondary">
                  schedule
                </span>
                Upcoming Matches
                <span className="ml-1 px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] md:text-[11px] font-bold tracking-wider">
                  {upcomingMatches.length}
                </span>
              </h2>

              {upcomingByDate.map(({ date, matches: dayMatches }) => (
                <div key={date} className="flex flex-col gap-3 md:gap-4">
                  <div className="flex items-center gap-3 pt-1">
                    <h3 className="text-[10px] md:text-[11px] font-extrabold uppercase tracking-widest text-primary">
                      {dateHeaderLabel(date)}
                    </h3>
                    <div className="flex-1 h-px bg-surface-container-highest/60"></div>
                    <span className="text-[10px] md:text-[11px] text-on-surface-variant font-bold">
                      {dayMatches.length} match{dayMatches.length === 1 ? '' : 'es'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {dayMatches.map((match) => (
                      <MatchRow key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Nothing live and nothing upcoming in this view */}
          {liveMatches.length === 0 && upcomingMatches.length === 0 && (
            <div className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-8 md:p-12 text-center">
              <span className="material-symbols-outlined text-[48px] md:text-[64px] text-on-surface-variant mb-3">
                event_busy
              </span>
              <h2 className="text-base md:text-headline-md text-on-surface font-bold mb-1.5">
                No Live or Upcoming Matches
              </h2>
              <p className="text-xs md:text-body-md text-on-surface-variant">
                Try again shortly, or pick another league above.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
