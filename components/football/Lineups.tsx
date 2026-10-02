import type { TeamLineup, LineupPlayer } from '@/types';

const posLabel: Record<string, string> = {
  G: 'GK', D: 'DEF', M: 'MID', F: 'FWD',
};

// Group players by grid row. grid = "row:col" (e.g. "2:3")
function layoutStartXI(players: LineupPlayer[]): LineupPlayer[][] {
  const withGrid = players.filter((p) => p.grid);
  if (!withGrid.length) {
    // No grid data — group by position
    const groups: Record<string, LineupPlayer[]> = {
      G: [], D: [], M: [], F: [],
    };
    for (const p of players) {
      (groups[p.position] ?? (groups[p.position] = [])).push(p);
    }
    return [groups.G ?? [], groups.D ?? [], groups.M ?? [], groups.F ?? []].filter(
      (g) => g.length
    );
  }

  const rows = new Map<number, LineupPlayer[]>();
  for (const p of withGrid) {
    const row = parseInt(p.grid!.split(':')[0] ?? '0', 10);
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row)!.push(p);
  }
  return Array.from(rows.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, arr]) =>
      arr.sort((a, b) => {
        const ca = parseInt(a.grid!.split(':')[1] ?? '0', 10);
        const cb = parseInt(b.grid!.split(':')[1] ?? '0', 10);
        return ca - cb;
      })
    );
}

function PlayerDot({ p }: { p: LineupPlayer }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[52px] md:min-w-[64px]">
      <div
        className="flex items-center justify-center font-black text-[10px] md:text-xs"
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: '#070d1f',
          color: '#dce1fb',
          border: '2px solid #4be277',
          boxShadow: '0 0 0 2px rgba(75,226,119,0.15)',
        }}
      >
        {p.number ?? '–'}
      </div>
      <div className="text-[9px] md:text-[10px] text-on-surface text-center leading-tight max-w-[64px] truncate">
        {p.name.split(' ').slice(-1)[0]}
      </div>
    </div>
  );
}

function Pitch({ lineup, side }: { lineup: TeamLineup; side: 'home' | 'away' }) {
  const rows = layoutStartXI(lineup.startXI);
  const accent = side === 'home' ? '#4be277' : '#adc6ff';

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #0d2818 0%, #0d2818 50%, #0a2013 50%, #0a2013 100%)',
        padding: '16px 8px',
        minHeight: 380,
      }}
    >
      {/* Halfway line */}
      <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/10" />
      {/* Center circle */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
        style={{ width: 60, height: 60 }}
      />

      <div className="relative flex flex-col justify-between h-full gap-3">
        {side === 'home' ? (
          // Home: keepers at top, forwards near middle
          rows.map((row, i) => (
            <div key={i} className="flex justify-around items-start">
              {row.map((p) => <PlayerDot key={p.id} p={p} />)}
            </div>
          ))
        ) : (
          // Away: mirrored vertically
          [...rows].reverse().map((row, i) => (
            <div key={i} className="flex justify-around items-start">
              {row.map((p) => <PlayerDot key={p.id} p={p} />)}
            </div>
          ))
        )}
      </div>

      <div
        className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
        style={{ background: accent + '22', color: accent }}
      >
        {lineup.teamName}
        {lineup.formation ? ` · ${lineup.formation}` : ''}
      </div>
    </div>
  );
}

function BenchList({ players }: { players: LineupPlayer[] }) {
  if (!players.length) return null;
  return (
    <div className="rounded-lg bg-surface-container/40 border border-surface-container-highest/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-2">
        Substitutes · {players.length}
      </div>
      <div className="flex flex-wrap gap-2">
        {players.map((p) => (
          <span
            key={p.id}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-high/60 text-[11px] text-on-surface"
          >
            <span className="text-outline text-[10px]">{p.number ?? '–'}</span>
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function CoachCard({ coach }: { coach: { name: string; photo: string } }) {
  return (
    <div className="rounded-lg bg-surface-container/40 border border-surface-container-highest/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-2">
        Coach
      </div>
      <div className="flex items-center gap-2">
        {coach.photo ? (
          <img
            src={coach.photo}
            alt=""
            className="w-8 h-8 rounded-full object-cover bg-surface-container-high"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-surface-container-high" />
        )}
        <span className="text-sm font-semibold text-on-surface truncate">
          {coach.name}
        </span>
      </div>
    </div>
  );
}

export default function Lineups({ lineups }: { lineups: TeamLineup[] }) {
  if (!lineups.length) return null;
  const [home, away] = lineups;

  return (
    <div className="flex flex-col gap-4">
      {/* Pitch view — home & away side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {home && <Pitch lineup={home} side="home" />}
        {away && <Pitch lineup={away} side="away" />}
      </div>

      {/* Coaches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {home?.coach && <CoachCard coach={home.coach} />}
        {away?.coach && <CoachCard coach={away.coach} />}
      </div>

      {/* Bench */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {home && <BenchList players={home.substitutes} />}
        {away && <BenchList players={away.substitutes} />}
      </div>
    </div>
  );
}
