import F1RaceCard from '@/components/f1/F1RaceCard';
import { F1Race } from '@/types';
import racesData from '@/data/f1.json';

// JSON infers `status` as a plain string, so cast it to our type
const races = racesData as unknown as F1Race[];

export default function F1Page() {
  return (
    <main className="min-h-screen bg-slate-950 p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-xl font-bold text-white">Formula 1</h1>

        <div className="flex flex-col gap-3">
          {races.map((race) => (
            <F1RaceCard key={race.id} race={race} />
          ))}
        </div>
      </div>
    </main>
  );
}
