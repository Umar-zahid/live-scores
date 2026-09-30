import Link from 'next/link';

const sports = [
  { href: '/football', label: 'Football', blurb: 'Premier League live scores' },
  { href: '/cricket', label: 'Cricket', blurb: 'T20, ODI and IPL matches' },
  { href: '/f1', label: 'Formula 1', blurb: 'Live race standings' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-2xl font-bold text-white">LiveScoreHub</h1>
        <p className="mb-6 text-sm text-gray-400">
          Pick a sport to see live scores.
        </p>

        <div className="flex flex-col gap-3">
          {sports.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-lg bg-slate-900 border border-slate-800 p-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="font-medium text-white">{s.label}</div>
              <div className="text-xs text-gray-400">{s.blurb}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
