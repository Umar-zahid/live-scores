import CricketCard from '@/components/cricket/CricketCard';
import { CricketMatch } from '@/types';
import matchesData from '@/data/cricket.json';

// JSON infers `status` as a plain string, so cast it to our type
const matches = matchesData as unknown as CricketMatch[];

export default function CricketPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-xl font-bold text-white">Cricket</h1>

        <div className="flex flex-col gap-3">
          {matches.map((match) => (
            <CricketCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </main>
  );
}
