import Link from 'next/link';
import type { StandingRow } from '@/lib/football-api';

function FormPill({ r }: { r: string }) {
  const style =
    r === 'W'
      ? 'bg-primary/25 text-primary'
      : r === 'L'
      ? 'bg-error-container/40 text-error'
      : 'bg-surface-container text-on-surface-variant';
  return (
    <span
      className={`inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-black ${style}`}
    >
      {r}
    </span>
  );
}

function zoneColor(zoneKey: string | undefined): string {
  if (!zoneKey) return 'transparent';
  const k = zoneKey.toLowerCase();
  if (k.includes('cl') || k.includes('champions')) return '#4be277';
  if (k.includes('el') || k.includes('europa')) return '#adc6ff';
  if (k.includes('conf') || k.includes('conference')) return '#bccbb9';
  if (k.includes('releg')) return '#ffb4ab';
  if (k.includes('playoff') || k.includes('qual')) return '#facc15';
  return 'transparent';
}

export default function LeagueStandings({
  standings,
  seasonName,
}: {
  standings: StandingRow[];
  seasonName?: string;
}) {
  if (!standings.length) return null;

  return (
    <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 sm:px-4 md:px-5 py-3 border-b border-surface-container-highest/40">
        <span className="material-symbols-outlined text-[18px] text-primary">
          format_list_numbered
        </span>
        <h2 className="text-sm md:text-base font-extrabold uppercase tracking-tight text-on-surface">
          Standings
        </h2>
        {seasonName && (
          <span className="text-[10px] md:text-xs text-on-surface-variant ml-auto truncate">
            {seasonName}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] md:text-xs">
          <thead>
            <tr className="text-[9px] md:text-[10px] text-on-surface-variant uppercase tracking-wider bg-surface-container/40">
              <th className="py-2 pl-2 md:pl-3 pr-1 font-bold text-center w-8">#</th>
              <th className="py-2 px-1 font-bold">Team</th>
              <th className="py-2 px-1 font-bold text-center w-8">P</th>
              <th className="py-2 px-1 font-bold text-center w-8 hidden sm:table-cell">W</th>
              <th className="py-2 px-1 font-bold text-center w-8 hidden sm:table-cell">D</th>
              <th className="py-2 px-1 font-bold text-center w-8 hidden sm:table-cell">L</th>
              <th className="py-2 px-1 font-bold text-center w-12 hidden md:table-cell">GD</th>
              <th className="py-2 px-1 font-bold text-center w-10">Pts</th>
              <th className="py-2 px-2 font-bold text-right w-24 hidden md:table-cell">Form</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((r) => (
              <tr
                key={r.teamId}
                className="border-t border-surface-container-highest/30 hover:bg-surface-container/40 transition-colors"
              >
                <td className="relative py-1.5 pl-2 md:pl-3 pr-1 text-center tabular-nums text-on-surface-variant font-bold">
                  {r.zoneKey && (
                    <span
                      className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r"
                      style={{ background: zoneColor(r.zoneKey) }}
                    />
                  )}
                  {r.rank}
                </td>
                <td className="py-1.5 px-1">
                  <Link
                    href={`/team/${r.teamId}`}
                    className="flex items-center gap-1.5 md:gap-2 min-w-0 hover:text-primary transition-colors"
                  >
                    {r.teamLogo && (
                      <img
                        src={r.teamLogo}
                        alt=""
                        className="w-4 h-4 md:w-5 md:h-5 object-contain shrink-0"
                      />
                    )}
                    <span className="font-semibold text-on-surface truncate">
                      {r.teamName}
                    </span>
                  </Link>
                </td>
                <td className="py-1.5 px-1 text-center tabular-nums text-on-surface-variant">
                  {r.played}
                </td>
                <td className="py-1.5 px-1 text-center tabular-nums text-on-surface-variant hidden sm:table-cell">
                  {r.win}
                </td>
                <td className="py-1.5 px-1 text-center tabular-nums text-on-surface-variant hidden sm:table-cell">
                  {r.draw}
                </td>
                <td className="py-1.5 px-1 text-center tabular-nums text-on-surface-variant hidden sm:table-cell">
                  {r.lose}
                </td>
                <td className="py-1.5 px-1 text-center tabular-nums text-on-surface-variant hidden md:table-cell">
                  {r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}
                </td>
                <td className="py-1.5 px-1 text-center tabular-nums font-black text-on-surface">
                  {r.points}
                </td>
                <td className="py-1.5 px-2 hidden md:table-cell">
                  <div className="flex items-center justify-end gap-0.5">
                    {(r.form ?? '').split('').slice(-5).map((f, i) => (
                      <FormPill key={i} r={f} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
