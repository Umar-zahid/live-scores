'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-space-lg px-gutter-desktop h-16">
        <Link href="/" className="flex items-center gap-space-sm group focus:outline-none shrink-0">
          <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline-variant/30 group-hover:border-primary transition-colors">
            <span className="material-symbols-outlined text-primary text-[20px]">
              sports_score
            </span>
          </div>
          <span className="font-headline-md text-headline-md tracking-tight text-on-surface font-extrabold uppercase">
            LiveScore<span className="text-primary">Hub</span>
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-space-xs p-1 bg-surface-container-lowest/60 rounded-full border border-surface-container-highest/40">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`px-space-md py-1 font-label-md text-label-md uppercase tracking-wider rounded-full transition-colors ${
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

        <div className="flex items-center gap-space-md">
          <div className="hidden sm:flex items-center gap-space-xs bg-error-container/20 border border-error/30 px-space-md py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-error uppercase tracking-wider font-bold">
              Live Pulse
            </span>
          </div>
          <button
            aria-label="User Profile"
            className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/40 hover:border-primary flex items-center justify-center transition-colors focus:outline-none"
            type="button"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">
              person
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
