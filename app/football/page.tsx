import Link from 'next/link';
import { getFootballMatches } from '@/lib/football-api';
import FootballList from '@/components/football/FootballList';
import DatePicker from '@/components/football/DatePicker';
import AutoRefresh from '@/components/shared/AutoRefresh';

export default async function FootballPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const today = new Date().toISOString().slice(0, 10);
  const validDate =
    searchParams.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date)
      ? searchParams.date
      : today;
  const isToday = validDate === today;

  const matches = await getFootballMatches(isToday ? undefined : validDate);
  const liveCount = matches.filter(
    (m) => m.status === 'live' || m.status === 'halftime'
  ).length;

  return (
    <>
      {isToday && <AutoRefresh intervalMs={30000} />}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary-container/25 blur-[130px] rounded-full"></div>
          <div className="absolute top-48 left-1/4 w-[360px] h-[220px] bg-secondary-container/20 blur-[110px] rounded-full"></div>
          <div className="absolute top-48 right-1/4 w-[360px] h-[220px] bg-tertiary-container/15 blur-[110px] rounded-full"></div>
        </div>

        <main className="relative z-10 w-full bg-surface-container-lowest min-h-screen">
          <div className="flex flex-col w-full">
            <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-gutter-desktop py-4 md:py-space-lg flex flex-col gap-3 md:gap-space-lg">
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

              <DatePicker selectedDate={validDate} />

              {matches.length === 0 ? (
                <div className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-8 md:p-12 text-center">
                  <span className="material-symbols-outlined text-[48px] md:text-[64px] text-on-surface-variant mb-3">
                    sports_soccer
                  </span>
                  <h2 className="text-base md:text-headline-md text-on-surface font-bold mb-1.5">
                    {isToday ? 'No Live Matches Right Now' : 'No Matches On This Day'}
                  </h2>
                  <p className="text-xs md:text-body-md text-on-surface-variant">
                    {isToday
                      ? 'Check back soon — live matches will appear here automatically.'
                      : 'Try a different date or jump back to Today.'}
                  </p>
                </div>
              ) : (
                <FootballList matches={matches} />
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
