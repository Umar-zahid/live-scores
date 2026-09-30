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
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900 text-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-2">
        <Link href="/" className="shrink-0 text-sm font-bold sm:text-base">
          LiveScoreHub
        </Link>

        <ul className="flex items-center gap-1 overflow-x-auto">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`whitespace-nowrap rounded px-2 py-1 text-xs transition-colors sm:px-3 sm:text-sm ${
                  isActive(l.href)
                    ? 'bg-slate-700 font-semibold text-white'
                    : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
