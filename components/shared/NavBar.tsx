'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from './SearchBar';

const links = [
  { href: '/', label: 'Home' },
  { href: '/football', label: 'Football' },
  { href: '/cricket', label: 'Cricket' },
  { href: '/f1', label: 'Formula 1' },
];

export default function NavBar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-container-highest/60 bg-surface-container-low/95 backdrop-blur-xl text-on-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 md:gap-4 px-3 md:px-6 h-14 md:h-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 md:gap-2 group focus:outline-none shrink-0"
        >
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline-variant/30 group-hover:border-primary transition-colors">
            <span className="material-symbols-outlined text-primary text-[18px] md:text-[20px]">
              sports_score
            </span>
          </div>
          <span className="hidden sm:inline text-sm md:text-base tracking-tight text-on-surface font-extrabold uppercase">
            LiveScore<span className="text-primary">Hub</span>
          </span>
        </Link>

        {/* Nav links — desktop */}
        <ul className="hidden md:flex items-center gap-1 p-1 bg-surface-container-lowest/60 rounded-full border border-surface-container-highest/40">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`px-3 py-1 text-[11px] md:text-xs uppercase tracking-wider font-bold rounded-full transition-colors ${
                  isActive(l.href)
                    ? 'bg-surface-container-highest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side: search + live pulse + user */}
        <div className="flex items-center gap-1.5 md:gap-3">
          <SearchBar />
          <div className="hidden lg:flex items-center gap-1.5 bg-error-container/20 border border-error/30 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
            <span className="text-[10px] text-error uppercase tracking-wider font-bold">
              Live
            </span>
          </div>
          <button
            aria-label="User Profile"
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-surface-container-high border border-outline-variant/40 hover:border-primary flex items-center justify-center transition-colors focus:outline-none"
            type="button"
          >
            <span className="material-symbols-outlined text-primary text-[18px] md:text-[20px]">
              person
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav links — horizontal scroll strip */}
      <div
        className="md:hidden flex gap-1.5 overflow-x-auto px-3 pb-2 -mt-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`shrink-0 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border transition-colors ${
              isActive(l.href)
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container text-on-surface-variant border-surface-container-highest'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
