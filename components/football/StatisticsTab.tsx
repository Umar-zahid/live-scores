'use client';

import { useState } from 'react';
import type { FixtureStats } from '@/lib/football-api';
import type { MatchVisualData } from '@/lib/football-api';
import ShotmapView from './ShotmapView';
import MomentumChart from './MomentumChart';

type SubTab = 'summary' | 'shotmap' | 'momentum';

function SummaryView({
  stats,
  homeName,
  awayName,
}: {
  stats: FixtureStats[];
  homeName: string;
  awayName: string;
}) {
  if (stats.length < 2) {
    return (
      <div className="rounded-xl bg-surface-container-low/40 border border-surface-container-highest/30 p-8 text-center">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2">
          bar_chart
        </span>
        <p className="text-sm text-on-surface-variant">
          Match statistics aren&apos;t available for this fixture.
        </p>
      </div>
    );
  }

  const home = stats[0];
  const away = stats[1];
  const homeMap = new Map(home.stats.map((s) => [s.type, s.value]));
  const awayMap = new Map(away.stats.map((s) => [s.type, s.value]));
  const allTypes = Array.from(
    new Set([...home.stats.map((s) => s.type), ...away.stats.map((s) => s.type)])
  );

  const numeric = (v: any): number => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const m = v.match(/^(\d+(?:\.\d+)?)%?$/);
      if (m) return parseFloat(m[1]);
    }
    return 0;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest/30">
        <span className="text-xs font-bold uppercase tracking-wider text-primary truncate max-w-[40%]">
          {homeName}
        </span>
        <span className="text-[10px] text-on-surface-variant uppercase">vs</span>
        <span className="text-xs font-bold uppercase tracking-wider text-secondary text-right truncate max-w-[40%]">
          {awayName}
        </span>
      </div>

      {allTypes.map((type) => {
        const hv = homeMap.get(type) ?? null;
        const av = awayMap.get(type) ?? null;
        const hn = numeric(hv);
        const an = numeric(av);
        const total = hn + an;
        const hpct = total > 0 ? (hn / total) * 100 : 50;

        return (
          <div key={type} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-on-surface tabular-nums">{hv ?? '—'}</span>
              <span className="text-[10px] md:text-xs text-on-surface-variant uppercase tracking-wider">
                {type}
              </span>
              <span className="font-bold text-on-surface tabular-nums">{av ?? '—'}</span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-surface-container">
              <div className="bg-primary" style={{ width: `${hpct}%` }} />
              <div className="bg-secondary flex-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StatisticsTab({
  stats,
  visuals,
  homeName,
  awayName,
}: {
  stats: FixtureStats[];
  visuals: MatchVisualData | null;
  homeName: string;
  awayName: string;
}) {
  const [sub, setSub] = useState<SubTab>('summary');

  const hasShotmap = Boolean(visuals && visuals.shotmap.length > 0);
  const hasMomentum = Boolean(visuals && visuals.momentum.length > 0);

  const tabs: { id: SubTab; label: string; icon: string; disabled?: boolean }[] = [
    { id: 'summary', label: 'Summary', icon: 'bar_chart' },
    { id: 'shotmap', label: 'Shotmap', icon: 'my_location', disabled: !hasShotmap },
    { id: 'momentum', label: 'Momentum', icon: 'show_chart', disabled: !hasMomentum },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-tab bar */}
      <div className="flex gap-2 overflow-x-auto -mx-1 px-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={t.disabled}
            onClick={() => !t.disabled && setSub(t.id)}
            className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border transition-colors ${
              t.disabled
                ? 'opacity-40 cursor-not-allowed bg-surface-container text-on-surface-variant border-surface-container-highest'
                : sub === t.id
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container text-on-surface-variant border-surface-container-highest hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'summary' && (
        <SummaryView stats={stats} homeName={homeName} awayName={awayName} />
      )}
      {sub === 'shotmap' && visuals && (
        <ShotmapView
          shots={visuals.shotmap}
          homeName={homeName}
          awayName={awayName}
        />
      )}
      {sub === 'momentum' && visuals && (
        <MomentumChart
          momentum={visuals.momentum}
          xgTimeline={visuals.xgTimeline}
          homeName={homeName}
          awayName={awayName}
        />
      )}
    </div>
  );
}
