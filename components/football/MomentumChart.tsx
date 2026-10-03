'use client';

import type { MomentumPoint, XgPoint } from '@/lib/football-api';

const W = 800;
const H = 180;
const MID = H / 2;

export default function MomentumChart({
  momentum,
  xgTimeline,
  homeName,
  awayName,
}: {
  momentum: MomentumPoint[];
  xgTimeline: XgPoint[];
  homeName: string;
  awayName: string;
}) {
  if (!momentum.length && !xgTimeline.length) {
    return (
      <div className="rounded-xl bg-surface-container-low/40 border border-surface-container-highest/30 p-8 text-center">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2">
          show_chart
        </span>
        <p className="text-sm text-on-surface-variant">
          No momentum data available for this match.
        </p>
      </div>
    );
  }

  const maxAbsV = momentum.length
    ? Math.max(10, ...momentum.map((p) => Math.abs(p.value)))
    : 10;

  const maxXg = xgTimeline.length
    ? Math.max(
        0.5,
        ...xgTimeline.map((p) => Math.max(p.cumHome, p.cumAway))
      )
    : 0.5;

  // Build xG polyline paths (scaled to full 90 min for X axis)
  const xgScaleX = (m: number) => (m / 90) * W;
  const xgScaleY = (xg: number) => MID - (xg / maxXg) * (MID - 14);

  const homeLine = xgTimeline
    .map((p) => `${xgScaleX(p.minute).toFixed(1)},${xgScaleY(p.cumHome).toFixed(1)}`)
    .join(' ');
  const awayLine = xgTimeline
    .map((p) => `${xgScaleX(p.minute).toFixed(1)},${xgScaleY(p.cumAway).toFixed(1)}`)
    .join(' ');

  const barWidth = momentum.length ? W / Math.max(90, momentum.length) : 8;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-[11px] md:text-xs font-bold">
        <span style={{ color: '#4be277' }}>▲ {homeName}</span>
        <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">
          Momentum over 90 minutes
        </span>
        <span style={{ color: '#adc6ff' }}>{awayName} ▼</span>
      </div>

      <div className="rounded-lg overflow-hidden border border-surface-container-highest/40">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block"
          style={{ background: '#0b1220' }}
        >
          {/* Baseline */}
          <line x1={0} y1={MID} x2={W} y2={MID} stroke="#ffffff33" strokeWidth={1} />

          {/* Minute ticks */}
          {[15, 30, 45, 60, 75].map((m) => (
            <g key={m}>
              <line
                x1={(m / 90) * W}
                y1={MID - 3}
                x2={(m / 90) * W}
                y2={MID + 3}
                stroke="#ffffff33"
                strokeWidth={1}
              />
              <text
                x={(m / 90) * W}
                y={H - 3}
                textAnchor="middle"
                fontSize={9}
                fill="#ffffff55"
              >
                {m}&apos;
              </text>
            </g>
          ))}

          {/* Momentum bars */}
          {momentum.map((p, i) => {
            const x = (p.minute / 90) * W;
            const h = (Math.abs(p.value) / maxAbsV) * (MID - 8);
            const y = p.value >= 0 ? MID - h : MID;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={h}
                fill={p.value >= 0 ? '#4be277' : '#adc6ff'}
                opacity={0.55}
              />
            );
          })}

          {/* Cumulative xG lines (overlaid on top) */}
          {homeLine && (
            <polyline
              points={homeLine}
              fill="none"
              stroke="#4be277"
              strokeWidth={2}
              opacity={0.9}
            />
          )}
          {awayLine && (
            <polyline
              points={awayLine}
              fill="none"
              stroke="#adc6ff"
              strokeWidth={2}
              opacity={0.9}
            />
          )}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <div className="rounded-lg bg-surface-container-low/40 border border-surface-container-highest/30 p-2.5">
          <div className="text-on-surface-variant uppercase tracking-wider text-[10px] font-bold mb-0.5">
            {homeName} cumulative xG
          </div>
          <div className="text-lg font-black tabular-nums" style={{ color: '#4be277' }}>
            {xgTimeline.length ? xgTimeline[xgTimeline.length - 1].cumHome.toFixed(2) : '—'}
          </div>
        </div>
        <div className="rounded-lg bg-surface-container-low/40 border border-surface-container-highest/30 p-2.5">
          <div className="text-on-surface-variant uppercase tracking-wider text-[10px] font-bold mb-0.5">
            {awayName} cumulative xG
          </div>
          <div className="text-lg font-black tabular-nums" style={{ color: '#adc6ff' }}>
            {xgTimeline.length ? xgTimeline[xgTimeline.length - 1].cumAway.toFixed(2) : '—'}
          </div>
        </div>
      </div>

      <div className="text-[10px] text-on-surface-variant/70 text-center">
        Bars show match momentum (positive = home pressure). Lines show cumulative xG.
      </div>
    </div>
  );
}
