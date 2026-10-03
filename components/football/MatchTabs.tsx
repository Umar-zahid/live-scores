'use client';

import { useState } from 'react';
import type { FootballMatch, TeamLineup } from '@/types';
import type { FixtureStats, FixturePlayer } from '@/lib/football-api';
import Lineups from './Lineups';
import PlayerRatings from './PlayerRatings';

const eventTypeLabel: Record<string, string> = {
  goal: 'Goal',
  yellow_card: 'Yellow Card',
  red_card: 'Red Card',
  substitution: 'Substitution',
};

function EventIcon({ type }: { type: string }) {
  if (type === 'goal')
    return (
      <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>
        sports_soccer
      </span>
    );
  if (type === 'yellow_card')
    return (
      <span
        style={{
          display: 'inline-block',
          width: 12,
          height: 16,
          borderRadius: 2,
          background: '#facc15',
          boxShadow: '0 0 6px rgba(250,204,21,0.6)',
        }}
      />
    );
  if (type === 'red_card')
    return (
      <span
        style={{
          display: 'inline-block',
          width: 12,
          height: 16,
          borderRadius: 2,
          background: '#ffb4ab',
          boxShadow: '0 0 6px rgba(255,180,171,0.6)',
        }}
      />
    );
  if (type === 'substitution')
    return (
      <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>
        swap_horiz
      </span>
    );
  return null;
}

