import Link from 'next/link';
import { F1Race } from '@/types';
import racesData from '@/data/f1.json';

const races = racesData as unknown as F1Race[];

const tireColors: Record<string, string> = {
  soft: 'bg-red-500',
  medium: 'bg-yellow-400',
  hard: 'bg-gray-200',
  inter: 'bg-green-500',
  wet: 'bg-blue-500',
};

const tireLabel: Record<string, string> = {
  soft: 'S',
  medium: 'M',
  hard: 'H',
  inter: 'I',
  wet: 'W',
};

const abbrMap: Record<string, string> = {
  'Red Bull': 'RBR',
  McLaren: 'MCL',
  Ferrari: 'FER',
  Mercedes: 'MER',
  'Aston Martin': 'AMR',
  Williams: 'WIL',
  Alpine: 'ALP',
};

const getAbbr = (team: string) =>
  abbrMap[team] ?? team.slice(0, 3).toUpperCase();

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });

function RaceRow({ race }: { race: F1Race }) {
  const isLive = race.status === 'live';
  const isUpcoming = race.status === 'upcoming';
  const isFinished = race.status === 'finished';

  const cardClass = isLive
    ? 'bg-surface-container-low/40 hover:bg-surface-container-low/60 border border-error-container/30'
    : isUpcoming
    ? 'bg-surface-container-low/40 hover:bg-surface-container-low/60 border border-surface-container-highest/40'
    : 'bg-surface-container-highest/20 hover:bg-surface-container-highest/30 border border-surface-container-highest/30 opacity-90 hover:opacity-100';

  const accentBar = isLive ? 'bg-error-container' : 'bg-surface-container-highest';

  const leader = race.drivers[0];
  const topDrivers = race.drivers.slice(0, 5);

  return (
    <Link
      href={`/f1/${race.id}`}
      className={`group relative flex flex-col rounded-lg p-space-lg transition-colors shadow-sm overflow-hidden backdrop-blur-sm ${cardClass}`}
    >
      <div className={`absolute left-0 inset-y-0 w-[3px] ${accentBar}`}></div>

      <div className="flex items-center justify-between gap-space-sm pb-space-sm">
        <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          <span className={isLive ? 'text-error' : ''}>•</span>
          <span>FIA Formula One World Championship</span>
        </div>

        {isLive && (
          <div className="flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-error-container/25">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-error uppercase font-black tracking-wider">
              Live
            </span>
          </div>
        )}

        {isUpcoming && (
          <div className="flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-highest/60">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
              schedule
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
              Upcoming
            </span>
          </div>
        )}

        {isFinished && (
          <div className="flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container-highest/60">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
              check_circle
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
              Race Complete
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-space-sm py-space-xs">
        <div className="flex items-center gap-space-xs min-w-0">
          <span className="material-symbols-outlined text-error text-[20px]">
            sports_motorsports
          </span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold uppercase tracking-tight truncate">
            {race.raceName}
          </h2>
        </div>
        {!isUpcoming && (
          <div className="flex items-center gap-space-xs font-label-md text-label-md uppercase tracking-wider shrink-0">
            <span className="text-on-surface-variant">Lap</span>
            <span className={`font-bold ${isLive ? 'text-error' : 'text-on-surface'}`}>
              {race.lap} / {race.totalLaps}
            </span>
          </div>
        )}
      </div>

      {isUpcoming && (
        <div className="mt-space-sm pt-space-sm flex items-center justify-between gap-space-sm font-body-sm text-body-sm">
          <div className="flex items-center gap-space-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">flag</span>
            <span>Starts {formatTime(race.startTime)} GMT</span>
          </div>
          <span className="inline-flex items-center gap-1 font-label-md text-label-md text-error group-hover:text-error-container transition-colors font-bold uppercase tracking-wider">
            Race Preview
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </span>
        </div>
      )}

      {!isUpcoming && topDrivers.length > 0 && (
        <div className="mt-space-sm pt-space-sm border-t border-surface-container-highest/30">
          <div className="flex items-center justify-between pb-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Top {topDrivers.length}
            </span>
            {leader && (
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Leader: <span className="text-on-surface font-bold">{leader.name}</span>
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {topDrivers.map((driver, idx) => (
              <div
                key={driver.position}
                className={`flex items-center justify-between gap-space-sm px-2 py-1 rounded text-body-sm font-body-sm ${
                  idx === 0 ? 'bg-surface-container-high/60' : 'bg-surface-container-high/20'
                }`}
              >
                <div className="flex items-center gap-space-sm min-w-0 flex-1">
                  <span
                    className={`font-headline-md text-body-sm font-bold tabular-nums shrink-0 w-6 ${
                      idx === 0 ? 'text-error' : 'text-on-surface-variant'
                    }`}
                  >
                    P{driver.position}
                  </span>
                  <span className="text-on-surface font-semibold truncate">
                    {driver.name}
                  </span>
                  <span className="text-on-surface-variant text-[11px] shrink-0">
                    {getAbbr(driver.team)}
                  </span>
                </div>
                <div className="flex items-center gap-space-sm shrink-0">
                  <span
                    className={`font-mono text-label-sm font-bold ${
                      idx === 0 ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {driver.gap}
                  </span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${tireColors[driver.tireCompound] ?? 'bg-gray-500'}`}
                    title={driver.tireCompound}
                  ></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-space-sm pt-space-sm flex items-center justify-between font-body-sm text-body-sm">
        <span className="inline-flex items-center gap-1 font-label-md text-label-md text-error group-hover:text-error-container transition-colors font-bold uppercase tracking-wider">
          {isLive ? 'Live Timing' : isFinished ? 'Full Results' : 'Race Preview'}
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </span>
        {topDrivers.length > 5 && (
          <span className="text-on-surface-variant font-label-sm uppercase tracking-wider">
            +{race.drivers.length - 5} more drivers
          </span>
        )}
      </div>
    </Link>
  );
}

export default function F1Page() {
  const liveCount = races.filter((r) => r.status === 'live').length;

  return (
    <>
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-error-container/30 blur-[130px] rounded-full"></div>
          <div className="absolute top-48 left-1/4 w-[360px] h-[220px] bg-tertiary-container/25 blur-[110px] rounded-full"></div>
          <div className="absolute top-48 right-1/4 w-[360px] h-[220px] bg-secondary-container/15 blur-[110px] rounded-full"></div>
        </div>

        <main className="relative z-10 w-full bg-surface-container-lowest min-h-screen">
          <div className="flex flex-col w-full">
            <div className="max-w-7xl mx-auto w-full px-gutter md:px-gutter-desktop py-space-lg flex flex-col gap-space-lg">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-sm">
                <div className="flex flex-col gap-space-xs">
                  <div className="inline-flex items-center gap-space-xs self-start px-space-sm py-0.5 rounded-full bg-error-container/20 text-error">
                    <span className="material-symbols-outlined text-[14px]">sports_motorsports</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">
                      F1 Live Telemetry
                    </span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl uppercase tracking-tight text-on-surface font-black">
                    Formula 1
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Race Weekend • Live Timing &amp; Standings
                  </p>
                </div>

                <div className="flex items-center gap-space-sm flex-wrap">
                  <div className="flex items-center gap-space-xs bg-surface-container-high/60 backdrop-blur-sm px-space-md py-1.5 rounded-full">
                    <span className="material-symbols-outlined text-error text-[16px]">
                      flag
                    </span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wide uppercase">
                      {`${races.length} Races`}
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

              <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
                <nav
                  aria-label="Race Filters"
                  className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0"
                >
                  <button
                    className="flex items-center gap-1.5 px-space-lg py-1.5 bg-surface-container-high rounded-full text-on-surface font-label-md text-label-md uppercase tracking-wider shadow-sm"
                    type="button"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                    All Races
                  </button>
                  <button
                    className="px-space-md py-1.5 bg-surface-container-low hover:bg-surface-container rounded-full text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md uppercase tracking-wider"
                    type="button"
                  >
                    {`Live (${liveCount})`}
                  </button>
                  <button
                    className="px-space-md py-1.5 bg-surface-container-low hover:bg-surface-container rounded-full text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md uppercase tracking-wider"
                    type="button"
                  >
                    Upcoming
                  </button>
                  <button
                    className="px-space-md py-1.5 bg-surface-container-low hover:bg-surface-container rounded-full text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md uppercase tracking-wider"
                    type="button"
                  >
                    Finished
                  </button>
                </nav>

                <div className="flex items-center gap-space-sm flex-wrap sm:flex-nowrap">
                  <div className="relative flex-1 sm:w-64">
                    <select
                      aria-label="Select Season"
                      className="w-full appearance-none bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-lg px-space-md py-2 pr-8 focus:outline-none"
                    >
                      <option>2026 Season</option>
                      <option>2025 Season</option>
                      <option>2024 Season</option>
                    </select>
                    <span className="material-symbols-outlined text-on-surface-variant absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[18px]">
                      expand_more
                    </span>
                  </div>
                  <div className="relative flex-1 sm:w-64">
                    <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">
                      search
                    </span>
                    <input
                      aria-label="Search races"
                      className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none"
                      placeholder="Search races, circuits..."
                      type="text"
                    />
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-space-md">
                {races.map((race) => (
                  <RaceRow key={race.id} race={race} />
                ))}
              </section>

              <aside className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md p-space-lg bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 rounded-lg shadow-sm">
                <div className="flex items-start sm:items-center gap-space-md">
                  <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-error text-[22px]">
                      notifications_active
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-extrabold">
                      Real-Time Telemetry &amp; Lap Alerts
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Instant push alerts for overtakes, pit stops, and race incidents.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm self-end sm:self-center shrink-0">
                  <button
                    className="px-space-md py-1.5 bg-surface-container hover:bg-surface-container-high rounded-full font-label-md text-label-md text-on-surface uppercase tracking-wider flex items-center gap-1 transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px] text-error">
                      volume_up
                    </span>
                    Sound: On
                  </button>
                  <button
                    className="px-space-lg py-1.5 bg-error text-on-error hover:bg-error-container rounded-full font-label-md text-label-md uppercase tracking-wider font-bold transition-colors shadow-sm"
                    type="button"
                  >
                    Customize Feed
                  </button>
                </div>
              </aside>
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
