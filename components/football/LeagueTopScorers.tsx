import Link from 'next/link';
import type { TopScorerRow } from '@/lib/football-api';

export default function LeagueTopScorers({
  scorers,
}: {
  scorers: TopScorerRow[];
}) {
  if (!scorers.length) return null;

  return (
    <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 sm:px-4 md:px-5 py-3 border-b border-surface-container-highest/40">
        <span className="material-symbols-outlined text-[18px] text-primary">
          sports_soccer
        </span>
        <h2 className="text-sm md:text-base font-extrabold uppercase tracking-tight text-on-surface">
          Top Scorers
        </h2>
      </div>

      <div className="flex flex-col">
        {scorers.map((s) => (
          <Link
            key={s.playerId}
            href={`/player/${s.playerId}`}
            className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 border-t border-surface-container-highest/30 first:border-t-0 hover:bg-surface-container/40 transition-colors"
          >
            <span className="w-5 text-center text-[11px] md:text-xs font-black tabular-nums text-on-surface-variant shrink-0">
              {s.rank}
            </span>
            {s.playerPhoto ? (
              <img
                src={s.playerPhoto}
                alt=""
                className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover bg-surface-container shrink-0"
              />
            ) : (
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-surface-container shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[12px] md:text-sm font-bold text-on-surface truncate">
                {s.playerName}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant truncate">
                {s.teamLogo && (
                  <img
                    src={s.teamLogo}
                    alt=""
                    className="w-3 h-3 object-contain"
                  />
                )}
                <span className="truncate">{s.teamName}</span>
                <span className="text-outline">·</span>
                <span>{s.appearances} apps</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-base md:text-lg font-black tabular-nums text-primary leading-none">
                {s.goals}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-on-surface-variant mt-0.5">
                {s.assists > 0 ? `${s.assists} ast` : 'goals'}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
