import Link from 'next/link';
import { getFootballMatchById } from '@/lib/football-api';

const eventTypeLabel: Record<string, string> = {
  goal: 'Goal',
  yellow_card: 'Yellow Card',
  red_card: 'Red Card',
  substitution: 'Substitution',
};

function EventIcon({ type }: { type: string }) {
  if (type === 'goal') {
    return (
      <span
        className="material-symbols-outlined text-primary"
        style={{ fontSize: 18, lineHeight: '18px' }}
      >
        sports_soccer
      </span>
    );
  }
  if (type === 'yellow_card') {
    return (
      <span
        style={{
          display: 'inline-block',
          width: 12,
          height: 16,
          borderRadius: 2,
          background: '#facc15',
          boxShadow: '0 0 6px rgba(250,204,21,0.6)',
          flexShrink: 0,
        }}
        aria-label="Yellow card"
      />
    );
  }
  if (type === 'red_card') {
    return (
      <span
        style={{
          display: 'inline-block',
          width: 12,
          height: 16,
          borderRadius: 2,
          background: '#ffb4ab',
          boxShadow: '0 0 6px rgba(255,180,171,0.6)',
          flexShrink: 0,
        }}
        aria-label="Red card"
      />
    );
  }
  if (type === 'substitution') {
    return (
      <span
        className="material-symbols-outlined text-secondary"
        style={{ fontSize: 18, lineHeight: '18px' }}
      >
        swap_horiz
      </span>
    );
  }
  return (
    <span
      className="material-symbols-outlined text-on-surface-variant"
      style={{ fontSize: 18, lineHeight: '18px' }}
    >
      circle
    </span>
  );
}

