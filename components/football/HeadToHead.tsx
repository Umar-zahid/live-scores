import Link from 'next/link';
import type { HeadToHead as H2H } from '@/types';

function ResultPill({ label }: { label: string }) {
  return (
    <span className="text-[10px] md:text-xs uppercase tracking-wider text-on-surface-variant font-bold">
      {label}
    </span>
  );
}

function TeamResultBadge({ result }: { result: 'W' | 'D' | 'L' }) {
  const s =
    result === 'W'
      ? 'bg-primary/25 text-primary'
      : result === 'L'
      ? 'bg-error-container/40 text-error'
      : 'bg-surface-container text-on-surface-variant';
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-black ${s}`}
    >
      {result}
    </span>
  );
}

export default function HeadToHead({
  h2h,
  homeTeam,
  awayTeam,
  currentMatchId,
}: {
  h2h: H2H;
  homeTeam: string;
  awayTeam: string;
  currentMatchId: string;
}) {
  const played = h2h.totalMatches;

  if (played === 0) {
    return (
      <div className="rounded-xl bg-surface-container-low/40 border border-surface-container-highest/30 p-8 text-center">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2">
          compare_arrows
        </span>
        <p className="text-sm text-on-surface-variant">
          These teams haven&apos;t met before in our data.
        </p>
      </div>
    );
  }

  const homePct = played > 0 ? (h2h.homeWins / played) * 100 : 0;
  const drawPct = played > 0 ? (h2h.draws / played) * 100 : 0;
  const awayPct = played > 0 ? (h2h.awayWins / played) * 100 : 0;

  // Filter out the currently-viewed match from the recent list
  const currentBzId = currentMatchId.startsWith('bz-') ? currentMatchId.slice(3) : '';
  const recent = h2h.recentMatches
    .filter((m) => String(m.eventId) !== currentBzId)
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-4">
      {/* Summary bar */}
      <div className="rounded-xl bg-surface-container-low/60 border border-surface-container-highest/40 p-4 md:p-5">
        <div className="flex items-center justify-between text-[11px] md:text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">
          <ResultPill label={`${played} match${played === 1 ? '' : 'es'}`} />
          <ResultPill label={`${h2h.avgTotalGoals.toFixed(1)} avg goals`} />
        </div>
        <div className="flex h-2 rounded-full overflow-hidden bg-surface-container mb-3">
          <div className="bg-primary" style={{ width: `${homePct}%` }} />
          <div className="bg-outline/60" style={{ width: `${drawPct}%` }} />
          <div className="bg-secondary" style={{ width: `${awayPct}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] md:text-xs">
          <div>
            <div className="font-black text-primary tabular-nums text-base md:text-lg">
              {h2h.homeWins}
            </div>
            <div className="text-on-surface-variant uppercase tracking-wider truncate">
              {homeTeam} wins
            </div>
          </div>
          <div>
            <div className="font-black text-on-surface-variant tabular-nums text-base md:text-lg">
              {h2h.draws}
            </div>
            <div className="text-on-surface-variant uppercase tracking-wider">draws</div>
          </div>
          <div>
            <div className="font-black text-secondary tabular-nums text-base md:text-lg">
              {h2h.awayWins}
            </div>
            <div className="text-on-surface-variant uppercase tracking-wider truncate">
              {awayTeam} wins
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-surface-container-highest/30 flex items-center justify-between text-[10px] md:text-xs text-on-surface-variant">
          <span>Goals</span>
          <span className="tabular-nums font-bold text-on-surface">
            {h2h.homeGoals} – {h2h.awayGoals}
          </span>
        </div>
      </div>

      {/* Recent meetings */}
      {recent.length > 0 && (
        <div className="rounded-xl bg-surface-container-low/60 border border-surface-container-highest/40 overflow-hidden">
          <div className="px-3 sm:px-4 py-2.5 border-b border-surface-container-highest/40 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-primary">
              history
            </span>
            <span className="text-[11px] md:text-xs uppercase tracking-widest text-on-surface font-bold">
              Previous Meetings
            </span>
          </div>
          <div className="flex flex-col">
            {recent.map((m) => {
              const currentHomeIsMatchHome = m.homeTeam === homeTeam;
              const homeWon = m.homeScore > m.awayScore;
              const awayWon = m.awayScore > m.homeScore;
              const homeResult: 'W' | 'D' | 'L' = homeWon ? 'W' : awayWon ? 'L' : 'D';
              return (
                <Link
                  key={m.eventId}
                  href={`/football/bz-${m.eventId}`}
                  className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 border-t border-surface-container-highest/30 first:border-t-0 hover:bg-surface-container/40 transition-colors"
                >
                  <span className="text-[10px] md:text-[11px] text-on-surface-variant tabular-nums shrink-0 w-16 md:w-20">
                    {new Date(m.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: '2-digit',
                    })}
                  </span>
                  <div className="flex-1 min-w-0 flex items-center gap-2 justify-center">
                    <span
                      className={`text-[12px] md:text-sm truncate text-right flex-1 ${
                        homeWon ? 'text-on-surface font-bold' : 'text-on-surface-variant'
                      }`}
                    >
                      {m.homeTeam}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-[11px] md:text-sm font-bold text-on-surface tabular-nums shrink-0">
                      {m.homeScore} – {m.awayScore}
                    </span>
                    <span
                      className={`text-[12px] md:text-sm truncate flex-1 ${
                        awayWon ? 'text-on-surface font-bold' : 'text-on-surface-variant'
                      }`}
                    >
                      {m.awayTeam}
                    </span>
                  </div>
                  <TeamResultBadge result={homeResult} />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {recent.length === 0 && (
        <p className="text-[10px] md:text-xs text-on-surface-variant/70 text-center">
          No previous meetings outside this fixture.
        </p>
      )}
    </div>
  );
}