function OverviewTab({ match }: { match: FootballMatch }) {
  const sorted = [...match.events].sort((a, b) => a.minute - b.minute);
  if (!sorted.length) {
    return (
      <div className="rounded-xl bg-surface-container-low/40 border border-surface-container-highest/30 p-8 text-center">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2">
          event_busy
        </span>
        <p className="text-sm text-on-surface-variant">No events yet.</p>
      </div>
    );
  }
  return (
    <div className="relative flex flex-col gap-1">
      <div className="absolute left-[20px] md:left-[26px] top-3 bottom-3 w-0.5 bg-surface-container" />
      {sorted.map((event, idx) => {
        const isGoal = event.type === 'goal';
        const teamName =
          event.team === 'home' ? match.homeTeam.name : match.awayTeam.name;
        const logo =
          event.team === 'home' ? match.homeTeam.logo : match.awayTeam.logo;
        const isSub = event.type === 'substitution';

        return (
          <div
            key={idx}
            className="relative flex items-center gap-2 md:gap-3 p-2 rounded-lg hover:bg-surface-container/50"
          >
            <div
              className="shrink-0 flex items-center justify-center z-10 font-black tabular-nums"
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: isGoal
                  ? event.team === 'home'
                    ? 'rgba(75,226,119,0.2)'
                    : 'rgba(173,198,255,0.2)'
                  : '#191f31',
                color: isGoal
                  ? event.team === 'home'
                    ? '#4be277'
                    : '#adc6ff'
                  : '#bccbb9',
                fontSize: 11,
              }}
            >
              {event.minute}&apos;
            </div>
            <EventIcon type={event.type} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] md:text-sm font-bold text-on-surface truncate">
                {isSub ? (
                  <>
                    <span>{event.player}</span>
                    {event.assist && (
                      <>
                        <span className="material-symbols-outlined text-secondary text-[14px] align-middle mx-1">
                          arrow_forward
                        </span>
                        <span className="text-secondary">{event.assist}</span>
                      </>
                    )}
                  </>
                ) : (
                  event.player
                )}
              </div>
              <div className="text-[10px] md:text-xs text-on-surface-variant truncate">
                {isSub ? (
                  <>Sub · {teamName}</>
                ) : (
                  <>
                    {eventTypeLabel[event.type] ?? event.type} · {teamName}
                    {event.assist ? ` · assist ${event.assist}` : ''}
                  </>
                )}
              </div>
            </div>
            {logo && (
              <img
                src={logo}
                alt=""
                className="w-5 h-5 md:w-6 md:h-6 object-contain opacity-80 shrink-0"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatsTab({
  stats,
  homeName,
  awayName,
}: {
  stats: FixtureStats[];
  homeName: string;
  awayName: string;
}) {
  if (stats.length < 2) {
    return (
      <div className="rounded-xl bg-surface-container-low/40 border border-surface-container-highest/30 p-8 text-center">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2">
          bar_chart
        </span>
        <p className="text-sm text-on-surface-variant">
          Match statistics aren&apos;t available for this fixture.
        </p>
      </div>
    );
  }

  const home = stats[0];
  const away = stats[1];

  const homeMap = new Map(home.stats.map((s) => [s.type, s.value]));
  const awayMap = new Map(away.stats.map((s) => [s.type, s.value]));

  const allTypes = Array.from(
    new Set([...home.stats.map((s) => s.type), ...away.stats.map((s) => s.type)])
  );

  const numeric = (v: any): number => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const m = v.match(/^(\d+(?:\.\d+)?)%?$/);
      if (m) return parseFloat(m[1]);
    }
    return 0;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest/30">
        <span className="text-xs font-bold uppercase tracking-wider text-primary truncate max-w-[40%]">
          {homeName}
        </span>
        <span className="text-[10px] text-on-surface-variant uppercase">vs</span>
        <span className="text-xs font-bold uppercase tracking-wider text-secondary text-right truncate max-w-[40%]">
          {awayName}
        </span>
      </div>

      {allTypes.map((type) => {
        const hv = homeMap.get(type) ?? null;
        const av = awayMap.get(type) ?? null;
        const hn = numeric(hv);
        const an = numeric(av);
        const total = hn + an;
        const hpct = total > 0 ? (hn / total) * 100 : 50;

        return (
          <div key={type} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-on-surface tabular-nums">
                {hv ?? '—'}
              </span>
              <span className="text-[10px] md:text-xs text-on-surface-variant uppercase tracking-wider">
                {type}
              </span>
              <span className="font-bold text-on-surface tabular-nums">
                {av ?? '—'}
              </span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-surface-container">
              <div className="bg-primary" style={{ width: `${hpct}%` }} />
              <div className="bg-secondary flex-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

type TabId = 'overview' | 'lineups' | 'stats' | 'ratings';

export default function MatchTabs({
  match,
  lineups,
  stats,
  players,
}: {
  match: FootballMatch;
  lineups: TeamLineup[];
  stats: FixtureStats[];
  players: FixturePlayer[];
}) {
  const [tab, setTab] = useState<TabId>('overview');

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'history' },
    { id: 'lineups', label: 'Lineups', icon: 'groups' },
    { id: 'stats', label: 'Statistics', icon: 'bar_chart' },
    { id: 'ratings', label: 'Ratings', icon: 'grade' },
  ];

  return (
    <section className="rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 shadow-lg overflow-hidden">
      <div className="flex border-b border-surface-container-highest/40 bg-surface-container/40">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors relative ${
              tab === t.id
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] md:text-[18px]">
              {t.icon}
            </span>
            <span className="hidden sm:inline">{t.label}</span>
            {tab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="p-3 sm:p-4 md:p-5">
        {tab === 'overview' && <OverviewTab match={match} />}
        {tab === 'lineups' &&
          (lineups.length > 0 ? (
            <Lineups lineups={lineups} />
          ) : (
            <div className="rounded-xl bg-surface-container-low/40 border border-surface-container-highest/30 p-8 text-center">
              <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2">
                groups
              </span>
              <p className="text-sm text-on-surface-variant">
                Lineups aren&apos;t available for this match.
              </p>
              <p className="text-[10px] text-on-surface-variant/70 mt-1">
                Only top leagues have lineup data.
              </p>
            </div>
          ))}
        {tab === 'stats' && (
          <StatsTab
            stats={stats}
            homeName={match.homeTeam.name}
            awayName={match.awayTeam.name}
          />
        )}
        {tab === 'ratings' && <PlayerRatings players={players} />}
      </div>
    </section>
  );
}
