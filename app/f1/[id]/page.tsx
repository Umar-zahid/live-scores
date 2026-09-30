import Link from 'next/link';
import LiveBadge from '@/components/shared/LiveBadge';
import { F1Race } from '@/types';
import racesData from '@/data/f1.json';

// JSON infers `status` as a plain string, so cast it to our type
const races = racesData as unknown as F1Race[];

const tireColors: Record<string, string> = {
  soft: 'bg-red-500',
  medium: 'bg-yellow-400',
  hard: 'bg-gray-200',
  inter: 'bg-green-500',
  wet: 'bg-blue-500',
};

function BackLink() {
  return (
    <Link
      href="/f1"
      className="mb-4 inline-block text-sm text-gray-400 hover:text-white transition-colors"
    >
      ← Back to races
    </Link>
  );
}

export default function RaceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const race = races.find((r) => r.id === params.id);

  if (!race) {
    return (
      <main className="min-h-screen bg-slate-950 p-4">
        <div className="mx-auto max-w-2xl">
          <BackLink />
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-6 text-center">
            <h1 className="mb-1 text-xl font-bold text-white">
              Race not found
            </h1>
            <p className="text-sm text-gray-400">
              There is no race with ID &quot;{params.id}&quot;.
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
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-lg font-bold text-white">{race.raceName}</h1>
            {race.status === 'live' && <LiveBadge />}
            {race.status === 'finished' && (
              <span className="text-xs text-gray-400">FINISHED</span>
            )}
            {race.status === 'upcoming' && (
              <span className="text-xs text-gray-400">UPCOMING</span>
            )}
          </div>

          {/* Lap counter */}
          {race.status !== 'upcoming' && (
            <div
              className={`mb-3 text-xs font-semibold ${
                race.status === 'live' ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              Lap {race.lap} / {race.totalLaps}
            </div>
          )}

          {/* Standings table */}
          {race.drivers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide">
                    <th className="py-1 pr-2">Pos</th>
                    <th className="py-1 pr-2">Driver</th>
                    <th className="py-1 pr-2 text-right">Gap</th>
                    <th className="py-1 pr-2 text-center">Tyre</th>
                    <th className="py-1 text-right">Pits</th>
                  </tr>
                </thead>
                <tbody>
                  {race.drivers.map((d) => (
                    <tr key={d.position} className="border-t border-slate-800">
                      <td className="py-1.5 pr-2 font-bold text-white">
                        {d.position}
                      </td>
                      <td className="py-1.5 pr-2">
                        <div className="text-white">{d.name}</div>
                        <div className="text-xs text-gray-400">{d.team}</div>
                      </td>
                      <td className="py-1.5 pr-2 text-right text-gray-300 whitespace-nowrap">
                        {d.gap}
                      </td>
                      <td className="py-1.5 pr-2 text-center">
                        <span
                          className={`inline-block h-3 w-3 rounded-full ${
                            tireColors[d.tireCompound] ?? 'bg-gray-500'
                          }`}
                          title={d.tireCompound}
                        />
                      </td>
                      <td className="py-1.5 text-right text-gray-300">
                        {d.pitStops}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Grid not available yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
