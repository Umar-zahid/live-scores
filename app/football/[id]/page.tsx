import Link from 'next/link';
import {
  getFootballMatchById,
  getFixturePlayerStats,
  getPlayerSeasonStats,
} from '@/lib/football-api';
import PlayerMatchStats from '@/components/football/PlayerMatchStats';
import SeasonStats from '@/components/football/SeasonStats';

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

function EventIcon({ type }: { type: string }) {
  if (type === 'goal') {
    return <span className="material-symbols-outlined text-[18px] text-primary">sports_soccer</span>;
  }
  if (type === 'yellow_card') {
    return <span className="inline-block w-3 h-4 rounded-[2px] bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.5)]" aria-label="Yellow card" />;
  }
  if (type === 'red_card') {
    return <span className="inline-block w-3 h-4 rounded-[2px] bg-error shadow-[0_0_6px_rgba(255,180,171,0.5)]" aria-label="Red card" />;
  }
  if (type === 'substitution') {
    return <span className="material-symbols-outlined text-[18px] text-secondary">swap_horiz</span>;
  }
  return <span className="material-symbols-outlined text-[18px] text-on-surface-variant">circle</span>;
}

function TeamBadge({ logo, name, variant }: { logo: string; name: string; variant: 'home' | 'away' }) {
  const ring = variant === 'home' ? 'ring-primary/20' : 'ring-secondary/20';
  const fallback = variant === 'home' ? 'text-primary' : 'text-secondary';
  return (
    <div className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-surface-container border border-surface-container-highest flex items-center justify-center shadow-md overflow-hidden ring-4 ${ring}`}>
      {logo ? (
        <img src={logo} alt={name} className="w-10 h-10 sm:w-11 sm:h-11 object-contain" />
      ) : (
        <span className={`font-headline-md font-black ${fallback}`}>{name.slice(0, 3).toUpperCase()}</span>
      )}
    </div>
  );
}

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const match = await getFootballMatchById(params.id);

  if (!match) {
    return (
      <main className="min-h-screen bg-surface-container-lowest p-4">
        <div className="mx-auto max-w-2xl">
          <Link href="/football" className="mb-4 inline-block text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            ← Back to matches
          </Link>
          <div className="rounded-lg bg-surface-container-low border border-surface-container-highest p-6 text-center">
            <h1 className="mb-1 text-xl font-bold text-on-surface">Match not found</h1>
            <p className="text-sm text-on-surface-variant">This match may have finished or is no longer available.</p>
          </div>
        </div>
      </main>
    );
  }

  const playerStats = await getFixturePlayerStats(params.id);
  const topPlayers = [...playerStats]
    .filter((p) => p.rating !== null && p.minutes > 0)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 6);

  const seasonResults = await Promise.all(
    topPlayers.map((p) => getPlayerSeasonStats(p.playerId, 2023))
  );
  const seasonStats = seasonResults.filter((s): s is NonNullable<typeof s> => s !== null);

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
          <div className="max-w-7xl mx-auto w-full px-space-md md:px-gutter-desktop py-space-lg flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <Link href="/football" className="inline-flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider transition-colors duration-150 group">
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Back to matches
              </Link>
              <button className="flex items-center gap-space-xs px-space-md py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md" type="button">
                <span className="material-symbols-outlined text-[18px]">push_pin</span>
                <span className="hidden sm:inline">Pin Match</span>
              </button>
            </div>

            <section className="relative overflow-hidden rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-xl p-space-md md:p-space-xl">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-36 bg-primary-container/10 blur-3xl pointer-events-none rounded-full"></div>

              <div className="relative z-10 flex items-center justify-between pb-space-md mb-space-md border-b border-surface-container-highest/30">
                <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md uppercase tracking-widest min-w-0">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse shrink-0"></span>
                  {match.leagueLogo && <img src={match.leagueLogo} alt="" className="w-5 h-5 object-contain shrink-0" />}
                  <span className="truncate">{match.league}</span>
                  {match.round && <span className="hidden md:inline text-outline shrink-0">· {match.round}</span>}
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  {isLive && (
                    <div className="flex items-center gap-space-xs bg-error-container/20 px-space-md py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                      <span className="w-2 h-2 rounded-full bg-error -ml-3"></span>
                      <span className="font-label-sm text-label-sm text-error uppercase tracking-wider font-bold">Live {match.minute}&apos;</span>
                    </div>
                  )}
                  {isHalftime && <div className="flex items-center bg-amber-500/10 px-space-md py-1 rounded-full"><span className="font-label-sm text-label-sm text-amber-400 uppercase tracking-wider font-bold">Half Time</span></div>}
                  {isFinished && <div className="flex items-center bg-surface-container px-space-md py-1 rounded-full"><span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Full Time</span></div>}
                  {isUpcoming && <div className="flex items-center bg-surface-container px-space-md py-1 rounded-full"><span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Upcoming</span></div>}
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-space-lg items-center py-space-sm">
                <div className="md:col-span-4 flex items-center md:justify-end gap-space-md text-left md:text-right">
                  <div className="min-w-0 order-2 md:order-1">
                    <div className="flex items-center md:justify-end gap-space-xs">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary uppercase font-label-sm">Home</span>
                    </div>
                    <h1 className={`font-headline-lg text-headline-lg uppercase tracking-tight mt-0.5 truncate ${homeWon ? 'text-primary font-extrabold' : 'text-on-surface font-extrabold'}`}>
                      {match.homeTeam.name}
                    </h1>
                  </div>
                  <div className="order-1 md:order-2">
                    <TeamBadge logo={match.homeTeam.logo} name={match.homeTeam.name} variant="home" />
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
                      <span className="material-symbols-outlined text-[16px] text-primary">timer</span>
                      <span className="tabular-nums">{match.minute}&apos;</span>
                      <span className="text-on-surface-variant font-normal">· {(match.minute ?? 0) > 45 ? '2nd Half' : '1st Half'}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-4 flex items-center justify-start gap-space-md text-left">
                  <TeamBadge logo={match.awayTeam.logo} name={match.awayTeam.name} variant="away" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-space-xs">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-secondary/15 text-secondary uppercase font-label-sm">Away</span>
                    </div>
                    <h2 className={`font-headline-lg text-headline-lg uppercase tracking-tight mt-0.5 truncate ${awayWon ? 'text-primary font-extrabold' : 'text-on-surface font-extrabold'}`}>
                      {match.awayTeam.name}
                    </h2>
                  </div>
                </div>
              </div>

              {(match.venue || match.referee) && (
                <div className="relative z-10 mt-space-md pt-space-md border-t border-surface-container-highest/30 flex flex-wrap items-center justify-center gap-space-lg text-on-surface-variant font-body-sm text-body-sm">
                  {match.venue && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">stadium</span>
                      {match.venue}
                    </span>
                  )}
                  {match.referee && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">sports</span>
                      Referee: {match.referee}
                    </span>
                  )}
                </div>
              )}
            </section>

            {sortedEvents.length > 0 && (
              <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-space-md md:p-space-lg shadow-lg">
                <div className="flex items-center gap-space-xs pb-space-sm mb-space-sm border-b border-surface-container-highest/40">
                  <span className="material-symbols-outlined text-[20px] text-primary">history</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold uppercase tracking-tight">Match Events</h2>
                </div>
                <div className="relative flex flex-col gap-space-xs mt-space-xs">
                  <div className="absolute left-[26px] top-4 bottom-4 w-0.5 bg-surface-container"></div>
                  {sortedEvents.map((event, idx) => {
                    const label = eventTypeLabel[event.type] ?? event.type;
                    const color = eventColor[event.type] ?? 'text-on-surface';
                    const isGoal = event.type === 'goal';
                    const eventTeamName = event.team === 'home' ? match.homeTeam.name : match.awayTeam.name;
                    const teamLogo = event.team === 'home' ? match.homeTeam.logo : match.awayTeam.logo;
                    return (
                      <div key={idx} className="relative flex items-start gap-space-md p-space-sm rounded-lg hover:bg-surface-container/50 transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 font-label-md text-label-md font-black tabular-nums shadow-sm ${isGoal ? (event.team === 'home' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary') : 'bg-surface-container text-on-surface-variant'}`}>
                          {event.minute}&apos;
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-space-xs">
                            <EventIcon type={event.type} />
                            <span className={`font-headline-md text-[15px] font-bold truncate ${color}`}>{event.player}</span>
                          </div>
                          <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5 truncate">
                            {label} · {eventTeamName}
                            {event.assist && <span className="text-outline"> · assist {event.assist}</span>}
                          </p>
                        </div>
                        {teamLogo ? (
                          <img src={teamLogo} alt="" className="w-6 h-6 object-contain shrink-0 opacity-80" />
                        ) : (
                          <span className="text-on-surface-variant font-label-sm text-label-sm uppercase shrink-0">{event.team === 'home' ? 'H' : 'A'}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {playerStats.length > 0 && (
              <PlayerMatchStats players={playerStats} homeName={match.homeTeam.name} awayName={match.awayTeam.name} />
            )}

            {seasonStats.length > 0 && <SeasonStats season={2023} players={seasonStats} />}

            {sortedEvents.length === 0 && (
              <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-12 text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-2">event_busy</span>
                <p className="text-body-lg text-on-surface-variant">No events yet. Check back soon.</p>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
