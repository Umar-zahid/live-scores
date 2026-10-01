import type { PlayerMatchStat } from '@/types';

function RatingBadge({ rating }: { rating: number | null }) {
  if (!rating) {
    return <span className="text-outline">—</span>;
  }
  const cls =
    rating >= 7.5
      ? 'bg-primary/20 text-primary'
      : rating >= 6.5
      ? 'bg-surface-container text-on-surface'
      : 'bg-error/15 text-error';
  return (
    <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${cls}`}>
      {rating.toFixed(1)}
    </span>
  );
}

function CardMark({ yellow, red }: { yellow: number; red: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {yellow > 0 && (
        <span className="inline-block w-2.5 h-3.5 rounded-[2px] bg-yellow-400" />
      )}
      {red > 0 && (
        <span className="inline-block w-2.5 h-3.5 rounded-[2px] bg-error" />
      )}
    </span>
  );
}

function TeamTable({
  title,
  players,
}: {
  title: string;
  players: PlayerMatchStat[];
}) {
  if (!players.length) return null;

  return (
    <div className="mb-5 last:mb-0">
      <div className="text-label-sm font-label-sm uppercase text-on-surface-variant tracking-wider mb-2">
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-body-sm font-body-sm">
          <thead>
            <tr className="text-on-surface-variant text-label-sm uppercase tracking-wider">
              <th className="py-1.5 pr-2 font-normal">Player</th>
              <th className="py-1.5 px-1 font-normal text-center">Min</th>
              <th className="py-1.5 px-1 font-normal text-center">G</th>
              <th className="py-1.5 px-1 font-normal text-center">A</th>
              <th className="py-1.5 px-1 font-normal text-center">Rating</th>
            </tr>
          </thead>
          <tbody>
            {players
              .sort((a, b) => b.minutes - a.minutes)
              .map((p) => (
                <tr
                  key={p.playerId}
                  className="border-t border-surface-container-highest/30 hover:bg-surface-container/40 transition-colors"
                >
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2">
                      {p.photo && (
                        <img
                          src={p.photo}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover bg-surface-container-highest"
                        />
                      )}
                      <span className="text-on-surface truncate max-w-[160px]">
                        {p.number && (
                          <span className="text-outline text-[11px] mr-1">
                            {p.number}
                          </span>
                        )}
                        {p.name}
                      </span>
                      <CardMark yellow={p.yellow} red={p.red} />
                    </div>
                  </td>
                  <td className="py-2 px-1 text-center tabular-nums text-on-surface-variant">
                    {p.minutes}
                  </td>
                  <td className="py-2 px-1 text-center tabular-nums text-primary font-bold">
                    {p.goals || ''}
                  </td>
                  <td className="py-2 px-1 text-center tabular-nums text-secondary">
                    {p.assists || ''}
                  </td>
                  <td className="py-2 px-1 text-center tabular-nums">
                    <RatingBadge rating={p.rating} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PlayerMatchStats({
  players,
  homeName,
  awayName,
}: {
  players: PlayerMatchStat[];
  homeName: string;
  awayName: string;
}) {
  if (!players.length) return null;

  const home = players.filter((p) => p.team === 'home');
  const away = players.filter((p) => p.team === 'away');

  return (
    <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 p-3 md:p-5 shadow-lg">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-surface-container-highest/40">
        <span className="material-symbols-outlined text-[20px] text-primary">
          groups
        </span>
        <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold uppercase tracking-tight">
          Player Stats
        </h2>
      </div>
      <TeamTable title={homeName} players={home} />
      <TeamTable title={awayName} players={away} />
    </section>
  );
}
