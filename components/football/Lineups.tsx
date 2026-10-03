import type { TeamLineup, LineupPlayer } from '@/types';
import type { PlayerMatchEvent } from '@/lib/player-ratings';

function layoutStartXI(players: LineupPlayer[]): LineupPlayer[][] {
  const withGrid = players.filter((p) => p.grid);
  if (!withGrid.length) {
    const groups: Record<string, LineupPlayer[]> = { G: [], D: [], M: [], F: [] };
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

function colorForRating(rating: number): { bg: string; fg: string } {
  if (rating >= 8.0) return { bg: '#4be277', fg: '#0d2818' };
  if (rating >= 7.0) return { bg: '#adc6ff', fg: '#0a1533' };
  if (rating >= 6.0) return { bg: '#facc15', fg: '#3d2f00' };
  if (rating >= 5.0) return { bg: '#ff9f43', fg: '#3d1d00' };
  return { bg: '#ffb4ab', fg: '#3d0a08' };
}

function EventIconRow({ events }: { events?: PlayerMatchEvent[] }) {
  if (!events || events.length === 0) return null;

  const goals = events.filter((e) => e.type === 'goal').length;
  const yellow = events.filter((e) => e.type === 'yellow_card').length;
  const red = events.filter((e) => e.type === 'red_card').length;
  const subOff = events.some((e) => e.type === 'sub_off');

  if (goals === 0 && yellow === 0 && red === 0 && !subOff) return null;

  return (
    <div className="flex items-center gap-0.5 justify-center flex-wrap min-h-[12px]">
      {goals > 0 && (
        <span className="inline-flex items-center">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 11, color: '#4be277' }}
            title="Goal"
          >
            sports_soccer
          </span>
          {goals > 1 && (
            <span className="text-[8px] font-black ml-0.5" style={{ color: '#4be277' }}>
              ×{goals}
            </span>
          )}
        </span>
      )}
      {yellow > 0 && (
        <span
          className="inline-block"
          style={{
            width: 5,
            height: 8,
            background: '#facc15',
            borderRadius: 1,
            boxShadow: '0 0 3px rgba(250,204,21,0.5)',
          }}
          title="Yellow card"
        />
      )}
      {red > 0 && (
        <span
          className="inline-block"
          style={{
            width: 5,
            height: 8,
            background: '#ffb4ab',
            borderRadius: 1,
            boxShadow: '0 0 3px rgba(255,180,171,0.5)',
          }}
          title="Red card"
        />
      )}
      {subOff && (
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 11, color: '#ffb4ab' }}
          title="Substituted off"
        >
          south
        </span>
      )}
    </div>
  );
}

function PlayerDot({
  p,
  rating,
  side,
  events,
}: {
  p: LineupPlayer;
  rating?: number;
  side: 'home' | 'away';
  events?: PlayerMatchEvent[];
}) {
  const accent = side === 'home' ? '#4be277' : '#adc6ff';
  const ratingColors = rating != null ? colorForRating(rating) : null;

  return (
    <div className="flex flex-col items-center gap-1 min-w-[56px] md:min-w-[68px]">
      {/* Jersey number circle */}
      <div
        className="relative flex items-center justify-center font-black text-[10px] md:text-xs"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#070d1f',
          color: '#dce1fb',
          border: `2px solid ${accent}`,
          boxShadow: `0 0 0 2px ${accent}22`,
        }}
      >
        {p.number ?? '–'}
      </div>

      {/* Event icons — goals, cards, sub-off */}
      <EventIconRow events={events} />

      {/* Rating badge (only for players who actually played) */}
      {rating != null && ratingColors && (
        <div
          className="font-black tabular-nums"
          style={{
            background: ratingColors.bg,
            color: ratingColors.fg,
            fontSize: 10,
            lineHeight: 1,
            padding: '3px 6px',
            borderRadius: 4,
            minWidth: 26,
            textAlign: 'center',
          }}
        >
          {rating.toFixed(1)}
        </div>
      )}

      {/* Name */}
      <div className="text-[9px] md:text-[10px] text-on-surface text-center leading-tight max-w-[68px] truncate">
        {p.name.split(' ').slice(-1)[0]}
      </div>
    </div>
  );
}

