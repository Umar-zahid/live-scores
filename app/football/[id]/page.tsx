import Link from 'next/link';
import LiveBadge from '@/components/shared/LiveBadge';
import { FootballMatch } from '@/types';
import matchesData from '@/data/football.json';

// JSON infers `status` as a plain string, so cast it to our type
const matches = matchesData as unknown as FootballMatch[];

const eventMeta: Record<string, { icon: string; label: string }> = {
  goal: { icon: '⚽', label: 'Goal' },
  yellow_card: { icon: '🟨', label: 'Yellow card' },
  red_card: { icon: '🟥', label: 'Red card' },
  substitution: { icon: '🔄', label: 'Substitution' },
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

function BackLink() {
  return (
    <Link
      href="/football"
      className="mb-4 inline-block text-sm text-gray-400 hover:text-white transition-colors"
    >
      ← Back to matches
    </Link>
  );
}

export default function MatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const match = matches.find((m) => m.id === params.id);

  if (!match) {
    return (
      <main className="min-h-screen bg-slate-950 p-4">
        <div className="mx-auto max-w-2xl">
          <BackLink />
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-6 text-center">
            <h1 className="mb-1 text-xl font-bold text-white">
              Match not found
            </h1>
            <p className="text-sm text-gray-400">
              There is no match with ID &quot;{params.id}&quot;.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { homeTeam, awayTeam } = match;
  const events = [...match.events].sort((a, b) => a.minute - b.minute);

  return (
    <main className="min-h-screen bg-slate-950 p-4">
      <div className="mx-auto max-w-2xl">
        <BackLink />

        {/* Scoreboard */}
        <div className="mb-4 rounded-lg bg-slate-900 border border-slate-800 p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              {match.league}
            </span>
            {match.status === 'live' && <LiveBadge />}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-white truncate">
                {homeTeam.name}
              </div>
              <div className="text-4xl font-bold text-white">
                {homeTeam.score}
              </div>
            </div>
            <div className="px-3 text-lg text-gray-500">–</div>
            <div className="flex-1 text-right">
              <div className="font-medium text-white truncate">
                {awayTeam.name}
              </div>
              <div className="text-4xl font-bold text-white">
                {awayTeam.score}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm">
            {match.status === 'live' && (
              <span className="font-semibold text-red-500">{`${match.minute}'`}</span>
            )}
            {match.status === 'halftime' && (
              <span className="font-semibold text-orange-400">HT</span>
            )}
            {match.status === 'finished' && (
              <span className="text-gray-400">FT</span>
            )}
            {match.status === 'upcoming' && (
              <span className="text-gray-400">
                Kickoff {formatTime(match.startTime)}
              </span>
            )}
          </div>
        </div>

        {/* Event timeline */}
        <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
          <h2 className="mb-3 text-xs text-gray-400 uppercase tracking-wide">
            Match events
          </h2>

          {events.length === 0 ? (
            <p className="text-sm text-gray-400">No events yet.</p>
          ) : (
            <ul className="flex flex-col">
              {events.map((e, i) => {
                const meta = eventMeta[e.type] ?? { icon: '•', label: e.type };
                const teamName = e.team === 'home' ? homeTeam.name : awayTeam.name;

                return (
                  <li
                    key={i}
                    className="flex items-center gap-3 border-t border-slate-800 py-2 first:border-t-0"
                  >
                    <span className="w-10 text-sm font-semibold text-gray-400">
                      {e.minute}&apos;
                    </span>
                    <span className="text-base">{meta.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm text-white">{e.player}</div>
                      <div className="text-xs text-gray-400">
                        {meta.label} · {teamName}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
