import { useState } from "react";
import type { DatabaseInfo } from "../lib/database";
import { addCustomSeed, loadCustomSeeds, parseSeedText, removeCustomSeed } from "../lib/database";

interface Props {
  info: DatabaseInfo;
  onChange: () => void;
}

export default function AdminPanel({ info, onChange }: Props) {
  const [seedText, setSeedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const custom = loadCustomSeeds();

  function handleAddSeed() {
    const parsed = parseSeedText(seedText);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    addCustomSeed(parsed.seed);
    setSeedText("");
    setError(null);
    onChange();
  }

  function handleRemove(key: string) {
    removeCustomSeed(key);
    onChange();
  }

  const keys = Object.keys(info.db).sort();
  const visibleKeys = filter ? keys.filter((k) => k.includes(filter.trim())) : keys;
  const directCount = info.directKeys.size;
  const mirroredCount = info.mirroredKeys.size;
  const emptyCount = 100 - directCount - mirroredCount;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-line bg-panel-raised p-5">
        <h3 className="mb-1 font-num text-xs uppercase tracking-widest text-gold">Coverage</h3>
        <p className="text-sm text-mute">
          <span className="text-paper font-medium">{directCount}</span> keys from {info.seedSources.length} seed
          {info.seedSources.length === 1 ? "" : "s"} (shift-generated), plus{" "}
          <span className="text-paper font-medium">{mirroredCount}</span> more filled by their mirror (07 = 70, same
          boul) — <span className="text-paper font-medium">{100 - emptyCount}</span> of 100 keys covered
          {emptyCount > 0 ? `, ${emptyCount} still empty` : ""}.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-panel-raised p-5">
        <h3 className="mb-3 font-num text-xs uppercase tracking-widest text-gold">Add / override a seed row</h3>
        <p className="mb-3 text-xs text-mute">
          Paste one row like <code className="rounded bg-ink px-1.5 py-0.5 font-num">08=19,20,...</code> to override
          or extend the data — the rest of that chain generates automatically, and any of its keys' mirrors update
          too.
        </p>
        <textarea
          value={seedText}
          onChange={(e) => setSeedText(e.target.value)}
          placeholder="06=17,18,27,97,98,87,15,14,25,95,94,85"
          rows={2}
          className="w-full rounded-lg border border-line bg-ink px-3 py-2 font-num text-sm text-paper placeholder:text-line-bright focus:border-gold focus:outline-none"
        />
        {error && <p className="mt-2 text-sm text-red">{error}</p>}
        <button
          onClick={handleAddSeed}
          className="mt-3 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold/90"
        >
          Save seed
        </button>

        {custom.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
            {custom.map((s) => (
              <div key={s.key} className="flex items-center justify-between font-num text-xs text-mute">
                <span>
                  <span className="text-paper">{s.key}</span> = {s.list.join(",")}
                </span>
                <button onClick={() => handleRemove(s.key)} className="text-red hover:underline">
                  remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-panel-raised p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-num text-xs uppercase tracking-widest text-gold">All rows</h3>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="filter key…"
            className="w-28 rounded-lg border border-line bg-ink px-2 py-1 font-num text-xs text-paper placeholder:text-line-bright focus:border-gold focus:outline-none"
          />
        </div>
        <div className="scrollbar-thin max-h-96 overflow-y-auto">
          <table className="w-full text-left font-num text-xs">
            <tbody>
              {visibleKeys.map((k) => {
                const list = info.db[k];
                const isDirect = info.directKeys.has(k);
                const isMirrored = info.mirroredKeys.has(k);
                const colorClass = isDirect ? "text-gold" : isMirrored ? "text-teal" : "text-line-bright";
                return (
                  <tr key={k} className="border-b border-line/60">
                    <td className={`py-1.5 pr-3 align-top ${colorClass}`}>
                      {k}
                      {isMirrored && <span className="ml-1 text-[9px] text-line-bright">(mirror)</span>}
                    </td>
                    <td className="py-1.5 text-mute break-all">
                      {list.length > 0 ? list.join(",") : <span className="italic text-line-bright">empty</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