function Pitch({
  lineup,
  side,
  ratings,
  playerEvents,
}: {
  lineup: TeamLineup;
  side: 'home' | 'away';
  ratings?: Map<number, number>;
  playerEvents?: Map<number, PlayerMatchEvent[]>;
}) {
  const rows = layoutStartXI(lineup.startXI);
  const accent = side === 'home' ? '#4be277' : '#adc6ff';

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #0d2818 0%, #0d2818 50%, #0a2013 50%, #0a2013 100%)',
        padding: '16px 8px',
        minHeight: 420,
      }}
    >
      <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/10" />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
        style={{ width: 60, height: 60 }}
      />

      <div className="relative flex flex-col justify-between h-full gap-3">
        {side === 'home'
          ? rows.map((row, i) => (
              <div key={i} className="flex justify-around items-start">
                {row.map((p) => (
                  <PlayerDot
                    key={p.id}
                    p={p}
                    rating={ratings?.get(p.id)}
                    side="home"
                    events={playerEvents?.get(p.id)}
                  />
                ))}
              </div>
            ))
          : [...rows].reverse().map((row, i) => (
              <div key={i} className="flex justify-around items-start">
                {row.map((p) => (
                  <PlayerDot
                    key={p.id}
                    p={p}
                    rating={ratings?.get(p.id)}
                    side="away"
                    events={playerEvents?.get(p.id)}
                  />
                ))}
              </div>
            ))}
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

function BenchList({
  players,
  ratings,
  playerEvents,
}: {
  players: LineupPlayer[];
  ratings?: Map<number, number>;
  playerEvents?: Map<number, PlayerMatchEvent[]>;
}) {
  if (!players.length) return null;
  return (
    <div className="rounded-lg bg-surface-container/40 border border-surface-container-highest/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-2">
        Substitutes · {players.length}
      </div>
      <div className="flex flex-wrap gap-2">
        {players.map((p) => {
          const evs = playerEvents?.get(p.id) ?? [];
          const subOn = evs.some((e) => e.type === 'sub_on');
          const goals = evs.filter((e) => e.type === 'goal').length;
          const yellow = evs.filter((e) => e.type === 'yellow_card').length;
          const red = evs.filter((e) => e.type === 'red_card').length;
          // Rating only shown for subs who actually came on
          const rating = subOn ? ratings?.get(p.id) : undefined;
          const colors = rating != null ? colorForRating(rating) : null;

          return (
            <span
              key={p.id}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-high/60 text-[11px] text-on-surface"
            >
              <span className="text-outline text-[10px]">{p.number ?? '–'}</span>
              {subOn && (
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 11, color: '#4be277' }}
                  title="Came on"
                >
                  north
                </span>
              )}
              {p.name}
              {goals > 0 && (
                <span className="inline-flex items-center">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 11, color: '#4be277' }}
                  >
                    sports_soccer
                  </span>
                  {goals > 1 && (
                    <span className="text-[9px] font-black ml-0.5" style={{ color: '#4be277' }}>
                      ×{goals}
                    </span>
                  )}
                </span>
              )}
              {yellow > 0 && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 5,
                    height: 8,
                    background: '#facc15',
                    borderRadius: 1,
                  }}
                />
              )}
              {red > 0 && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 5,
                    height: 8,
                    background: '#ffb4ab',
                    borderRadius: 1,
                  }}
                />
              )}
              {rating != null && colors && (
                <span
                  className="font-black tabular-nums ml-1"
                  style={{
                    background: colors.bg,
                    color: colors.fg,
                    fontSize: 9,
                    padding: '2px 5px',
                    borderRadius: 3,
                  }}
                >
                  {rating.toFixed(1)}
                </span>
              )}
            </span>
          );
        })}
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

export default function Lineups({
  lineups,
  ratings,
  playerEvents,
}: {
  lineups: TeamLineup[];
  ratings?: Map<number, number>;
  playerEvents?: Map<number, PlayerMatchEvent[]>;
}) {
  if (!lineups.length) return null;
  const [home, away] = lineups;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {home && <Pitch lineup={home} side="home" ratings={ratings} playerEvents={playerEvents} />}
        {away && <Pitch lineup={away} side="away" ratings={ratings} playerEvents={playerEvents} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {home?.coach && <CoachCard coach={home.coach} />}
        {away?.coach && <CoachCard coach={away.coach} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {home && <BenchList players={home.substitutes} ratings={ratings} playerEvents={playerEvents} />}
        {away && <BenchList players={away.substitutes} ratings={ratings} playerEvents={playerEvents} />}
      </div>
    </div>
  );
}
