// components/shared/FormPills.tsx
// Last-N-results pill row (W/D/L). Server-component safe — no client state.

export type FormResult = 'W' | 'D' | 'L';

const STYLE: Record<FormResult, string> = {
  W: 'bg-primary/20 text-primary border-primary/40',
  D: 'bg-surface-container text-on-surface-variant border-surface-container-highest',
  L: 'bg-error-container/40 text-error border-error/40',
};

export default function FormPills({
  form,
  label,
}: {
  form: FormResult[];
  label?: string;
}) {
  if (!form.length) return null;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {label && (
        <span className="text-[10px] md:text-xs uppercase tracking-wider text-on-surface-variant font-bold mr-1">
          {label}
        </span>
      )}
      {form.map((r, i) => (
        <span
          key={i}
          className={`inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded text-[10px] md:text-[11px] font-black border ${STYLE[r]}`}
          aria-label={r === 'W' ? 'Win' : r === 'L' ? 'Loss' : 'Draw'}
        >
          {r}
        </span>
      ))}
    </div>
  );
}
