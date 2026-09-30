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
  'Visa Cash App RB': 'VCB',
  'RB': 'RB',
  Haas: 'HAS',
  Sauber: 'SAU',
};

const getAbbr = (team: string) =>
  abbrMap[team] ?? team.slice(0, 3).toUpperCase();

export default function RaceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const race = races.find((r) => r.id === params.id);

  if (!race) {
    return (
      <main className="min-h-screen bg-surface-container-lowest p-4">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/f1"
            className="mb-4 inline-block text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ← Back to races
          </Link>
          <div className="rounded-lg bg-surface-container-low border border-surface-container-highest p-6 text-center">
            <h1 className="mb-1 text-xl font-bold text-on-surface">Race not found</h1>
            <p className="text-sm text-on-surface-variant">
              There is no race with ID &quot;{params.id}&quot;.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const isLive = race.status === 'live';
  const isFinished = race.status === 'finished';
  const isUpcoming = race.status === 'upcoming';

  const leader = race.drivers[0];
  const second = race.drivers[1];
  const gapToSecond =
    leader && second ? second.gap.replace('+', '').replace('s', '') : '0';

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-error-container/30 blur-[130px] rounded-full"></div>
        <div className="absolute top-48 left-1/4 w-[360px] h-[220px] bg-tertiary-container/25 blur-[110px] rounded-full"></div>
        <div className="absolute top-48 right-1/4 w-[360px] h-[220px] bg-secondary-container/15 blur-[110px] rounded-full"></div>
      </div>

      <main className="relative z-10 w-full bg-surface-container-lowest min-h-screen">
        <div className="flex flex-col w-full">
          <div className="max-w-7xl mx-auto w-full px-space-md md:px-gutter-desktop py-space-lg flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <Link
                href="/f1"
                className="inline-flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider transition-colors duration-150 group"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                Back to races
              </Link>
              <div className="flex items-center gap-space-sm">
                <button
                  className="flex items-center gap-space-xs px-space-md py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">push_pin</span>
                  <span className="hidden sm:inline">Pin Race</span>
                </button>
              </div>
            </div>

            <section className="relative overflow-hidden rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-xl p-space-md md:p-space-xl">
              <div className="absolute -top-24 right-8 w-96 h-96 bg-error-container/10 blur-3xl pointer-events-none rounded-full"></div>

              <div className="relative z-10 flex flex-wrap items-center justify-between gap-space-sm pb-space-md mb-space-md">
                <div className="flex items-center gap-space-sm flex-wrap">
                  {isLive && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-error-container/30 text-tertiary font-label-md text-label-md uppercase tracking-wider font-bold">
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
                      Live Race Feed
                    </div>
                  )}
                  {isFinished && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-bold">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Race Complete
                    </div>
                  )}
                  {isUpcoming && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-bold">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      Upcoming
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high text-on-surface font-label-md text-label-md">
                    <span className="material-symbols-outlined text-primary text-[16px]">
                      sports_motorsports
                    </span>
                    <span>{race.raceName}</span>
                    <span className="text-on-surface-variant font-normal">
                      • {race.totalLaps} Laps
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pt-1">
                <div>
                  <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest block mb-0.5">
                    FIA Formula One World Championship
                  </span>
                  <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight uppercase">
                    {race.raceName}
                  </h1>
                </div>

                {!isUpcoming && (
                  <div className="flex items-center gap-space-md bg-surface-container-high/90 backdrop-blur-md px-space-md py-space-sm rounded-lg self-start lg:self-auto">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                        Current Lap
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-headline-md text-headline-md text-on-surface font-extrabold tabular-nums">
                          {race.lap}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant tabular-nums">
                          / {race.totalLaps}
                        </span>
                      </div>
                    </div>
                    {leader && (
                      <>
                        <div className="w-px h-8 bg-surface-variant"></div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                            Leader
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
                            <span className="font-label-md text-label-md text-on-surface uppercase">
                              {leader.name}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                    {second && (
                      <>
                        <div className="w-px h-8 bg-surface-variant"></div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                            Gap P1-P2
                          </span>
                          <span className="font-label-md text-label-md text-primary font-mono font-bold">
                            +{gapToSecond}s
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>

            {race.drivers.length > 0 && (
              <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-space-md md:p-space-lg shadow-lg">
                <div className="flex items-center justify-between px-space-xs">
                  <div className="flex items-center gap-space-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                    <h2 className="font-headline-md text-headline-md text-on-surface uppercase">
                      {isLive ? 'Live Timing Tower' : 'Final Standings'}
                    </h2>
                    <span className="text-body-sm text-on-surface-variant font-mono">
                      {race.drivers.length} DRIVERS
                    </span>
                  </div>
                </div>

                <div className="w-full bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 rounded-xl overflow-hidden shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-high/60 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                          <th className="py-2.5 pl-4 pr-1 text-center w-10">Pos</th>
                          <th className="py-2.5 px-3 min-w-[150px]">Driver</th>
                          <th className="py-2.5 px-2 text-right">Gap</th>
                          <th className="py-2.5 px-3 text-center">Tyre</th>
                          <th className="py-2.5 pr-4 pl-2 text-center">Pit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-high/40 font-mono text-body-sm">
                        {race.drivers.map((driver, idx) => {
                          const isLeader = idx === 0;
                          const teamAbbr = getAbbr(driver.team);

                          return (
                            <tr
                              key={driver.position}
                              className={`hover:bg-surface-container-high/40 transition-colors group ${
                                isLeader ? 'bg-surface-container-high/20' : ''
                              }`}
                            >
                              <td className="py-2.5 pl-4 pr-1 text-center font-bold text-on-surface">
                                {driver.position}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-6 rounded bg-secondary-container"></div>
                                  <div>
                                    <span className="font-headline-md text-body-md text-on-surface font-bold uppercase tracking-tight block leading-tight">
                                      {driver.name}
                                    </span>
                                    <span className="text-label-sm text-on-surface-variant uppercase font-sans">
                                      {driver.team}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td
                                className={`py-2.5 px-2 text-right whitespace-nowrap ${
                                  isLeader ? 'text-primary font-bold' : 'text-on-surface'
                                }`}
                              >
                                {driver.gap}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high font-sans text-label-sm text-on-surface">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      tireColors[driver.tireCompound] ?? 'bg-gray-500'
                                    }`}
                                  ></span>
                                  {tireLabel[driver.tireCompound] ?? '?'}
                                </span>
                              </td>
                              <td className="py-2.5 pr-4 pl-2 text-center text-on-surface font-bold">
                                {driver.pitStops}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {isLive && leader && (
                    <div className="px-space-md py-space-sm bg-surface-container-high/60 flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">
                          flag
                        </span>
                        Race Leader: <span className="text-on-surface font-bold">{leader.name}</span>
                      </span>
                      <span className="font-mono text-label-sm text-primary">DRS ACTIVE</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {isUpcoming && race.drivers.length === 0 && (
              <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-space-lg text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-2">
                  hourglass_empty
                </span>
                <p className="text-body-lg text-on-surface-variant">
                  Grid not available yet. Check back before the race starts.
                </p>
              </section>
            )}
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
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              Privacy Policy
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              API Feeds
            </Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
