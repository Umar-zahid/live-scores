// components/football/DatePicker.tsx
'use client';

import { useRouter } from 'next/navigation';

function shiftDate(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function labelFor(iso: string, today: string): string {
  if (iso === today) return 'Today';
  if (iso === shiftDate(today, 1)) return 'Tomorrow';
  if (iso === shiftDate(today, -1)) return 'Yesterday';
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export default function DatePicker({ selectedDate }: { selectedDate: string }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === today;

  const go = (date: string) => {
    if (date === today) router.push('/football');
    else router.push(`/football?date=${date}`);
  };

  return (
    <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => go(shiftDate(selectedDate, -1))}
        aria-label="Previous day"
        className="w-8 h-8 rounded-full bg-surface-container border border-surface-container-highest hover:bg-surface-container-high flex items-center justify-center transition-colors shrink-0"
      >
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
          chevron_left
        </span>
      </button>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => {
          if (e.target.value) go(e.target.value);
        }}
        aria-label="Pick a date"
        className="px-3 py-1.5 rounded-full bg-surface-container border border-surface-container-highest text-[11px] md:text-xs font-bold tracking-wide text-on-surface cursor-pointer hover:bg-surface-container-high transition-colors"
        style={{ colorScheme: 'dark' }}
      />

      <button
        type="button"
        onClick={() => go(shiftDate(selectedDate, 1))}
        aria-label="Next day"
        className="w-8 h-8 rounded-full bg-surface-container border border-surface-container-highest hover:bg-surface-container-high flex items-center justify-center transition-colors shrink-0"
      >
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
          chevron_right
        </span>
      </button>

      <span className="text-[10px] md:text-xs uppercase tracking-wider text-on-surface-variant font-bold px-1 hidden sm:inline">
        {labelFor(selectedDate, today)}
      </span>

      {!isToday && (
        <button
          type="button"
          onClick={() => go(today)}
          className="px-3 py-1.5 rounded-full bg-primary text-on-primary text-[10px] md:text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          Today
        </button>
      )}
    </div>
  );
}
