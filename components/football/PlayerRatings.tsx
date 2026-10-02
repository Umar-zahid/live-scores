'use client';

import { useState } from 'react';
import type { FixturePlayer } from '@/lib/football-api';
import { explainRating, displayRating } from '@/lib/ratings';

function colorForRating(rating: number): { bg: string; fg: string } {
  if (rating >= 8.0) return { bg: 'rgba(75,226,119,0.18)', fg: '#4be277' };
  if (rating >= 7.0) return { bg: 'rgba(173,198,255,0.18)', fg: '#adc6ff' };
  if (rating >= 6.0) return { bg: 'rgba(250,204,21,0.18)', fg: '#facc15' };
  if (rating >= 5.0) return { bg: 'rgba(255,159,67,0.18)', fg: '#ff9f43' };
  return { bg: 'rgba(255,180,171,0.18)', fg: '#ffb4ab' };
}

function RatingBadge({ rating }: { rating: number }) {
  const { bg, fg } = colorForRating(rating);
  return (
    <span
      className="shrink-0 inline-flex items-center justify-center font-black tabular-nums"
      style={{
        width: 38,
        height: 34,
        borderRadius: 8,
        background: bg,
        color: fg,
        fontSize: 13,
      }}
    >
      {displayRating(rating)}
    </span>
  );
}

function positionLabel(group: FixturePlayer['positionGroup']): string {
  return group === 'UNKNOWN' ? '—' : group;
}

function PlayerRow({ player }: { player: FixturePlayer }) {
  const [open, setOpen] = useState(false);
  const breakdown = explainRating(
    player.stats,
    player.positionGroup === 'UNKNOWN' ? 'MID' : player.positionGroup
  );

  return (
    <div className="rounded-lg border border-surface-container-highest/30 bg-surface-container-low/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 sm:gap-3 p-2.5 hover:bg-surface-container/50 transition-colors text-left"
      >
        {player.playerPhoto ? (
          <img
            src={player.playerPhoto}
            alt=""
            className="w-8 h-8 rounded-full object-cover bg-surface-container shrink-0"
          />
        ) : (
          <span className="w-8 h-8 rounded-full bg-surface-container shrink-0" />
        )}
        {player.number != null && (
          <span className="hidden sm:inline text-[10px] font-bold text-on-surface-variant tabular-nums w-6 text-right shrink-0">
            {player.number}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-on-surface truncate">
            {player.playerName}
            {player.substitute && (
              <span className="ml-2 text-[9px] font-medium text-on-surface-variant uppercase">
                sub
              </span>
            )}
          </div>
          <div className="text-[10px] text-on-surface-variant">
            {positionLabel(player.positionGroup)}
            {' · '}
            {player.minutes}′
          </div>
        </div>
        <RatingBadge rating={player.rating} />
        <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && (
        <div className="border-t border-surface-container-highest/30 px-3 py-2.5 text-[11px]">
          <div className="text-on-surface-variant mb-1.5">
            Base {breakdown.base.toFixed(1)} · Δ {breakdown.delta >= 0 ? '+' : ''}
            {breakdown.delta.toFixed(2)} · minutes×{breakdown.minutesFactor.toFixed(2)}
          </div>
          {breakdown.lines.length === 0 ? (
            <div className="text-on-surface-variant/70">
              No notable contributions.
            </div>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {breakdown.lines.map((line, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-on-surface-variant">{line.label}</span>
                  <span
                    className="tabular-nums font-bold"
                    style={{ color: line.delta >= 0 ? '#4be277' : '#ffb4ab' }}
                  >
                    {line.delta >= 0 ? '+' : ''}
                    {line.delta.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function TeamSection({
  name,
  logo,
  players,
}: {
  name: string;
  logo: string;
  players: FixturePlayer[];
}) {
  const sorted = [...players].sort((a, b) => b.rating - a.rating);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 pb-2 border-b border-surface-container-highest/30">
        {logo && <img src={logo} alt="" className="w-6 h-6 object-contain" />}
        <span className="text-xs font-bold uppercase tracking-wider text-on-surface truncate">
          {name}
        </span>
        <span className="text-[10px] text-on-surface-variant ml-auto shrink-0">
          {players.length} players
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {sorted.map((p) => (
          <PlayerRow key={`${p.team}-${p.playerId}`} player={p} />
        ))}
      </div>
    </div>
  );
}

export default function PlayerRatings({
  players,
}: {
  players: FixturePlayer[];
}) {
  if (!players.length) {
    return (
      <div className="rounded-xl bg-surface-container-low/40 border border-surface-container-highest/30 p-8 text-center">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2">
          grade
        </span>
        <p className="text-sm text-on-surface-variant">
          Player ratings aren&apos;t available for this match.
        </p>
        <p className="text-[10px] text-on-surface-variant/70 mt-1">
          Only top leagues have per-player stats.
        </p>
      </div>
    );
  }

  const homePlayers = players.filter((p) => p.team === 'home');
  const awayPlayers = players.filter((p) => p.team === 'away');
  const homeName = homePlayers[0]?.teamName ?? 'Home';
  const awayName = awayPlayers[0]?.teamName ?? 'Away';
  const homeLogo = homePlayers[0]?.teamLogo ?? '';
  const awayLogo = awayPlayers[0]?.teamLogo ?? '';

  return (
    <div className="flex flex-col gap-6">
      <TeamSection name={homeName} logo={homeLogo} players={homePlayers} />
      <TeamSection name={awayName} logo={awayLogo} players={awayPlayers} />
    </div>
  );
}
