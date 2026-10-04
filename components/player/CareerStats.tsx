import type { BzzoiroCareer, BzzoiroCareerSeason } from '@/lib/sources/bzzoiro';
import { findLeagueById } from '@/lib/sources/leagues';

function leagueLabel(id: number): string {
  const league = findLeagueById(id);
  return league?.name ?? `League ${id}`;
}

function fmtMinutes(min: number): string {
  if (min >= 1000) return `${(min / 1000).toFixed(1)}k`;
  return String(min);
}

function ratingColor(r: number | null): string {
  if (r == null) return 'text-outline';
  if (r >= 7.5) return 'text-primary';
  if (r >= 7.0) return 'text-secondary';
  if (r >= 6.5) return 'text-on-surface';
  return 'text-on-surface-variant';
}

export default function CareerStats({ career }: { career: BzzoiroCareer }) {
  const seasons = career.seasons ?? [];
  if (seasons.length === 0) return null;

  // Total row across all seasons
  const totals = seasons.reduce(
    (acc, s) => ({
      matches: acc.matches + (s.matches ?? 0),
      minutes: acc.minutes + (s.minutes ?? 0),
      goals: acc.goals + (s.goals ?? 0),
      assists: acc.assists + (s.assists ?? 0),
    }),
    { matches: 0, minutes: 0, goals: 0, assists: 0 }
  );

  return (
    <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 sm:px-4 md:px-5 py-3 border-b border-surface-container-highest/40">
        <span className="material-symbols-outlined text-[18px] text-primary">
          leaderboard
        </span>
        <h2 className="text-sm md:text-base font-extrabold uppercase tracking-tight text-on-surface">
          Career Stats
        </h2>
        <span className="text-[10px] md:text-xs text-on-surface-variant ml-auto">
          {seasons.length} season{seasons.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] md:text-xs">
          <thead>
            <tr className="text-[9px] md:text-[10px] text-on-surface-variant uppercase tracking-wider bg-surface-container/40">
              <th className="py-2 pl-3 md:pl-4 pr-1 font-bold">Season</th>
              <th className="py-2 px-1 font-bold">League</th>
              <th className="py-2 px-1 font-bold text-center w-10">M</th>
              <th className="py-2 px-1 font-bold text-center w-12 hidden sm:table-cell">Min</th>
              <th className="py-2 px-1 font-bold text-center w-10">G</th>
              <th className="py-2 px-1 font-bold text-center w-10">A</th>
              <th className="py-2 px-2 md:px-3 font-bold text-center w-14">Rating</th>
            </tr>
          </thead>
          <tbody>
            {seasons.map((s) => (
              <tr
                key={`${s.season_id}-${s.team_id}-${s.league_id}`}
                className="border-t border-surface-container-highest/30 hover:bg-surface-container/40 transition-colors"
              >
                <td className="py-2 pl-3 md:pl-4 pr-1 font-bold text-on-surface tabular-nums">
                  #{s.season_id}
                </td>
                <td className="py-2 px-1 text-on-surface-variant truncate max-w-[160px]">
                  {leagueLabel(s.league_id)}
                </td>
                <td className="py-2 px-1 text-center tabular-nums text-on-surface">
                  {s.matches}
                </td>
                <td className="py-2 px-1 text-center tabular-nums text-on-surface-variant hidden sm:table-cell">
                  {fmtMinutes(s.minutes)}
                </td>
                <td className="py-2 px-1 text-center tabular-nums font-bold text-primary">
                  {s.goals || ''}
                </td>
                <td className="py-2 px-1 text-center tabular-nums font-bold text-secondary">
                  {s.assists || ''}
                </td>
                <td className={`py-2 px-2 md:px-3 text-center tabular-nums font-bold ${ratingColor(s.avg_rating)}`}>
                  {s.avg_rating != null ? s.avg_rating.toFixed(1) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          {seasons.length > 1 && (
            <tfoot>
              <tr className="border-t-2 border-primary/30 bg-primary/5">
                <td className="py-2 pl-3 md:pl-4 pr-1 font-black text-primary uppercase text-[10px] tracking-wider">
                  Total
                </td>
                <td className="py-2 px-1 text-on-surface-variant">—</td>
                <td className="py-2 px-1 text-center tabular-nums font-black text-on-surface">
                  {totals.matches}
                </td>
                <td className="py-2 px-1 text-center tabular-nums font-black text-on-surface hidden sm:table-cell">
                  {fmtMinutes(totals.minutes)}
                </td>
                <td className="py-2 px-1 text-center tabular-nums font-black text-primary">
                  {totals.goals}
                </td>
                <td className="py-2 px-1 text-center tabular-nums font-black text-secondary">
                  {totals.assists}
                </td>
                <td className="py-2 px-2 md:px-3 text-center">—</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="px-3 md:px-4 py-2 border-t border-surface-container-highest/30 text-[10px] text-on-surface-variant/70 text-center">
        Season IDs are Bzzoiro internal references — sorted as returned by the API.
      </div>
    </section>
  );
}
