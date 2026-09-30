import Link from 'next/link';
import { CricketMatch } from '@/types';
import matchesData from '@/data/cricket.json';

const matches = matchesData as unknown as CricketMatch[];

const abbrMap: Record<string, string> = {
  Australia: 'AUS',
  India: 'IND',
  England: 'ENG',
  Pakistan: 'PAK',
  'Mumbai Indians': 'MI',
  'Chennai Super Kings': 'CSK',
  'South Africa': 'RSA',
  'New Zealand': 'NZ',
};

const getAbbr = (name: string) =>
  abbrMap[name] ?? name.slice(0, 3).toUpperCase();

function MatchRow({ match }: { match: CricketMatch }) {
  const isLive = match.status === 'live';
  const isUpcoming = match.status === 'upcoming';
  const isFinished = match.status === 'finished';

  const team1HasScore = match.team1.overs !== '0.0';
  const team2HasScore = match.team2.overs !== '0.0';
  const team1Won = isFinished && match.team1.score > match.team2.score;
  const team2Won = isFinished && match.team2.score > match.team1.score;

  const cardClass = isLive
    ? 'bg-surface-container-low/40 hover:bg-surface-container-low/60 border border-secondary-container/20'
    : isUpcoming
    ? 'bg-surface-container-low/40 hover:bg-surface-container-low/60 border border-surface-container-highest/40'
    : 'bg-surface-container-highest/20 hover:bg-surface-container-highest/30 border border-surface-container-highest/30 opacity-90 hover:opacity-100';

  const accentBar = isLive ? 'bg-secondary-container' : 'bg-surface-container-highest';

  return (
    <Link
      href={`/cricket/${match.id}`}
      className={`group relative flex flex-col rounded-lg p-space-lg transition-colors shadow-sm overflow-hidden backdrop-blur-sm ${cardClass}`}
    >
      <div className={`absolute left-0 inset-y-0 w-[3px] ${accentBar}`}></div>

      <div className="flex items-center justify-between gap-space-sm pb-space-sm">
        <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          <span className={isLive ? 'text-secondary' : ''}>•</span>
          <span>{match.league}</span>
        </div>

        {isLive && (
          <div className="flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-error-container/25">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-error uppercase font-black tracking-wider">
              Live {match.currentInnings === 2 ? match.team2.overs : match.team1.overs} Ov
            </span>
          </div>
        )}

        {isUpcoming && (
          <div className="flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-highest/60">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
              schedule
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
              Upcoming
            </span>
          </div>
        )}

        {isFinished && (
          <div className="flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container-highest/60">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
              check_circle
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
              FT • Final
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-space-sm py-space-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-md min-w-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-label-md text-label-md shrink-0 ${
                team1Won
                  ? 'bg-primary-container text-on-primary-container font-black'
                  : `bg-surface-container-highest ${
                      isLive ? 'text-secondary font-black' : 'text-on-surface font-black'
                    }`
              }`}
            >
              {getAbbr(match.team1.name)}
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span
                className={`font-body-lg text-body-lg truncate ${
                  isFinished && !team1Won
                    ? 'text-on-surface-variant font-medium'
                    : 'text-on-surface font-semibold'
                }`}
              >
                {match.team1.name}
              </span>
              {team1Won && (
                <span
                  className="material-symbols-outlined text-primary text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check
                </span>
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-space-xs tabular-nums">
            {team1HasScore ? (
              <>
                <span
                  className={`font-score-display text-score-display font-extrabold tracking-tight ${
                    isLive && match.currentInnings === 1
                      ? 'text-secondary'
                      : isFinished && !team1Won
                      ? 'text-on-surface-variant'
                      : 'text-on-surface'
                  }`}
                >
                  {`${match.team1.score}/${match.team1.wickets}`}
                </span>
                <span
                  className={`font-body-sm text-body-sm ${
                    isLive && match.currentInnings === 1
                      ? 'text-secondary'
                      : 'text-on-surface-variant'
                  }`}
                >
                  ({match.team1.overs} ov)
                </span>
              </>
            ) : (
              <>
                <span className="font-score-display text-score-display font-light text-on-surface-variant/70">
                  –
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {isUpcoming ? 'Home' : 'Yet to bat'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-md min-w-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-label-md text-label-md shrink-0 ${
                team2Won
                  ? 'bg-primary-container text-on-primary-container font-black'
                  : `bg-surface-container-highest ${
                      isLive ? 'text-secondary font-black' : 'text-on-surface font-black'
                    }`
              }`}
            >
              {getAbbr(match.team2.name)}
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span
                className={`font-body-lg text-body-lg truncate ${
                  isFinished && !team2Won
                    ? 'text-on-surface-variant font-medium'
                    : 'text-on-surface font-semibold'
                }`}
              >
                {match.team2.name}
              </span>
              {team2Won && (
                <span
                  className="material-symbols-outlined text-primary text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check
                </span>
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-space-xs tabular-nums">
            {team2HasScore ? (
              <>
                <span
                  className={`font-score-display text-score-display font-extrabold tracking-tight ${
                    isLive && match.currentInnings === 2
                      ? 'text-secondary'
                      : isFinished && !team2Won
                      ? 'text-on-surface-variant'
                      : 'text-on-surface'
                  }`}
                >
                  {`${match.team2.score}/${match.team2.wickets}`}
                </span>
                <span
                  className={`font-body-sm text-body-sm ${
                    isLive && match.currentInnings === 2
                      ? 'text-secondary'
                      : 'text-on-surface-variant'
                  }`}
                >
                  ({match.team2.overs} ov)
                </span>
              </>
            ) : (
              <>
                <span className="font-score-display text-score-display font-light text-on-surface-variant/70">
                  –
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {isUpcoming ? 'Away' : 'Yet to bat'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {isLive && match.lastOver && (
        <div className="mt-space-sm pt-space-xs pb-space-xs flex items-center justify-between flex-wrap gap-space-xs bg-surface-container-lowest/50 backdrop-blur-sm px-space-md py-1.5 rounded">
          <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm uppercase">
            <span className="text-on-surface font-bold">This Over:</span>
            <div className="flex items-center gap-1 font-label-sm text-label-sm tabular-nums">
              {match.lastOver.map((ball, idx) => {
                let badgeStyle = 'bg-surface-container-highest text-on-surface';
                if (ball === 'W') {
                  badgeStyle = 'bg-error-container text-on-error-container font-bold';
                } else if (ball === '4' || ball === '6') {
                  badgeStyle = 'bg-secondary-container text-on-secondary font-bold';
                }
                return (
                  <span
                    key={idx}
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${badgeStyle}`}
                  >
                    {ball}
                  </span>
                );
              })}
            </div>
          </div>
          {(match.striker || match.bowler) && (
            <div className="flex items-center gap-space-sm font-label-sm text-label-sm">
              {match.striker && (
                <span className="text-on-surface-variant">
                  Striker:{' '}
                  <strong className="text-on-surface">
                    {match.striker.name} {match.striker.runs}*({match.striker.balls})
                  </strong>
                </span>
              )}
              {match.striker && match.bowler && (
                <span className="text-on-surface-variant">•</span>
              )}
              {match.bowler && (
                <span className="text-on-surface-variant">
                  Bowler:{' '}
                  <strong className="text-on-surface">
                    {match.bowler.name} {match.bowler.wickets}/{match.bowler.runs}
                  </strong>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-space-sm pt-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm font-body-sm text-body-sm">
        {isLive && (
          <div className="flex items-center gap-space-xs font-semibold text-tertiary">
            <span className="material-symbols-outlined text-[16px]">
              {match.currentInnings === 2 ? 'priority_high' : 'sports_cricket'}
            </span>
            <span>{match.statusText}</span>
          </div>
        )}
        {isUpcoming && (
          <div className="flex items-center gap-space-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">stadium</span>
            <span>{match.statusText}</span>
          </div>
        )}
        {isFinished && (
          <div className="flex items-center gap-space-xs font-semibold text-primary">
            <span className="material-symbols-outlined text-[16px]">emoji_events</span>
            <span>{match.statusText}</span>
          </div>
        )}

        <div className="flex items-center gap-space-md flex-wrap">
          {isLive && (
            <div className="flex items-center gap-space-xs font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              <span>
                RR: <strong className="text-secondary">{match.runRate.toFixed(2)}</strong>
              </span>
            </div>
          )}
          <span className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary group-hover:text-on-surface transition-colors font-bold uppercase tracking-wider">
            Match Center
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CricketPage() {
  const liveCount = matches.filter((m) => m.status === 'live').length;

  return (
    <>
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-secondary-container/25 blur-[130px] rounded-full"></div>
          <div className="absolute top-48 left-1/4 w-[360px] h-[220px] bg-primary-container/25 blur-[110px] rounded-full"></div>
          <div className="absolute top-48 right-1/4 w-[360px] h-[220px] bg-tertiary-container/20 blur-[110px] rounded-full"></div>
        </div>

        <main className="relative z-10 w-full bg-surface-container-lowest min-h-screen">
          <div className="flex flex-col w-full">
            <div className="max-w-7xl mx-auto w-full px-gutter md:px-gutter-desktop py-space-lg flex flex-col gap-space-lg">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-sm">
                <div className="flex flex-col gap-space-xs">
                  <div className="inline-flex items-center gap-space-xs self-start px-space-sm py-0.5 rounded-full bg-secondary-container/20 text-secondary">
                    <span className="material-symbols-outlined text-[14px]">sports_cricket</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">
                      Cricket Live Telemetry
                    </span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl uppercase tracking-tight text-on-surface font-black">
                    Cricket
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    T20, ODI &amp; Test Matches • Real-Time Over Telemetry
                  </p>
                </div>

                <div className="flex items-center gap-space-sm flex-wrap">
                  <div className="flex items-center gap-space-xs bg-surface-container-high/60 backdrop-blur-sm px-space-md py-1.5 rounded-full">
                    <span className="material-symbols-outlined text-secondary text-[16px]">
                      calendar_today
                    </span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wide uppercase">
                      {`${matches.length} Matches Today`}
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs bg-error-container/25 px-space-md py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                    <span className="font-label-md text-label-md text-error font-bold uppercase tracking-wider">
                      {`${liveCount} Live Now`}
                    </span>
                  </div>
                </div>
              </header>

              <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
                <nav
                  aria-label="Match Filters"
                  className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0"
                >
                  <button
                    className="flex items-center gap-1.5 px-space-lg py-1.5 bg-surface-container-high rounded-full text-on-surface font-label-md text-label-md uppercase tracking-wider shadow-sm"
                    type="button"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    All Matches
                  </button>
                  <button
                    className="px-space-md py-1.5 bg-surface-container-low hover:bg-surface-container rounded-full text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md uppercase tracking-wider"
                    type="button"
                  >
                    {`Live (${liveCount})`}
                  </button>
                  <button
                    className="px-space-md py-1.5 bg-surface-container-low hover:bg-surface-container rounded-full text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md uppercase tracking-wider"
                    type="button"
                  >
                    Today
                  </button>
                  <button
                    className="px-space-md py-1.5 bg-surface-container-low hover:bg-surface-container rounded-full text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md uppercase tracking-wider"
                    type="button"
                  >
                    Finished
                  </button>
                </nav>

                <div className="flex items-center gap-space-sm flex-wrap sm:flex-nowrap">
                  <div className="relative flex-1 sm:w-64">
                    <select
                      aria-label="Select Series"
                      className="w-full appearance-none bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-lg px-space-md py-2 pr-8 focus:outline-none"
                    >
                      <option>All Tournaments &amp; Series</option>
                      <option>ICC World Cup Tournaments</option>
                      <option>Indian Premier League (IPL)</option>
                      <option>Bilateral T20I / ODI Series</option>
                    </select>
                    <span className="material-symbols-outlined text-on-surface-variant absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[18px]">
                      expand_more
                    </span>
                  </div>
                  <div className="relative flex-1 sm:w-64">
                    <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">
                      search
                    </span>
                    <input
                      aria-label="Search fixtures"
                      className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none"
                      placeholder="Search teams, series, venues..."
                      type="text"
                    />
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-space-md">
                {matches.map((match) => (
                  <MatchRow key={match.id} match={match} />
                ))}
              </section>

              <aside className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md p-space-lg bg-surface-container-low/60 backdrop-blur-sm border border-surface-container-highest/40 rounded-lg shadow-sm">
                <div className="flex items-start sm:items-center gap-space-md">
                  <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-[22px]">
                      notifications_active
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-extrabold">
                      Ball-by-Ball Telemetry &amp; Wicket Alerts
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Instant push telemetry enabled for boundary trackers, DRS reviews &amp; milestone sixes.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm self-end sm:self-center shrink-0">
                  <button
                    className="px-space-md py-1.5 bg-surface-container hover:bg-surface-container-high rounded-full font-label-md text-label-md text-on-surface uppercase tracking-wider flex items-center gap-1 transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      volume_up
                    </span>
                    Sound: On
                  </button>
                  <button
                    className="px-space-lg py-1.5 bg-secondary text-on-secondary hover:bg-secondary-fixed rounded-full font-label-md text-label-md uppercase tracking-wider font-bold transition-colors shadow-sm"
                    type="button"
                  >
                    Customize Feed
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>

      <footer className="w-full bg-surface-container-low border-t border-surface-container-highest/60 py-space-xl mt-space-xl">
        <div className="max-w-7xl mx-auto px-gutter-desktop flex flex-col md:flex-row items-center justify-between gap-space-lg text-on-surface-variant font-body-sm text-body-sm">
          <div className="flex items-center gap-space-sm">
            <div className="w-6 h-6 rounded bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[14px]">
                sports_score
              </span>
            </div>
            <span className="font-label-md text-label-md text-on-surface uppercase">
              LIVESCOREHUB © 2025
            </span>
            <span className="text-outline">|</span>
            <span>Real-Time Multi-Sport Telemetry</span>
          </div>
          <div className="flex items-center gap-space-lg font-label-md text-label-md">
            <Link
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              href="#"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              href="#"
            >
              API Feeds
            </Link>
            <Link
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              href="#"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
