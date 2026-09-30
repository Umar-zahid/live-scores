
import Link from 'next/link';

export default function HomePage() {
return (
<>
<main className="w-full bg-surface-container-lowest min-h-screen">
<div className="flex flex-col w-full">
<div className="relative w-full overflow-hidden">
<div className="absolute inset-0 pointer-events-none opacity-20">
<div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary/20 blur-[130px] rounded-full"></div>
<div className="absolute top-48 left-1/4 w-[360px] h-[220px] bg-secondary-container/20 blur-[110px] rounded-full"></div>
<div className="absolute top-48 right-1/4 w-[360px] h-[220px] bg-tertiary-container/15 blur-[110px] rounded-full"></div>
</div>
<section className="relative z-10 max-w-4xl mx-auto text-center px-4 pt-16 pb-12 md:pt-20 md:pb-16 flex flex-col items-center">
<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/90 shadow-sm mb-6">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Live Match Centers Active</span>
</div>
<h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface tracking-tight mb-4 max-w-3xl">
Live Scores. All Sports. <span className="text-primary">One Place.</span>
</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
Real-time scores for Football, Cricket, and Formula 1
</p>
<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
<div className="flex items-center gap-2 bg-surface-container px-3.5 py-1.5 rounded-full text-on-surface-variant font-label-md text-label-md">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
<span>1,240+ In-Play Events</span>
</div>
<div className="flex items-center gap-2 bg-surface-container px-3.5 py-1.5 rounded-full text-on-surface-variant font-label-md text-label-md">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
<span>Sub-second Latency</span>
</div>
<div className="flex items-center gap-2 bg-surface-container px-3.5 py-1.5 rounded-full text-on-surface-variant font-label-md text-label-md">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
<span>Official Telemetry Feeds</span>
</div>
</div>
</section>
<section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
{/* Football Card */}
<Link className="group flex flex-col justify-between rounded-lg bg-surface-container-low hover:bg-surface-container transition-all duration-200 overflow-hidden shadow-md hover:shadow-xl relative text-left" href="/football">
<div className="h-1 w-full bg-primary"></div>
<div className="p-6 flex flex-col h-full">
<div className="flex items-start justify-between">
<div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-200">
<span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
</div>
<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-primary">
<span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
<span className="font-label-sm text-label-sm uppercase tracking-wide">Live now: 2 matches</span>
</div>
</div>
<div className="mt-5">
<h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight group-hover:text-primary transition-colors">
Football
</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
Premier League, La Liga, Champions League
</p>
</div>
{/* Mini Preview Score Ticker */}
<div className="mt-6 space-y-2.5">
<div className="bg-surface-container-lowest rounded p-3 flex items-center justify-between">
<div className="min-w-0 pr-2">
<div className="flex items-center gap-1.5 text-on-surface font-body-sm text-body-sm font-semibold truncate">
<span>Real Madrid</span>
<span className="text-on-surface-variant font-normal">vs</span>
<span>Man City</span>
</div>
<div className="font-label-sm text-label-sm text-primary flex items-center gap-1 mt-0.5">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
<span>67' In Play</span>
</div>
</div>
<div className="bg-surface-container-high px-2.5 py-1 rounded font-score-display text-score-display text-on-surface flex items-center gap-1">
<span>2</span>
<span className="text-on-surface-variant text-body-sm font-normal">-</span>
<span>1</span>
</div>
</div>
<div className="bg-surface-container-lowest rounded p-3 flex items-center justify-between">
<div className="min-w-0 pr-2">
<div className="flex items-center gap-1.5 text-on-surface font-body-sm text-body-sm font-semibold truncate">
<span>Arsenal</span>
<span className="text-on-surface-variant font-normal">vs</span>
<span>Bayern</span>
</div>
<div className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
Halftime Break
</div>
</div>
<div className="bg-surface-container-high px-2.5 py-1 rounded font-score-display text-score-display text-on-surface flex items-center gap-1">
<span>1</span>
<span className="text-on-surface-variant text-body-sm font-normal">-</span>
<span>1</span>
</div>
</div>
</div>
{/* Bottom Action Link */}
<div className="mt-6 pt-4 flex items-center justify-between text-primary font-label-md text-label-md uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
<span className="inline-flex items-center gap-1 font-semibold">
View Live Scores
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</span>
<span className="text-on-surface-variant font-body-sm text-body-sm lowercase text-[11px]">8 Fixtures Today</span>
</div>
</div>
</Link>
{/* Cricket Card */}
<Link className="group flex flex-col justify-between rounded-lg bg-surface-container-low hover:bg-surface-container transition-all duration-200 overflow-hidden shadow-md hover:shadow-xl relative text-left" href="/cricket">
<div className="h-1 w-full bg-secondary-container"></div>
<div className="p-6 flex flex-col h-full">
<div className="flex items-start justify-between">
<div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary group-hover:scale-105 transition-transform duration-200">
<span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_cricket</span>
</div>
<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-secondary">
<span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
<span className="font-label-sm text-label-sm uppercase tracking-wide">Live now: 1 match</span>
</div>
</div>
<div className="mt-5">
<h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight group-hover:text-secondary transition-colors">
Cricket
</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
T20, ODI, Test matches
</p>
</div>
{/* Mini Preview Score Ticker */}
<div className="mt-6 space-y-2.5">
<div className="bg-surface-container-lowest rounded p-3 flex flex-col gap-2">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase text-secondary font-bold tracking-wider">ICC World Cup Qualifier</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">CRR 6.31</span>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="font-headline-md text-headline-md font-bold text-on-surface">IND</span>
<span className="text-on-surface-variant font-body-sm text-body-sm">vs</span>
<span className="font-headline-md text-headline-md font-bold text-on-surface-variant">AUS</span>
</div>
<div className="text-right">
<div className="font-score-display text-score-display text-on-surface">242/4</div>
<div className="font-label-sm text-label-sm text-secondary font-semibold">38.2 ov</div>
</div>
</div>
<div className="bg-surface-container-high rounded px-2.5 py-1.5 text-on-surface-variant font-body-sm text-body-sm text-xs flex justify-between items-center">
<span className="truncate">Sharma 88* (74) • Rahul 32* (29)</span>
<span className="text-secondary font-semibold ml-2 shrink-0">P2</span>
</div>
</div>
<div className="bg-surface-container-lowest rounded p-3 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
<span className="text-on-surface font-medium">ENG vs SA (T20I)</span>
<span className="font-label-sm text-label-sm uppercase text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">Starts 18:30 GMT</span>
</div>
</div>
{/* Bottom Action Link */}
<div className="mt-6 pt-4 flex items-center justify-between text-secondary font-label-md text-label-md uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
<span className="inline-flex items-center gap-1 font-semibold">
View Live Scores
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</span>
<span className="text-on-surface-variant font-body-sm text-body-sm lowercase text-[11px]">Ball-by-Ball Feed</span>
</div>
</div>
</Link>
{/* Formula 1 Card */}
<Link className="group flex flex-col justify-between rounded-lg bg-surface-container-low hover:bg-surface-container transition-all duration-200 overflow-hidden shadow-md hover:shadow-xl relative text-left" href="/f1">
<div className="h-1 w-full bg-error-container"></div>
<div className="p-6 flex flex-col h-full">
<div className="flex items-start justify-between">
<div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-error group-hover:scale-105 transition-transform duration-200">
<span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_motorsports</span>
</div>
<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-error">
<span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
<span className="font-label-sm text-label-sm uppercase tracking-wide">Live now: Race in progress</span>
</div>
</div>
<div className="mt-5">
<h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight group-hover:text-error transition-colors">
Formula 1
</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
Race standings, lap times, pit stops
</p>
</div>
{/* Mini Preview Race Standings */}
<div className="mt-6 space-y-2.5">
<div className="bg-surface-container-lowest rounded p-3 flex flex-col gap-2">
<div className="flex items-center justify-between text-on-surface">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-error"></span>
<span className="font-label-md text-label-md uppercase tracking-wider font-bold">Monaco Grand Prix</span>
</div>
<span className="font-label-sm text-label-sm text-error bg-surface-container px-2 py-0.5 rounded font-bold">Lap 42/78</span>
</div>
<div className="space-y-1.5 mt-1">
<div className="flex items-center justify-between text-body-sm font-body-sm bg-surface-container-high/60 px-2 py-1 rounded">
<div className="flex items-center gap-2">
<span className="font-headline-md text-body-sm font-bold text-on-surface">P1</span>
<span className="text-on-surface font-semibold">VER</span>
<span className="text-on-surface-variant text-[11px]">Red Bull</span>
</div>
<span className="font-label-sm text-label-sm text-primary font-bold">LEADER</span>
</div>
<div className="flex items-center justify-between text-body-sm font-body-sm bg-surface-container-high/30 px-2 py-1 rounded">
<div className="flex items-center gap-2">
<span className="font-headline-md text-body-sm font-bold text-on-surface-variant">P2</span>
<span className="text-on-surface font-semibold">NOR</span>
<span className="text-on-surface-variant text-[11px]">McLaren</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant font-mono">+2.418s</span>
</div>
<div className="flex items-center justify-between text-body-sm font-body-sm bg-surface-container-high/30 px-2 py-1 rounded">
<div className="flex items-center gap-2">
<span className="font-headline-md text-body-sm font-bold text-on-surface-variant">P3</span>
<span className="text-on-surface font-semibold">LEC</span>
<span className="text-on-surface-variant text-[11px]">Ferrari</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant font-mono">+5.892s</span>
</div>
</div>
</div>
</div>
{/* Bottom Action Link */}
<div className="mt-6 pt-4 flex items-center justify-between text-error font-label-md text-label-md uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
<span className="inline-flex items-center gap-1 font-semibold">
View Live Scores
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</span>
<span className="text-on-surface-variant font-body-sm text-body-sm lowercase text-[11px]">Sector Delta Active</span>
</div>
</div>
</Link>
</div>
</section>
{/* Global Telemetry Strip */}
<section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
<div className="bg-surface-container-low rounded-lg p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[24px]">sensors</span>
</div>
<div>
<div className="font-headline-md text-headline-md text-on-surface font-bold">Synchronized Match Center</div>
<div className="font-body-sm text-body-sm text-on-surface-variant">Auto-updating telemetry feeds, live heatmaps, and audio commentary feeds</div>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm uppercase bg-surface-container px-3 py-1.5 rounded">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
Feed Status: Online
</span>
<button className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg font-bold hover:bg-primary-fixed-dim transition-colors uppercase tracking-wider">
Quick Hub
</button>
</div>
</div>
</section>
</div>
</div>
</main>
<footer className="w-full bg-surface-container-low border-t border-surface-container-highest/60 py-space-xl mt-space-xl">
<div className="max-w-7xl mx-auto px-gutter-desktop flex flex-col md:flex-row items-center justify-between gap-space-lg text-on-surface-variant font-body-sm text-body-sm">
<div className="flex items-center gap-space-sm">
<div className="w-6 h-6 rounded bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-[14px]">sports_score</span>
</div>
<span className="font-label-md text-label-md text-on-surface uppercase">LiveScoreHub © 2025</span>
<span className="text-outline">|</span>
<span>Real-Time Multi-Sport Telemetry</span>
</div>
<div className="flex items-center gap-space-lg font-label-md text-label-md">
<Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">Privacy Policy</Link>
<Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">API Feeds</Link>
<Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">Terms of Service</Link>
</div>
</div>
</footer>
</>
);
}


