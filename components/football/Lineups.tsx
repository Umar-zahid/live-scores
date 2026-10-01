import type { TeamLineup, LineupPlayer } from '@/types';

const posLabel: Record<string, string> = {
  G: 'GK',
  D: 'DEF',
  M: 'MID',
  F: 'FWD',
};

function PlayerRow({ player }: { player: LineupPlayer }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-surface-container-highest/20 last:border-0">
      <span
        className="shrink-0 flex items-center justify-center font-bold text-[10px] md:text-xs tabular-nums"
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: '#191f31',
          color: '#bccbb9',
        }}
      >
        {player.number ?? '–'}
      </span>
      <span className="flex-1 min-w-0 text-[11px] md:text-sm text-on-surface truncate">
        {player.name}
      </span>
      {player.position && (
        <span className="text-[9px] md:text-[10px] text-on-surface-variant uppercase tracking-wider shrink-0">
          {posLabel[player.position] ?? player.position}
        </span>
      )}
    </div>
  );
}

function TeamColumn({ lineup, side }: { lineup: TeamLineup; side: 'home' | 'away' }) {
  const accent = side === 'home' ? '#4be277' : '#adc6ff';
  const accentBg = side === 'home' ? 'rgba(75,226,119,0.12)' : 'rgba(173,198,255,0.12)';

  return (
    <div className="flex flex-col gap-3">
      <div
        className="rounded-lg p-2.5 md:p-3 border border-surface-container-highest/40"
        style={{ background: accentBg }}
      >
        <div className="flex items-center gap-2">
          {lineup.teamLogo ? (
            <img
              src={lineup.teamLogo}
              alt=""
              className="w-6 h-6 md:w-8 md:h-8 object-contain shrink-0"
            />
          ) : (
            <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-surface-container-high shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[12px] md:text-sm font-extrabold text-on-surface truncate">
              {lineup.teamName}
            </div>
            {lineup.formation && (
              <div
                className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider"
                style={{ color: accent }}
              >
                Formation · {lineup.formation}
              </div>
            )}
          </div>
        </div>
      </div>

      {lineup.coach && (
        <div className="rounded-lg bg-surface-container/50 border border-surface-container-highest/30 p-2.5 md:p-3">
          <div className="text-[9px] md:text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-2">
            Coach
          </div>
          <div className="flex items-center gap-2">
            {lineup.coach.photo ? (
              <img
                src={lineup.coach.photo}
                alt=""
                className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover bg-surface-container-high shrink-0"
              />
            ) : (
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-surface-container-high shrink-0" />
            )}
            <span className="text-[11px] md:text-sm font-semibold text-on-surface truncate">
              {lineup.coach.name}
            </span>
          </div>
        </div>
      )}

      {lineup.startXI.length > 0 && (
        <div className="rounded-lg bg-surface-container/50 border border-surface-container-highest/30 p-2.5 md:p-3">
          <div className="text-[9px] md:text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-2">
            Starting XI · {lineup.startXI.length}
          </div>
          <div className="flex flex-col">
            {lineup.startXI.map((p) => (
              <PlayerRow key={p.id} player={p} />
            ))}
          </div>
        </div>
      )}

      {lineup.substitutes.length > 0 && (
        <div className="rounded-lg bg-surface-container/50 border border-surface-container-highest/30 p-2.5 md:p-3">
          <div className="text-[9px] md:text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-2">
            Substitutes · {lineup.substitutes.length}
          </div>
          <div className="flex flex-col">
            {lineup.substitutes.map((p) => (
              <PlayerRow key={p.id} player={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Lineups({ lineups }: { lineups: TeamLineup[] }) {
  if (!lineups.length) return null;

  const [home, away] = lineups;

  return (
    <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-3 sm:p-4 md:p-5 shadow-lg">
      <div className="flex items-center gap-1.5 md:gap-2 pb-2.5 md:pb-3 mb-3 md:mb-4 border-b border-surface-container-highest/40">
        <span className="material-symbols-outlined text-[16px] md:text-[20px] text-primary">
          groups
        </span>
        <h2 className="text-sm md:text-lg font-extrabold uppercase tracking-tight text-on-surface">
          Lineups &amp; Coaches
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
        {home && <TeamColumn lineup={home} side="home" />}
        {away && <TeamColumn lineup={away} side="away" />}
      </div>
    </section>
  );
}
