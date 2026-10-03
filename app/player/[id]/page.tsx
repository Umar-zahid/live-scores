import Link from 'next/link';
import { getBzzoiroPlayer, type BzzoiroPlayer } from '@/lib/sources/bzzoiro';

// ── API-Football basic player lookup (for team-squad links) ─────────

const AF_KEY = process.env.API_FOOTBALL_KEY;
const AF_BASE = 'https://v3.football.api-sports.io';

interface AfPlayerBasic {
  id: number;
  name: string;
  photo: string;
  age: number | null;
  nationality: string;
  height: string;
  weight: string;
  position: string;
  team: { id: number; name: string; logo: string } | null;
}

async function getApiFootballPlayer(id: string): Promise<AfPlayerBasic | null> {
  if (!AF_KEY) return null;
  try {
    // European season runs Aug-May. In Jan-Jul we're still in the
    // season that started the previous calendar year.
    const now = new Date();
    const year = now.getFullYear();
    const currentSeason = now.getMonth() >= 6 ? year : year - 1;
    // 2024 is last-resort fallback if the plan caps recent seasons.
    const seasons = Array.from(new Set([currentSeason, currentSeason - 1, 2024]));
    for (const season of seasons) {
      const res = await fetch(
        `${AF_BASE}/players?id=${id}&season=${season}`,
        {
          headers: { 'x-apisports-key': AF_KEY },
          next: { revalidate: 3600 },
        }
      );
      if (!res.ok) {
        console.warn(
          `API-Football /players?id=${id}&season=${season} → ${res.status}`
        );
        continue;
      }
      const data = await res.json();
      const p = data.response?.[0];
      if (!p) continue;
      const s0 = p.statistics?.[0] ?? {};
      return {
        id: p.player?.id ?? 0,
        name: p.player?.name ?? 'Unknown',
        photo: p.player?.photo ?? '',
        age: p.player?.age ?? null,
        nationality: p.player?.nationality ?? '',
        height: p.player?.height ?? '',
        weight: p.player?.weight ?? '',
        position: s0.games?.position ?? '',
        team: s0.team
          ? { id: s0.team.id, name: s0.team.name, logo: s0.team.logo }
          : null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ── shared helpers ─────────────────────────────────────────────────

function age(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtMoney(eur: number | null | undefined): string {
  if (eur == null) return '—';
  if (eur >= 1_000_000) return `€${(eur / 1_000_000).toFixed(1)}M`;
  if (eur >= 1_000) return `€${Math.round(eur / 1_000)}K`;
  return `€${eur}`;
}

function posLabel(p: string | null | undefined): string {
  if (!p) return '—';
  const m: Record<string, string> = {
    G: 'Goalkeeper',
    D: 'Defender',
    M: 'Midfielder',
    F: 'Forward',
  };
  return m[p] ?? p;
}

function footLabel(f: string | null | undefined): string {
  if (!f) return '—';
  if (f === 'L') return 'Left';
  if (f === 'R') return 'Right';
  if (f === 'B') return 'Both';
  return f;
}

function NotFound() {
  return (
    <main className="min-h-screen bg-surface-container-lowest p-4">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/football"
          className="mb-4 inline-block text-sm text-on-surface-variant hover:text-on-surface"
        >
          ← Back to matches
        </Link>
        <div className="rounded-lg bg-surface-container-low border border-surface-container-highest p-6 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-2">
            person_off
          </span>
          <h1 className="mb-1 text-xl font-bold text-on-surface">Player not found</h1>
          <p className="text-sm text-on-surface-variant">
            We couldn&apos;t find this player in our database.
          </p>
        </div>
      </div>
    </main>
  );
}

// ── Bzzoiro profile (rich) ─────────────────────────────────────────

function BzzoiroProfile({ player }: { player: BzzoiroPlayer }) {
  const a = age(player.date_of_birth);
  const initial = (player.short_name || player.name || '?').slice(0, 1).toUpperCase();
  const isAvailable = (player.availability ?? '').toLowerCase() === 'available';

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary-container/25 blur-[130px] rounded-full" />
      </div>

      <main className="relative z-10 w-full bg-surface-container-lowest min-h-screen">
        <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 md:px-6 py-3 md:py-6 flex flex-col gap-4">
          <Link
            href="/football"
            className="inline-flex items-center gap-1 text-on-surface-variant hover:text-on-surface text-[11px] md:text-xs uppercase tracking-wider font-bold w-fit"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back
          </Link>

          <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-5">
              <div
                className="shrink-0 flex items-center justify-center font-black text-primary"
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: '50%',
                  background: 'rgba(75,226,119,0.12)',
                  border: '2px solid rgba(75,226,119,0.35)',
                  fontSize: 36,
                }}
              >
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-3xl font-extrabold text-on-surface tracking-tight break-words">
                  {player.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] md:text-xs font-bold uppercase tracking-wider">
                    {posLabel(player.position)}
                    {player.specific_position && player.specific_position !== player.position
                      ? ` · ${player.specific_position}`
                      : ''}
                  </span>
                  {player.jersey_number != null && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-[10px] md:text-xs font-bold uppercase tracking-wider">
                      #{player.jersey_number}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border ${
                      isAvailable
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-error-container/30 border-error/30 text-error'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-primary' : 'bg-error'}`}
                    />
                    {isAvailable ? 'Available' : player.injury_type || 'Unavailable'}
                  </span>
                </div>
                {(player.nationality || a != null) && (
                  <p className="text-[11px] md:text-sm text-on-surface-variant mt-1.5">
                    {player.nationality}
                    {player.nationality && a != null ? ' · ' : ''}
                    {a != null ? `${a} years old` : ''}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
            {(
              [
                ['Market Value', fmtMoney(player.market_value_eur)],
                ['Jersey', player.jersey_number != null ? `#${player.jersey_number}` : '—'],
                ['Foot', footLabel(player.preferred_foot)],
                ['Height', player.height_cm != null ? `${player.height_cm} cm` : '—'],
              ] as const
            ).map(([label, val]) => (
              <div
                key={label}
                className="rounded-xl bg-surface-container-low/60 border border-surface-container-highest/40 p-3 md:p-4"
              >
                <div className="text-[10px] md:text-[11px] text-on-surface-variant uppercase tracking-wider font-bold mb-1">
                  {label}
                </div>
                <div className="text-base md:text-2xl font-extrabold text-primary tabular-nums">
                  {val}
                </div>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="rounded-xl bg-surface-container-low/60 border border-surface-container-highest/40 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-2 text-[11px] md:text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                <span className="material-symbols-outlined text-[16px] text-primary">stadium</span>
                Current Club
              </div>
              <div className="text-lg md:text-xl font-extrabold text-on-surface">
                {player.current_team?.name ?? '—'}
              </div>
            </div>
            <div className="rounded-xl bg-surface-container-low/60 border border-surface-container-highest/40 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-2 text-[11px] md:text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                <span className="material-symbols-outlined text-[16px] text-secondary">public</span>
                National Team
              </div>
              <div className="text-lg md:text-xl font-extrabold text-on-surface">
                {player.national_team?.name ?? '—'}
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-surface-container-low/60 border border-surface-container-highest/40 p-4 md:p-5">
            <h2 className="text-[11px] md:text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-3">
              Personal
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-sm">
              {(
                [
                  ['Date of birth', `${fmtDate(player.date_of_birth)}${a != null ? ` (${a})` : ''}`],
                  ['Nationality', player.nationality || '—'],
                  [
                    'Position',
                    `${posLabel(player.position)}${
                      player.specific_position && player.specific_position !== player.position
                        ? ` (${player.specific_position})`
                        : ''
                    }`,
                  ],
                  ['Preferred foot', footLabel(player.preferred_foot)],
                  ['Height', player.height_cm != null ? `${player.height_cm} cm` : '—'],
                  ['Weight', player.weight_kg != null ? `${player.weight_kg} kg` : '—'],
                  ['Contract until', fmtDate(player.contract_until)],
                  ['Market value', fmtMoney(player.market_value_eur)],
                ] as const
              ).map(([label, val]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 py-1.5 border-b border-surface-container-highest/30"
                >
                  <dt className="text-on-surface-variant">{label}</dt>
                  <dd className="text-on-surface font-bold text-right">{val}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </main>
    </div>
  );
}

// ── API-Football basic profile ─────────────────────────────────────

function AfProfile({ player }: { player: AfPlayerBasic }) {
  const initial = (player.name || '?').slice(0, 1).toUpperCase();

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary-container/25 blur-[130px] rounded-full" />
      </div>

      <main className="relative z-10 w-full bg-surface-container-lowest min-h-screen">
        <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 md:px-6 py-3 md:py-6 flex flex-col gap-4">
          <Link
            href="/football"
            className="inline-flex items-center gap-1 text-on-surface-variant hover:text-on-surface text-[11px] md:text-xs uppercase tracking-wider font-bold w-fit"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back
          </Link>

          <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-5">
              {player.photo ? (
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-primary/40 shrink-0"
                />
              ) : (
                <div
                  className="shrink-0 flex items-center justify-center font-black text-primary"
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: '50%',
                    background: 'rgba(75,226,119,0.12)',
                    border: '2px solid rgba(75,226,119,0.35)',
                    fontSize: 36,
                  }}
                >
                  {initial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-3xl font-extrabold text-on-surface tracking-tight break-words">
                  {player.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                  {player.position && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] md:text-xs font-bold uppercase tracking-wider">
                      {posLabel(player.position)}
                    </span>
                  )}
                  {player.nationality && (
                    <span className="text-[11px] md:text-sm text-on-surface-variant">
                      {player.nationality}
                    </span>
                  )}
                  {player.age != null && (
                    <span className="text-[11px] md:text-sm text-on-surface-variant">
                      · {player.age} years old
                    </span>
                  )}
                </div>
                {player.team && (
                  <p className="text-[11px] md:text-sm text-on-surface-variant mt-1.5">
                    Plays for{' '}
                    <span className="text-on-surface font-semibold">{player.team.name}</span>
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
            {(
              [
                ['Height', player.height || '—'],
                ['Weight', player.weight || '—'],
                ['Age', player.age != null ? `${player.age}` : '—'],
              ] as const
            ).map(([label, val]) => (
              <div
                key={label}
                className="rounded-xl bg-surface-container-low/60 border border-surface-container-highest/40 p-3 md:p-4"
              >
                <div className="text-[10px] md:text-[11px] text-on-surface-variant uppercase tracking-wider font-bold mb-1">
                  {label}
                </div>
                <div className="text-base md:text-xl font-extrabold text-on-surface tabular-nums">
                  {val}
                </div>
              </div>
            ))}
          </section>

          {player.team && (
            <section className="rounded-xl bg-surface-container-low/60 border border-surface-container-highest/40 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-2 text-[11px] md:text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                <span className="material-symbols-outlined text-[16px] text-primary">stadium</span>
                Current Club
              </div>
              <Link
                href={`/team/${player.team.id}`}
                className="flex items-center gap-3 text-lg md:text-xl font-extrabold text-on-surface hover:text-primary transition-colors"
              >
                {player.team.logo && (
                  <img src={player.team.logo} alt="" className="w-8 h-8 object-contain" />
                )}
                {player.team.name}
              </Link>
            </section>
          )}

          <p className="text-[10px] text-on-surface-variant/70 text-center pt-1">
            Limited profile · data from API-Football. For the full career profile search this
            player by name using the ⌘K palette.
          </p>
        </div>
      </main>
    </div>
  );
}

// ── main ───────────────────────────────────────────────────────────

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const rawId = params.id;

  // Bzzoiro ID: bz-<numeric>
  if (rawId.startsWith('bz-')) {
    const numericId = rawId.slice(3);
    if (!/^\d+$/.test(numericId)) return <NotFound />;
    let player: BzzoiroPlayer | null = null;
    try {
      player = await getBzzoiroPlayer(numericId);
    } catch (err) {
      console.error('getBzzoiroPlayer failed:', err);
    }
    if (!player) return <NotFound />;
    return <BzzoiroProfile player={player} />;
  }

  // Numeric ID: try API-Football only. Never fall through to Bzzoiro —
  // API-Football and Bzzoiro use different ID namespaces, so passing the
  // same number to Bzzoiro would render a different person entirely.
  // (Bzzoiro players are only reachable via /player/bz-<id>.)
  if (/^\d+$/.test(rawId)) {
    const af = await getApiFootballPlayer(rawId);
    if (af) return <AfProfile player={af} />;
    return <NotFound />;
  }

  return <NotFound />;
}
