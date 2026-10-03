'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Silently refreshes the current route on an interval.
 * Uses Next.js router.refresh() which re-fetches server components
 * without losing client state (tabs, scroll position, etc.).
 */
export default function AutoRefresh({ intervalMs = 30000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    if (!intervalMs || intervalMs < 5000) return;

    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (document.visibilityState === 'visible') {
        router.refresh();
      }
    };

    const id = setInterval(tick, intervalMs);

    // Also refresh on tab focus
    const onVisible = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [router, intervalMs]);

  return null;
}
