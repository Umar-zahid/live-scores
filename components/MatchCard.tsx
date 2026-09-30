import { FootballMatch } from '@/types';
import LiveBadge from './LiveBadge';

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function MatchCard({ match }: { match: FootballMatch }) {
  const { homeTeam, awayTeam } = match;

  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 hover:bg-slate-800/50 transition-colors">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {match.league}
        </span>
        {match.status === 'live' && <LiveBadge />}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium text-white truncate">{homeTeam.name}</div>
          <div className="text-2xl font-bold text-white">{homeTeam.score}</div>
        </div>
        <div className="text-gray-500 text-lg px-3">–</div>
        <div className="flex-1 text-right">
          <div className="font-medium text-white truncate">{awayTeam.name}</div>
          <div className="text-2xl font-bold text-white">{awayTeam.score}</div>
        </div>
      </div>

      <div className="mt-3 text-xs flex justify-between">
        {match.status === 'live' && (
          <span className="text-red-500 font-semibold">{`${match.minute}'`}</span>
        )}
        {match.status === 'halftime' && (
          <span className="text-orange-400 font-semibold">HT</span>
        )}
        {match.status === 'finished' && (
          <span className="text-gray-400">FT</span>
        )}
        {match.status === 'upcoming' && (
          <span className="text-gray-400">{formatTime(match.startTime)}</span>
        )}
      </div>
    </div>
  );
}
