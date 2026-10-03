'use client';

import type { UIShot } from '@/lib/sources/bzzoiro-mappers';

// Pitch rendered 800×520 — corresponds to 100 (length) × 65 (breadth)
const W = 800;
const H = 520;
const PX = (pct: number) => (pct / 100) * W;
const PY = (pct: number) => (pct / 100) * H;

function radiusForXg(xg: number): number {
  // Map xG 0..0.8+ → radius 4..22
  const clamped = Math.max(0, Math.min(0.8, xg));
  return 4 + (clamped / 0.8) * 18;
}

function colorForShot(type: UIShot['type']): { fill: string; stroke: string } {
  switch (type) {
    case 'goal':
      return { fill: '#4be277', stroke: '#1c5c33' };
    case 'save':
      return { fill: '#facc15', stroke: '#5c4708' };
    case 'block':
      return { fill: '#bccbb9', stroke: '#3d4237' };
    case 'post':
      return { fill: '#c084fc', stroke: '#3a1a5c' };
    case 'miss':
      return { fill: 'transparent', stroke: '#8d9488' };
    default:
      return { fill: '#6f7568', stroke: '#3d4237' };
  }
}

function ShotDot({ shot, team }: { shot: UIShot; team: 'home' | 'away' }) {
  const cx = PX(shot.x);
  const cy = PY(shot.y);
  const r = radiusForXg(shot.xg);
  const { fill, stroke } = colorForShot(shot.type);
  const who = shot.playerName || `#${shot.playerId}`;
  const title = `${who} · ${shot.minute}' · xG ${shot.xg.toFixed(2)} · ${shot.type}${
    shot.body ? ` · ${shot.body}` : ''
  }`;

  return (
    <g>
      <title>{title}</title>
      {/* team ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r + 2}
        fill="none"
        stroke={team === 'home' ? '#4be277' : '#adc6ff'}
        strokeWidth={1}
        opacity={0.4}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
        opacity={0.85}
      />
    </g>
  );
}

export default function ShotmapView({
  shots,
  homeName,
  awayName,
}: {
  shots: UIShot[];
  homeName: string;
  awayName: string;
}) {
  if (!shots.length) {
    return (
      <div className="rounded-xl bg-surface-container-low/40 border border-surface-container-highest/30 p-8 text-center">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2">
          my_location
        </span>
        <p className="text-sm text-on-surface-variant">
          No shot data available for this match.
        </p>
      </div>
    );
  }

  const homeShots = shots.filter((s) => s.team === 'home');
  const awayShots = shots.filter((s) => s.team === 'away');
  const homeXg = homeShots.reduce((sum, s) => sum + s.xg, 0);
  const awayXg = awayShots.reduce((sum, s) => sum + s.xg, 0);

  return (
    <div className="flex flex-col gap-3">
      {/* Legend + summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] md:text-xs">
        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#4be277' }} />
            Goal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#facc15' }} />
            Saved
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border" style={{ borderColor: '#8d9488' }} />
            Off target
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#bccbb9' }} />
            Blocked
          </span>
        </div>
        <div className="flex items-center gap-3 md:gap-5 font-bold">
          <span style={{ color: '#4be277' }}>
            {homeName} · {homeShots.length} shots · {homeXg.toFixed(2)} xG
          </span>
          <span style={{ color: '#adc6ff' }}>
            {awayName} · {awayShots.length} shots · {awayXg.toFixed(2)} xG
          </span>
        </div>
      </div>

      {/* Pitch */}
      <div className="rounded-lg overflow-hidden border border-surface-container-highest/40">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block"
          style={{ background: '#0d2818' }}
        >
          {/* Turf stripes */}
          {Array.from({ length: 10 }).map((_, i) => (
            <rect
              key={i}
              x={(i * W) / 10}
              y={0}
              width={W / 10}
              height={H}
              fill={i % 2 === 0 ? '#0d2818' : '#0a2013'}
            />
          ))}

          {/* Outer border */}
          <rect x={8} y={8} width={W - 16} height={H - 16} fill="none" stroke="#ffffff22" strokeWidth={2} />
          {/* Halfway line */}
          <line x1={W / 2} y1={8} x2={W / 2} y2={H - 8} stroke="#ffffff22" strokeWidth={2} />
          {/* Center circle */}
          <circle cx={W / 2} cy={H / 2} r={60} fill="none" stroke="#ffffff22" strokeWidth={2} />
          <circle cx={W / 2} cy={H / 2} r={4} fill="#ffffff22" />

          {/* Right goal + penalty area (both teams attack this) */}
          <rect x={W - 8 - 132} y={(H - 220) / 2} width={132} height={220} fill="none" stroke="#ffffff22" strokeWidth={2} />
          <rect x={W - 8 - 44} y={(H - 90) / 2} width={44} height={90} fill="none" stroke="#ffffff22" strokeWidth={2} />
          <rect x={W - 8} y={(H - 44) / 2} width={8} height={44} fill="#ffffff22" />

          {/* Left goal + penalty area (decoration, teams attack right) */}
          <rect x={8} y={(H - 220) / 2} width={132} height={220} fill="none" stroke="#ffffff22" strokeWidth={2} />

          {/* Shots */}
          {shots.map((s, i) => (
            <ShotDot key={i} shot={s} team={s.team} />
          ))}
        </svg>
      </div>

      <div className="text-[10px] text-on-surface-variant/70 text-center">
        Bubble size = expected goals (xG). Both teams normalized to attack the right side.
      </div>
    </div>
  );
}
