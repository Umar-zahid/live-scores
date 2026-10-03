'use client';

import { useState } from 'react';
import type { FootballMatch, TeamLineup } from '@/types';
import type { FixtureStats, FixturePlayer, MatchPrediction } from '@/lib/football-api';
import Lineups from './Lineups';
import PlayerRatings from './PlayerRatings';
import PredictionsTab from './PredictionsTab';
import StatisticsTab from './StatisticsTab';
import { computeIncidentRatings, type BasicRating } from '@/lib/player-ratings';
import type { MatchVisualData } from '@/lib/football-api';

const eventTypeLabel: Record<string, string> = {
  goal: 'Goal',
  yellow_card: 'Yellow Card',
  red_card: 'Red Card',
  substitution: 'Substitution',
};

function EventIcon({ type }: { type: string }) {
  if (type === 'goal')
    return (
      <span className="material-symbols-outlined text-primary shrink-0" style={{ fontSize: 18 }}>
        sports_soccer
      </span>
    );
  if (type === 'yellow_card')
    return (
      <span
        className="shrink-0"
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
        className="shrink-0"
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
      <span className="material-symbols-outlined text-secondary shrink-0" style={{ fontSize: 18 }}>
        swap_horiz
      </span>
    );
  return null;
}

function EventBody({
  event,
  isHome,
  teamName,
}: {
  event: FootballMatch['events'][number];
  isHome: boolean;
  teamName: string;
}) {
  const isSub = event.type === 'substitution';
  const align = isHome ? 'text-right items-end' : 'text-left items-start';
  const iconPos = isHome ? 'right' : 'left';

  const icon = <EventIcon type={event.type} />;

  return (
    <div className={`flex flex-col ${align} min-w-0 w-full`}>
      <div
        className={`flex items-center gap-1.5 md:gap-2 min-w-0 ${
          isHome ? 'justify-end' : 'justify-start'
        }`}
      >
        {iconPos === 'left' && icon}
        <span className="text-[12px] md:text-sm font-bold text-on-surface truncate">
          {isSub ? (
            <>
              <span>{event.player}</span>
              {event.assist && (
                <>
                  <span className="material-symbols-outlined text-secondary text-[12px] md:text-[14px] align-middle mx-0.5">
                    arrow_forward
                  </span>
                  <span className="text-secondary">{event.assist}</span>
                </>
              )}
            </>
          ) : (
            event.player
          )}
        </span>
        {iconPos === 'right' && icon}
      </div>
      <div className="text-[10px] md:text-xs text-on-surface-variant truncate">
        {isSub ? (
          <>Sub · {teamName}</>
        ) : (
          <>
            {eventTypeLabel[event.type] ?? event.type}
            {event.assist && !isSub ? ` · assist ${event.assist}` : ''}
          </>
        )}
      </div>
    </div>
  );
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
    <div className="relative flex flex-col gap-0.5">
      {/* Centre vertical divider */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-surface-container-highest/50 -translate-x-1/2 pointer-events-none" />

      {sorted.map((event, idx) => {
        const isHome = event.team === 'home';
        const isGoal = event.type === 'goal';
        const teamName = isHome ? match.homeTeam.name : match.awayTeam.name;

        return (
          <div
            key={idx}
            className="grid grid-cols-[1fr_44px_1fr] md:grid-cols-[1fr_52px_1fr] items-center gap-1 md:gap-2 py-1.5"
          >
            {/* Left cell — home events render here, right-aligned */}
            <div className="min-w-0">
              {isHome && (
                <EventBody event={event} isHome={true} teamName={teamName} />
              )}
            </div>

            {/* Centre minute badge */}
            <div className="flex justify-center">
              <div
                className="flex items-center justify-center font-black tabular-nums z-10 shrink-0"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: isGoal
                    ? isHome
                      ? 'rgba(75,226,119,0.2)'
                      : 'rgba(173,198,255,0.2)'
                    : '#191f31',
                  color: isGoal
                    ? isHome
                      ? '#4be277'
                      : '#adc6ff'
                    : '#bccbb9',
                  fontSize: 11,
                  border: '2px solid #0f1522',
                }}
              >
                {event.minute}&apos;
              </div>
            </div>

            {/* Right cell — away events render here, left-aligned */}
            <div className="min-w-0">
              {!isHome && (
                <EventBody event={event} isHome={false} teamName={teamName} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type TabId = 'overview' | 'lineups' | 'stats' | 'ratings' | 'predictions';

export default function MatchTabs({
  match,
  lineups,
  stats,
  players,
  prediction,
  visuals,
}: {
  match: FootballMatch;
  lineups: TeamLineup[];
  stats: FixtureStats[];
  players: FixturePlayer[];
  prediction: MatchPrediction | null;
  visuals: MatchVisualData | null;
}) {
  const [tab, setTab] = useState<TabId>('overview');

  // Incident-derived ratings — used when API-Football per-player stats are missing.
  // Works for every match that has lineups + events (all Bzzoiro matches).
  const incidentRatings: BasicRating[] = computeIncidentRatings({
    lineups,
    events: match.events ?? [],
    homeScore: match.homeTeam.score,
    awayScore: match.awayTeam.score,
  });

  const ratingMap = new Map<number, number>(
    incidentRatings.map((r) => [r.playerId, r.rating])
  );

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'history' },
    { id: 'lineups', label: 'Lineups', icon: 'groups' },
    { id: 'stats', label: 'Statistics', icon: 'bar_chart' },
    { id: 'ratings', label: 'Ratings', icon: 'grade' },
    { id: 'predictions', label: 'Predictions', icon: 'query_stats' },
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
            <Lineups lineups={lineups} ratings={ratingMap} />
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
          <StatisticsTab
            stats={stats}
            visuals={visuals}
            homeName={match.homeTeam.name}
            awayName={match.awayTeam.name}
          />
        )}
        {tab === 'ratings' && (
          <PlayerRatings
            players={players}
            incidentRatings={incidentRatings}
            homeName={match.homeTeam.name}
            awayName={match.awayTeam.name}
            homeLogo={match.homeTeam.logo}
            awayLogo={match.awayTeam.logo}
          />
        )}
        {tab === 'predictions' && (
          <PredictionsTab
            prediction={prediction}
            homeName={match.homeTeam.name}
            awayName={match.awayTeam.name}
          />
        )}
      </div>
    </section>
  );
}
