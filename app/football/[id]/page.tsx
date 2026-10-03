import Link from 'next/link';
import {
  getFootballMatchById,
  getFixtureLineups,
  getFixtureStatistics,
  getFixturePlayers,
  getMatchPrediction,
  getShotmapData,
} from '@/lib/football-api';
import MatchTabs from '@/components/football/MatchTabs';
import AutoRefresh from '@/components/shared/AutoRefresh';

function TeamBadge({
  logo,
  name,
  variant,
}: {
  logo: string;
  name: string;
  variant: 'home' | 'away';
}) {
  const ring = variant === 'home' ? 'rgba(75,226,119,0.2)' : 'rgba(173,198,255,0.2)';
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
        <img src={logo} alt={name} style={{ width: 40, height: 40, objectFit: 'contain' }} />
      ) : (
        <span style={{ fontWeight: 900, color: variant === 'home' ? '#4be277' : '#adc6ff' }}>
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
            className="mb-4 inline-block text-sm text-on-surface-variant hover:text-on-surface"
          >
            ← Back to matches
          </Link>
          <div className="rounded-lg bg-surface-container-low border border-surface-container-highest p-6 text-center">
            <h1 className="mb-1 text-xl font-bold text-on-surface">Match not found</h1>
            <p className="text-sm text-on-surface-variant">
              This match may have finished or is no longer available.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const [lineups, stats, players, prediction, visuals] = await Promise.all([
    getFixtureLineups(params.id, match.homeTeam.logo, match.awayTeam.logo),
    getFixtureStatistics(
      params.id,
      { id: match.homeTeam.id, name: match.homeTeam.name },
      { id: match.awayTeam.id, name: match.awayTeam.name }
    ),
    getFixturePlayers(params.id),
    getMatchPrediction(params.id),
    getShotmapData(params.id),
  ]);

  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const isUpcoming = match.status === 'upcoming';
  const isHalftime = match.status === 'halftime';
  const homeWon = isFinished && match.homeTeam.score > match.awayTeam.score;
  const awayWon = isFinished && match.awayTeam.score > match.homeTeam.score;

  return (
    <div className="relative w-full overflow-hidden">
      <AutoRefresh intervalMs={20000} />
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary-container/25 blur-[130px] rounded-full"></div>
      </div>

      <main className="relative z-10 w-full bg-surface-container-lowest min-h-screen">
        <div className="max-w-5xl mx-auto w-full px-3 sm:px-4 md:px-6 py-3 md:py-6 flex flex-col gap-3 md:gap-5">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/football"
              className="inline-flex items-center gap-1 text-on-surface-variant hover:text-on-surface text-[11px] md:text-xs uppercase tracking-wider font-bold group"
            >
              <span className="material-symbols-outlined text-[16px] md:text-[18px] group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              Back
            </Link>
          </div>

          <section className="relative overflow-hidden rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-xl p-3 sm:p-4 md:p-6">
            <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between pb-2.5 md:pb-3 mb-2.5 md:mb-3 border-b border-surface-container-highest/30">
              <div className="flex items-center gap-1.5 text-on-surface-variant text-[10px] md:text-xs uppercase tracking-widest min-w-0">
                <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-pulse shrink-0"></span>
                {match.leagueLogo && (
                  <img src={match.leagueLogo} alt="" className="w-4 h-4 object-contain shrink-0" />
                )}
                <span className="truncate">{match.league}</span>
                {match.round && <span className="hidden md:inline text-outline shrink-0">· {match.round}</span>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isLive && (
                  <div className="flex items-center gap-1 bg-error-container/20 px-2 py-0.5 md:px-3 md:py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
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

            <div className="grid grid-cols-12 gap-1 md:gap-3 items-center">
              <div className="col-span-4 flex flex-col md:flex-row md:items-center md:justify-end gap-2 md:gap-3 text-center md:text-right">
                <div className="min-w-0 order-2 md:order-1">
                  <div className="flex items-center justify-center md:justify-end">
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
                  <TeamBadge logo={match.homeTeam.logo} name={match.homeTeam.name} variant="home" />
                </div>
              </div>

              <div className="col-span-4 flex flex-col items-center justify-center py-1 md:py-2">
                <div className="flex items-baseline gap-2 md:gap-3 font-extrabold text-on-surface">
                  <span className="tabular-nums text-3xl sm:text-4xl md:text-5xl">{match.homeTeam.score}</span>
                  <span className="text-lg md:text-2xl text-outline font-bold">–</span>
                  <span className="tabular-nums text-3xl sm:text-4xl md:text-5xl">{match.awayTeam.score}</span>
                </div>
                {isLive && (
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-[9px] md:text-[10px] text-primary tracking-wider uppercase font-bold">
                    <span className="material-symbols-outlined text-[12px] text-primary">timer</span>
                    <span className="tabular-nums">{match.minute}&apos;</span>
                  </div>
                )}
              </div>

              <div className="col-span-4 flex flex-col-reverse md:flex-row items-center md:justify-start gap-2 md:gap-3 text-center md:text-left">
                <div className="flex justify-center md:justify-start">
                  <TeamBadge logo={match.awayTeam.logo} name={match.awayTeam.name} variant="away" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-center md:justify-start">
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
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-surface-container-highest/30 flex flex-wrap items-center justify-center gap-3 md:gap-5 text-on-surface-variant text-[10px] md:text-xs">
                {match.venue && (
                  <span className="inline-flex items-center gap-1 md:gap-1.5">
                    <span className="material-symbols-outlined text-[12px]">stadium</span>
                    <span className="truncate max-w-[150px] md:max-w-none">{match.venue}</span>
                  </span>
                )}
                {match.referee && (
                  <span className="inline-flex items-center gap-1 md:gap-1.5">
                    <span className="material-symbols-outlined text-[12px]">sports</span>
                    {match.referee}
                  </span>
                )}
              </div>
            )}
          </section>

          <MatchTabs
            match={match}
            lineups={lineups}
            stats={stats}
            players={players}
            prediction={prediction}
            visuals={visuals}
          />
        </div>
      </main>
    </div>
  );
}
