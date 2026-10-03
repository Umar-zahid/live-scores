'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type PlayerResult = {
  id: string;
  name: string;
  photo: string;
  age: number;
  nationality: string;
  position: string;
  team: string;
  teamLogo: string;
};

type TeamResult = {
  id: number;
  name: string;
  logo: string;
  country: string;
};

export default function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [players, setPlayers] = useState<PlayerResult[]>([]);
  const [teams, setTeams] = useState<TeamResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQ('');
      setPlayers([]);
      setTeams([]);
    }
  }, [open]);

  // Click outside closes
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Debounced fetch with abort + request-id guard so a stale "mess"
  // response can't overwrite a newer "messi" one.
  const reqIdRef = useRef(0);
  useEffect(() => {
    if (q.trim().length < 2) {
      setPlayers([]);
      setTeams([]);
      setLoading(false);
      return;
    }
    const myReq = ++reqIdRef.current;
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        if (myReq !== reqIdRef.current) return;
        setPlayers(data.players ?? []);
        setTeams(data.teams ?? []);
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === 'AbortError') return;
        if (myReq !== reqIdRef.current) return;
        setPlayers([]);
        setTeams([]);
      } finally {
        if (myReq === reqIdRef.current) setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const go = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  return (
    <>
      {/* Trigger button — visible in navbar */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-surface-container-highest transition-colors text-[11px] md:text-xs"
        aria-label="Search"
      >
        <span className="material-symbols-outlined text-[16px] md:text-[18px]">
          search
        </span>
        <span className="hidden md:inline font-bold uppercase tracking-wider">
          Search
        </span>
        <span className="hidden md:inline text-outline text-[10px] border border-outline-variant rounded px-1 ml-1">
          ⌘K
        </span>
      </button>

      {/* Command palette overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-3">
          <div
            ref={wrapRef}
            className="w-full max-w-2xl rounded-xl bg-surface-container-low border border-surface-container-highest shadow-2xl overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-2 px-3 md:px-4 py-3 border-b border-surface-container-highest">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search players, teams…"
                className="flex-1 bg-transparent outline-none text-sm md:text-base text-on-surface placeholder:text-outline"
              />
              {loading && (
                <span className="text-[10px] text-on-surface-variant uppercase">
                  …
                </span>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-outline hover:text-on-surface text-[10px] uppercase tracking-wider font-bold"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[55vh] overflow-y-auto">
              {q.trim().length < 2 && (
                <div className="p-6 text-center text-xs text-on-surface-variant">
                  Type at least 2 characters to search
                </div>
              )}

              {q.trim().length >= 2 && !loading && players.length === 0 && teams.length === 0 && (
                <div className="p-6 text-center text-xs text-on-surface-variant">
                  No results for &quot;{q}&quot;
                </div>
              )}

              {teams.length > 0 && (
                <div className="border-b border-surface-container-highest/50">
                  <div className="px-3 md:px-4 py-1.5 text-[10px] uppercase tracking-wider text-on-surface-variant bg-surface-container/40">
                    Teams
                  </div>
                  {teams.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => go(`/team/${t.id}`)}
                      className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 hover:bg-surface-container/60 text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 overflow-hidden">
                        {t.logo ? (
                          <img
                            src={t.logo}
                            alt=""
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <span className="text-[10px] font-black text-primary">
                            {t.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-on-surface truncate">
                          {t.name}
                        </div>
                        <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                          {t.country}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {players.length > 0 && (
                <div>
                  <div className="px-3 md:px-4 py-1.5 text-[10px] uppercase tracking-wider text-on-surface-variant bg-surface-container/40">
                    Players
                  </div>
                  {players.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => go(`/player/${p.id}`)}
                      className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 hover:bg-surface-container/60 text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 overflow-hidden">
                        {p.photo ? (
                          <img
                            src={p.photo}
                            alt=""
                            className="w-8 h-8 object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-black text-primary">
                            {p.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-on-surface truncate">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-on-surface-variant uppercase tracking-wider truncate">
                          {[p.position, p.team, p.nationality]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-3 md:px-4 py-2 border-t border-surface-container-highest text-[10px] text-outline flex items-center justify-between">
              <span>↵ open · esc close</span>
              <span className="hidden md:inline">LiveScoreHub</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
