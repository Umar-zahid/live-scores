import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-surface-container-lowest p-4 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-container mb-4">
          <span className="material-symbols-outlined text-[40px] text-on-surface-variant">
            search_off
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-on-surface mb-2">
          404 — Page not found
        </h1>
        <p className="text-sm text-on-surface-variant mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Home
          </Link>
          <Link
            href="/football"
            className="px-4 py-2 rounded-full bg-surface-container text-on-surface text-xs font-bold uppercase tracking-wider hover:bg-surface-container-high transition-colors"
          >
            Football
          </Link>
        </div>
      </div>
    </main>
  );
}
