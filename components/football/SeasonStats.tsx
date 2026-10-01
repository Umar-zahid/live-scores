import type { PlayerSeasonStat } from '@/types';

export default function SeasonStats({
  season,
  players,
}: {
  season: number;
  players: PlayerSeasonStat[];
}) {
  if (!players.length) return null;

  return (
    <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-3 md:p-5 shadow-lg">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-surface-container-highest/40">
        <span className="material-symbols-outlined text-[20px] text-primary">
          leaderboard
        </span>
        <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold uppercase tracking-tight">
          Season {season} · Top Performers
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {players.map((s) => (
          <div
            key={s.playerId}
            className="rounded-lg bg-surface-container/60 p-3 border border-surface-container-highest/30"
          >
            <div className="flex items-center gap-2.5 mb-3">
              {s.photo ? (
                <img
                  src={s.photo}
                  alt={s.name}
                  className="w-11 h-11 rounded-full object-cover bg-surface-container-high"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-surface-container-high" />
              )}
              <div className="min-w-0">
                <p className="font-headline-md text-[14px] font-bold text-on-surface truncate">
                  {s.name}
                </p>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider truncate">
                  {s.team || s.nationality}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1 text-center">
              <div>
                <p className="text-headline-md font-extrabold text-on-surface tabular-nums">
                  {s.appearances}
                </p>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">
                  Apps
                </p>
              </div>
              <div>
                <p className="text-headline-md font-extrabold text-primary tabular-nums">
                  {s.goals}
                </p>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">
                  Goals
                </p>
              </div>
              <div>
                <p className="text-headline-md font-extrabold text-secondary tabular-nums">
                  {s.assists}
                </p>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">
                  Assists
                </p>
              </div>
              <div>
                <p className="text-headline-md font-extrabold text-on-surface tabular-nums">
                  {s.rating?.toFixed(2) ?? '—'}
                </p>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">
                  Rating
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-label-sm font-label-sm text-outline text-center">
        Aggregated across all competitions · Season {season}
      </p>
    </section>
  );
}
