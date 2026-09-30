export default function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-red-600/90 px-2 py-0.5 rounded">
      <span className="bg-red-500 rounded-full w-2 h-2 animate-pulse" />
      <span className="text-white font-bold uppercase text-xs tracking-wide">
        LIVE
      </span>
    </span>
  );
}
