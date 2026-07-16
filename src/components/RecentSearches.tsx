import type { RecentSearch } from "../lib/recents";

interface Props {
  recents: RecentSearch[];
  onSelect: (a: string, b: string) => void;
  onClear: () => void;
}

export default function RecentSearches({ recents, onSelect, onClear }: Props) {
  if (recents.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-mute font-num">Dènye Tchèk</span>
        <button onClick={onClear} className="text-xs text-mute underline decoration-line-bright hover:text-red">
          Efase
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {recents.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r.input1, r.input2)}
            className="rounded-lg border border-line bg-panel px-3 py-1.5 font-num text-sm text-paper transition hover:border-gold hover:text-gold"
          >
            {r.input1} {r.input2}
            <span className="ml-1.5 text-mute">· {r.commonCount}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
