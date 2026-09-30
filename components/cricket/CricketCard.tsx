import { CricketMatch } from '@/types';
import LiveBadge from '../shared/LiveBadge';

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

type Team = CricketMatch['team1'];

function TeamRow({ team, align }: { team: Team; align: 'left' | 'right' }) {
  const hasScore = team.overs !== '0.0';

  return (
    <div className={`flex-1 ${align === 'right' ? 'text-right' : ''}`}>
      <div className="font-medium text-white truncate">{team.name}</div>
      <div className="text-2xl font-bold text-white">
        {hasScore ? `${team.score}/${team.wickets}` : '–'}
      </div>
      {hasScore && (
        <div className="text-xs text-gray-400">({team.overs} ov)</div>
      )}
    </div>
  );
}

export default function CricketCard({ match }: { match: CricketMatch }) {
  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 hover:bg-slate-800/50 transition-colors">
      {/* Top row */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {match.league}
        </span>
        {match.status === 'live' && <LiveBadge />}
      </div>

      {/* Middle row */}
      <div className="flex items-center justify-between">
        <TeamRow team={match.team1} align="left" />
        <div className="text-gray-500 text-lg px-3">vs</div>
        <TeamRow team={match.team2} align="right" />
      </div>

      {/* Bottom row */}
      <div className="mt-3 text-xs flex justify-between">
        <span
          className={
            match.status === 'live'
              ? 'text-red-500 font-semibold'
              : 'text-gray-400'
          }
        >
          {match.status === 'upcoming'
            ? `Starts ${formatTime(match.startTime)}`
            : match.statusText}
        </span>
        {match.status === 'live' && (
          <span className="text-gray-400">RR {match.runRate.toFixed(2)}</span>
        )}
      </div>
    </div>
  );
}
