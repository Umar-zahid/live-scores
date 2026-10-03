'use client';

import type { MatchPrediction } from '@/lib/football-api';

function ProbBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-on-surface">{label}</span>
        <span className="tabular-nums font-bold text-on-surface-variant">
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-surface-container">
        <div
          className="h-full transition-all"
          style={{ width: `${Math.max(2, value)}%`, background: color }}
        />
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-surface-container-highest/30 last:border-0">
      <span className="flex items-center gap-2 text-xs text-on-surface-variant uppercase tracking-wider font-bold">
        <span className="material-symbols-outlined text-[14px] text-secondary">
          {icon}
        </span>
        {label}
      </span>
      <span className="text-sm font-extrabold text-on-surface tabular-nums">
        {value}
      </span>
    </div>
  );
}

export default function PredictionsTab({
  prediction,
  homeName,
  awayName,
}: {
  prediction: MatchPrediction | null;
  homeName: string;
  awayName: string;
}) {
  if (!prediction) {
    return (
      <div className="rounded-xl bg-surface-container-low/40 border border-surface-container-highest/30 p-8 text-center">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2">
          query_stats
        </span>
        <p className="text-sm text-on-surface-variant">
          Predictions aren&apos;t available for this match.
        </p>
        <p className="text-[10px] text-on-surface-variant/70 mt-1">
          Only top-league fixtures get ML-generated predictions.
        </p>
      </div>
    );
  }

  const { match_result: mr, expected_goals: eg, over_under: ou, btts, score, model } = prediction;

  const confidencePct = Math.round(model.confidence * 100);
  const confidenceLabel =
    model.confidence >= 0.6 ? 'High' : model.confidence >= 0.4 ? 'Medium' : 'Low';

  return (
    <div className="flex flex-col gap-5">
      {/* Match Result */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] md:text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">
            Match Result
          </h3>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              confidenceLabel === 'High'
                ? 'bg-primary/15 text-primary'
                : confidenceLabel === 'Medium'
                ? 'bg-amber-500/15 text-amber-400'
                : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {confidenceLabel} confidence · {confidencePct}%
          </span>
        </div>
        <ProbBar label={`${homeName} win`} value={mr.prob_home} color="#4be277" />
        <ProbBar label="Draw" value={mr.prob_draw} color="#bccbb9" />
        <ProbBar label={`${awayName} win`} value={mr.prob_away} color="#adc6ff" />
      </section>

      {/* Score prediction + xG */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-surface-container-low/40 border border-surface-container-highest/30 p-3 md:p-4">
          <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">
            Most Likely Score
          </div>
          <div className="text-2xl font-black text-primary tabular-nums">
            {score.most_likely || '—'}
          </div>
        </div>
        <div className="rounded-xl bg-surface-container-low/40 border border-surface-container-highest/30 p-3 md:p-4">
          <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">
            xG · {homeName}
          </div>
          <div className="text-2xl font-black text-on-surface tabular-nums">
            {eg.home.toFixed(2)}
          </div>
        </div>
        <div className="rounded-xl bg-surface-container-low/40 border border-surface-container-highest/30 p-3 md:p-4">
          <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">
            xG · {awayName}
          </div>
          <div className="text-2xl font-black text-on-surface tabular-nums">
            {eg.away.toFixed(2)}
          </div>
        </div>
      </section>

      {/* Markets */}
      <section>
        <h3 className="text-[11px] md:text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
          Markets
        </h3>
        <div className="rounded-xl bg-surface-container-low/40 border border-surface-container-highest/30 px-3 md:px-4 py-1">
          <StatRow
            label="Over 1.5 goals"
            value={`${ou.prob_over_15.toFixed(1)}%`}
            icon="trending_up"
          />
          <StatRow
            label="Over 2.5 goals"
            value={`${ou.prob_over_25.toFixed(1)}%`}
            icon="trending_up"
          />
          <StatRow
            label="Over 3.5 goals"
            value={`${ou.prob_over_35.toFixed(1)}%`}
            icon="trending_up"
          />
          <StatRow
            label="Both teams to score"
            value={`${btts.prob_yes.toFixed(1)}%`}
            icon="swap_horiz"
          />
        </div>
      </section>

      {/* Model tag */}
      <div className="text-[10px] text-on-surface-variant/70 text-center pt-1">
        Model: {model.version || 'unknown'} · Generated by Bzzoiro CatBoost
      </div>
    </div>
  );
}
