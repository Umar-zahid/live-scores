import type { TeamFormMatch, HeadToHead as H2H } from '@/types';

function FormPill({ r }: { r: 'W' | 'D' | 'L' }) {
  const s =
    r === 'W'
      ? 'bg-primary/25 text-primary border-primary/40'
      : r === 'L'
      ? 'bg-error-container/40 text-error border-error/40'
      : 'bg-surface-container text-on-surface-variant border-surface-container-highest';
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-black border ${s}`}
    >
      {r}
    </span>
  );
}

function TeamFormColumn({
  teamName,
  form,
  accent,
}: {
  teamName: string;
  form: TeamFormMatch[];
  accent: 'home' | 'away';
}) {
  const tint = accent === 'home' ? 'text-primary' : 'text-secondary';
  const wins = form.filter((f) => f.result === 'W').length;
  const draws = form.filter((f) => f.result === 'D').length;
  const losses = form.filter((f) => f.result === 'L').length;

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-surface-container/40 border border-surface-container-highest/30 p-3">
      <div className={`text-[10px] md:text-xs uppercase tracking-widest font-bold truncate ${tint}`}>
        {teamName}
      </div>
      {form.length === 0 ? (
        <p className="text-[10px] text-on-surface-variant/70">No recent matches.</p>
      ) : (
        <>
          <div className="flex items-center gap-1 flex-wrap">
            {form.map((m, i) => (
              <FormPill key={i} r={m.result} />
            ))}
          </div>
          <div className="text-[10px] text-on-surface-variant tabular-nums">
            {wins}W · {draws}D · {losses}L
          </div>
        </>
      )}
    </div>
  );
}

export default function MatchPreview({
  homeTeam,
  awayTeam,
  homeForm,
  awayForm,
  h2h,
}: {
  homeTeam: string;
  awayTeam: string;
  homeForm: TeamFormMatch[];
  awayForm: TeamFormMatch[];
  h2h: H2H | null | undefined;
}) {
  const hasAnything = homeForm.length > 0 || awayForm.length > 0 || (h2h && h2h.totalMatches > 0);
  if (!hasAnything) return null;

  const total = h2h?.totalMatches ?? 0;
  const lastMeeting =
    h2h?.recentMatches && h2h.recentMatches.length > 0
      ? h2h.recentMatches[0]
      : null;

  return (
    <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-lg p-3 md:p-5">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-surface-container-highest/40">
        <span className="material-symbols-outlined text-[18px] text-primary">
          preview
        </span>
        <h2 className="text-sm md:text-base font-extrabold uppercase tracking-tight text-on-surface">
          Match Preview
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <TeamFormColumn teamName={homeTeam} form={homeForm} accent="home" />
        <TeamFormColumn teamName={awayTeam} form={awayForm} accent="away" />
      </div>

      {h2h && total > 0 && (
        <div className="rounded-lg bg-surface-container/40 border border-surface-container-highest/30 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant font-bold">
            <span>Head to Head</span>
            <span>
              {total} match{total === 1 ? '' : 'es'}
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 text-[11px] md:text-xs font-bold">
            <span className="text-primary tabular-nums">{h2h.homeWins}</span>
            <span className="text-on-surface-variant">–</span>
            <span className="text-on-surface-variant tabular-nums">{h2h.draws}</span>
            <span className="text-on-surface-variant">–</span>
            <span className="text-secondary tabular-nums">{h2h.awayWins}</span>
          </div>
          {lastMeeting && (
            <div className="text-center text-[10px] md:text-xs text-on-surface-variant">
              Last: <span className="text-on-surface">{lastMeeting.homeTeam}</span>{' '}
              <span className="tabular-nums font-bold">
                {lastMeeting.homeScore} – {lastMeeting.awayScore}
              </span>{' '}
              <span className="text-on-surface">{lastMeeting.awayTeam}</span>
              {' · '}
              {new Date(lastMeeting.date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
