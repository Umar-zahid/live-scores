import type { BzzoiroPlayerMatchStat } from '@/lib/sources/bzzoiro';

function pillStyle(r: number | null): string {
  if (r == null) return 'bg-surface-container text-on-surface-variant border-surface-container-highest';
  if (r >= 8.0) return 'bg-primary/20 text-primary border-primary/40';
  if (r >= 7.0) return 'bg-secondary/20 text-secondary border-secondary/40';
  if (r >= 6.0) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
  if (r >= 5.0) return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
  return 'bg-error-container/40 text-error border-error/40';
}

export default function RecentMatchRatings({
  matches,
  limit = 10,
}: {
  matches: BzzoiroPlayerMatchStat[];
  limit?: number;
}) {
  if (!matches.length) return null;
  const slice = matches.slice(0, limit);

  return (
    <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-lg p-3 md:p-5">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-surface-container-highest/40">
        <span className="material-symbols-outlined text-[18px] text-primary">
          timeline
        </span>
        <h2 className="text-sm md:text-base font-extrabold uppercase tracking-tight text-on-surface">
          Recent Form
        </h2>
        <span className="text-[10px] md:text-xs text-on-surface-variant ml-auto">
          Last {slice.length} match{slice.length === 1 ? '' : 'es'}
        </span>
      </div>

      <div className="flex items-start gap-1.5 md:gap-2 flex-wrap">
        {slice.map((m) => {
          const goals = m.goals ?? 0;
          const assists = m.goal_assist ?? 0;
          const minutes = m.minutes_played ?? 0;
          const title = `${minutes}′ · ${goals}G ${assists}A${m.expected_goals != null ? ` · xG ${m.expected_goals.toFixed(2)}` : ''}`;
          return (
            <div
              key={m.id}
              className="flex flex-col items-center gap-0.5"
              title={title}
            >
              <span
                className={`inline-flex items-center justify-center font-black tabular-nums border rounded-md ${pillStyle(m.rating)}`}
                style={{ width: 38, height: 32, fontSize: 12 }}
              >
                {m.rating != null ? m.rating.toFixed(1) : '—'}
              </span>
              <span className="text-[9px] text-on-surface-variant tabular-nums leading-none">
                {goals > 0 ? '⚽'.repeat(Math.min(goals, 3)) : minutes > 0 ? `${minutes}′` : ''}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[10px] text-on-surface-variant/70 text-center">
        Hover a badge for minutes, goals, assists, xG.
      </p>
    </section>
  );
}
