import Link from 'next/link';
import LiveBadge from '@/components/shared/LiveBadge';
import { CricketMatch } from '@/types';
import matchesData from '@/data/cricket.json';

// JSON infers `status` as a plain string, so cast it to our type
const matches = matchesData as unknown as CricketMatch[];

type Team = CricketMatch['team1'];

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

function BackLink() {
  return (
    <Link
      href="/cricket"
      className="mb-4 inline-block text-sm text-gray-400 hover:text-white transition-colors"
    >
      ← Back to matches
    </Link>
  );
}

function TeamScore({ team, align }: { team: Team; align: 'left' | 'right' }) {
  const hasScore = team.overs !== '0.0';

  return (
    <div className={`flex-1 ${align === 'right' ? 'text-right' : ''}`}>
      <div className="font-medium text-white truncate">{team.name}</div>
      <div className="text-4xl font-bold text-white">
        {hasScore ? `${team.score}/${team.wickets}` : '–'}
      </div>
      {hasScore && (
        <div className="text-sm text-gray-400">({team.overs} ov)</div>
      )}
    </div>
  );
}

export default function CricketDetailPage({
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

  return (
    <main className="min-h-screen bg-slate-950 p-4">
      <div className="mx-auto max-w-2xl">
        <BackLink />

        <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              {match.league}
            </span>
            {match.status === 'live' && <LiveBadge />}
          </div>

          {/* Scoreboard */}
          <div className="flex items-center justify-between">
            <TeamScore team={match.team1} align="left" />
            <div className="px-3 text-lg text-gray-500">vs</div>
            <TeamScore team={match.team2} align="right" />
          </div>

          {/* Status */}
          <div className="mt-4 border-t border-slate-800 pt-4 text-center">
            <div
              className={`text-sm ${
                match.status === 'live'
                  ? 'font-semibold text-red-500'
                  : 'text-gray-300'
              }`}
            >
              {match.status === 'upcoming'
                ? `Starts ${formatTime(match.startTime)}`
                : match.statusText}
            </div>

            {match.status === 'live' && (
              <div className="mt-1 text-xs text-gray-400">
                Current run rate: {match.runRate.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