function TeamBadge({
  logo,
  name,
  variant,
}: {
  logo: string;
  name: string;
  variant: 'home' | 'away';
}) {
  const ring =
    variant === 'home' ? 'rgba(75,226,119,0.2)' : 'rgba(173,198,255,0.2)';
  return (
    <div
      className="shrink-0 flex items-center justify-center overflow-hidden"
      style={{
        width: 56,
        height: 56,
        borderRadius: 12,
        background: '#191f31',
        border: '1px solid #2e3447',
        boxShadow: `0 0 0 4px ${ring}`,
      }}
    >
      {logo ? (
        <img
          src={logo}
          alt={name}
          style={{ width: 40, height: 40, objectFit: 'contain' }}
        />
      ) : (
        <span
          style={{
            fontWeight: 900,
            color: variant === 'home' ? '#4be277' : '#adc6ff',
          }}
        >
          {name.slice(0, 3).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default async function MatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const match = await getFootballMatchById(params.id);

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
            <h1 className="mb-1 text-xl font-bold text-on-surface">
              Match not found
            </h1>
            <p className="text-sm text-on-surface-variant">
              This match may have finished or is no longer available.
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
          <div className="max-w-5xl mx-auto w-full px-3 sm:px-4 md:px-6 py-3 md:py-6 flex flex-col gap-3 md:gap-5">
            {/* Back row */}
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/football"
                className="inline-flex items-center gap-1 text-on-surface-variant hover:text-on-surface text-[11px] md:text-xs uppercase tracking-wider font-bold transition-colors group"
              >
                <span className="material-symbols-outlined text-[16px] md:text-[18px] group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                Back
              </Link>
              <button
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors text-[10px] md:text-xs uppercase tracking-wider font-bold"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">
                  push_pin
                </span>
                <span className="hidden sm:inline">Pin</span>
              </button>
            </div>

            {/* Score header */}
            <section className="relative overflow-hidden rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-xl p-3 sm:p-4 md:p-6">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-36 bg-primary-container/10 blur-3xl pointer-events-none rounded-full"></div>

              {/* League + status */}
              <div className="relative z-10 flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between pb-2.5 md:pb-3 mb-2.5 md:mb-3 border-b border-surface-container-highest/30">
                <div className="flex items-center gap-1.5 text-on-surface-variant text-[10px] md:text-xs uppercase tracking-widest min-w-0">
                  <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-pulse shrink-0"></span>
                  {match.leagueLogo && (
                    <img
                      src={match.leagueLogo}
                      alt=""
                      className="w-4 h-4 md:w-5 md:h-5 object-contain shrink-0"
                    />
                  )}
                  <span className="truncate">{match.league}</span>
                  {match.round && (
                    <span className="hidden md:inline text-outline shrink-0">
                      · {match.round}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isLive && (
                    <div className="flex items-center gap-1 bg-error-container/20 px-2 py-0.5 md:px-3 md:py-1 rounded-full">
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-error animate-ping"></span>
                      <span className="text-[9px] md:text-[10px] text-error uppercase tracking-wider font-bold">
                        Live {match.minute}&apos;
                      </span>
                    </div>
                  )}
                  {isHalftime && (
                    <div className="flex items-center bg-amber-500/10 px-2 py-0.5 md:px-3 md:py-1 rounded-full">
                      <span className="text-[9px] md:text-[10px] text-amber-400 uppercase tracking-wider font-bold">
                        Half Time
                      </span>
                    </div>
                  )}
                  {isFinished && (
                    <div className="flex items-center bg-surface-container px-2 py-0.5 md:px-3 md:py-1 rounded-full">
                      <span className="text-[9px] md:text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                        Full Time
                      </span>
                    </div>
                  )}
                  {isUpcoming && (
                    <div className="flex items-center bg-surface-container px-2 py-0.5 md:px-3 md:py-1 rounded-full">
                      <span className="text-[9px] md:text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                        Upcoming
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Teams + score */}
              <div className="relative z-10 grid grid-cols-12 gap-1 md:gap-3 items-center">
                <div className="col-span-4 flex flex-col md:flex-row md:items-center md:justify-end gap-2 md:gap-3 text-center md:text-right">
                  <div className="min-w-0 order-2 md:order-1">
                    <div className="flex items-center justify-center md:justify-end gap-1">
                      <span className="px-1 py-0.5 rounded text-[8px] md:text-[10px] font-bold bg-primary/15 text-primary uppercase">
                        Home
                      </span>
                    </div>
                    <h1
                      className={`text-[12px] sm:text-sm md:text-lg uppercase tracking-tight mt-0.5 md:mt-1 font-extrabold leading-tight break-words ${
                        homeWon ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {match.homeTeam.name}
                    </h1>
                  </div>
                  <div className="order-1 md:order-2 flex justify-center md:justify-end">
                    <TeamBadge
                      logo={match.homeTeam.logo}
                      name={match.homeTeam.name}
                      variant="home"
                    />
                  </div>
                </div>

                <div className="col-span-4 flex flex-col items-center justify-center py-1 md:py-2">
                  <div className="flex items-baseline gap-2 md:gap-3 font-extrabold text-on-surface">
                    <span className="tabular-nums text-3xl sm:text-4xl md:text-5xl">
                      {match.homeTeam.score}
                    </span>
                    <span className="text-lg md:text-2xl text-outline font-bold">
                      –
                    </span>
                    <span className="tabular-nums text-3xl sm:text-4xl md:text-5xl">
                      {match.awayTeam.score}
                    </span>
                  </div>
                  {isLive && (
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-surface-container text-[9px] md:text-[10px] text-primary tracking-wider uppercase font-bold">
                      <span className="material-symbols-outlined text-[12px] md:text-[14px] text-primary">
                        timer
                      </span>
                      <span className="tabular-nums">{match.minute}&apos;</span>
                    </div>
                  )}
                </div>

                <div className="col-span-4 flex flex-col-reverse md:flex-row items-center md:justify-start gap-2 md:gap-3 text-center md:text-left">
                  <div className="flex justify-center md:justify-start">
                    <TeamBadge
                      logo={match.awayTeam.logo}
                      name={match.awayTeam.name}
                      variant="away"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-center md:justify-start gap-1">
                      <span className="px-1 py-0.5 rounded text-[8px] md:text-[10px] font-bold bg-secondary/15 text-secondary uppercase">
                        Away
                      </span>
                    </div>
                    <h2
                      className={`text-[12px] sm:text-sm md:text-lg uppercase tracking-tight mt-0.5 md:mt-1 font-extrabold leading-tight break-words ${
                        awayWon ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {match.awayTeam.name}
                    </h2>
                  </div>
                </div>
              </div>

              {(match.venue || match.referee) && (
                <div className="relative z-10 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-surface-container-highest/30 flex flex-wrap items-center justify-center gap-3 md:gap-5 text-on-surface-variant text-[10px] md:text-xs">
                  {match.venue && (
                    <span className="inline-flex items-center gap-1 md:gap-1.5">
                      <span className="material-symbols-outlined text-[12px] md:text-[14px]">
                        stadium
                      </span>
                      <span className="truncate max-w-[150px] md:max-w-none">
                        {match.venue}
                      </span>
                    </span>
                  )}
                  {match.referee && (
                    <span className="inline-flex items-center gap-1 md:gap-1.5">
                      <span className="material-symbols-outlined text-[12px] md:text-[14px]">
                        sports
                      </span>
                      {match.referee}
                    </span>
                  )}
                </div>
              )}
            </section>

            {/* Match events */}
            {sortedEvents.length > 0 && (
              <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-3 sm:p-4 md:p-5 shadow-lg">
                <div className="flex items-center gap-1.5 md:gap-2 pb-2.5 md:pb-3 mb-2.5 md:mb-3 border-b border-surface-container-highest/40">
                  <span className="material-symbols-outlined text-[16px] md:text-[20px] text-primary">
                    history
                  </span>
                  <h2 className="text-sm md:text-lg font-extrabold uppercase tracking-tight text-on-surface">
                    Match Events
                  </h2>
                  <span className="ml-auto text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider">
                    {sortedEvents.length} events
                  </span>
                </div>

                <div className="relative flex flex-col gap-0.5 md:gap-1">
                  <div className="absolute left-[20px] md:left-[26px] top-3 bottom-3 w-0.5 bg-surface-container"></div>
                  {sortedEvents.map((event, idx) => {
                    const label = eventTypeLabel[event.type] ?? event.type;
                    const isGoal = event.type === 'goal';
                    const eventTeamName =
                      event.team === 'home'
                        ? match.homeTeam.name
                        : match.awayTeam.name;
                    const teamLogo =
                      event.team === 'home'
                        ? match.homeTeam.logo
                        : match.awayTeam.logo;

                    return (
                      <div
                        key={idx}
                        className="relative flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-lg hover:bg-surface-container/50 transition-colors"
                      >
                        <div
                          className="shrink-0 flex items-center justify-center z-10 font-black tabular-nums"
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: isGoal
                              ? event.team === 'home'
                                ? 'rgba(75,226,119,0.2)'
                                : 'rgba(173,198,255,0.2)'
                              : '#191f31',
                            color: isGoal
                              ? event.team === 'home'
                                ? '#4be277'
                                : '#adc6ff'
                              : '#bccbb9',
                            fontSize: 11,
                          }}
                        >
                          {event.minute}&apos;
                        </div>

                        <div className="shrink-0 flex items-center justify-center">
                          <EventIcon type={event.type} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] md:text-sm font-bold text-on-surface truncate">
                            {event.player}
                          </div>
                          <div className="text-[10px] md:text-xs text-on-surface-variant truncate">
                            {label} · {eventTeamName}
                            {event.assist ? ` · assist ${event.assist}` : ''}
                          </div>
                        </div>

                        {teamLogo && (
                          <img
                            src={teamLogo}
                            alt=""
                            className="w-5 h-5 md:w-6 md:h-6 object-contain shrink-0 opacity-80"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {sortedEvents.length === 0 && (
              <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-8 md:p-12 text-center">
                <span className="material-symbols-outlined text-[36px] md:text-[48px] text-on-surface-variant mb-2">
                  event_busy
                </span>
                <p className="text-sm md:text-base text-on-surface-variant">
                  No events yet. Check back soon.
                </p>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-low border-t border-surface-container-highest/60 py-6 md:py-8 mt-8 md:mt-12">
        <div className="max-w-5xl mx-auto px-3 md:px-6 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 text-on-surface-variant text-[10px] md:text-xs">
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap justify-center">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[12px] md:text-[14px]">
                sports_score
              </span>
            </div>
            <span className="font-bold uppercase tracking-wider text-on-surface">
              LIVESCOREHUB © 2025
            </span>
          </div>
          <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
            <Link className="hover:text-on-surface transition-colors" href="#">
              Privacy
            </Link>
            <Link className="hover:text-on-surface transition-colors" href="#">
              API Feeds
            </Link>
            <Link className="hover:text-on-surface transition-colors" href="#">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
