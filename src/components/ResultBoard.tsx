import { useEffect, useState } from "react";
import { computePicksFromCommon, expandStraight } from "../lib/core";

interface MinimalResult {
  common: string[];
  pick3: string[];
  pick4: string[];
}

function useCopy(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);
  function copy(text: string) {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      },
      () => {}
    );
  }
  return [copied, copy];
}

function CommonBall({ value, selected, disabled, onClick }: { value: string; selected: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-label={`Favori ${value}`} aria-pressed={selected} disabled={disabled} onClick={onClick} className={`flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-dim bg-gradient-to-b from-panel-raised to-ink font-num text-xl font-bold text-paper shadow-inner ${selected ? "ring-2 ring-red border-red" : "disabled:opacity-40"}`}>
      {value}
    </button>
  );
}

function ComboChip({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-gold-dim/50 bg-panel-raised px-3 py-3 font-num text-lg font-bold text-paper">
      {value}
    </div>
  );
}

export default function ResultBoard({ result }: { result: MinimalResult }) {
  const [tab, setTab] = useState<"box" | "straight">("box");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [copiedCommon, copyCommon] = useCopy();
  const [copiedCombo, copyCombo] = useCopy();

  // Reset to the 3-digit tab whenever a fresh comparison comes in.
  useEffect(() => { setTab("box"); setFavorites([]); setFavoritesOnly(false); }, [result]);

  const boxes = favoritesOnly ? computePicksFromCommon(favorites).pick3 : result.pick3;
  const activeCombos = tab === "box" ? boxes : expandStraight(boxes);
  function toggleFavorite(n: string) {
    if (favorites.length === 1 && favorites.includes(n)) setFavoritesOnly(false);
    setFavorites(current => current.includes(n) ? current.filter(x => x !== n) : current.length < 3 ? [...current, n] : current);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Common balls */}
      <div className="rounded-2xl border border-gold-dim/40 bg-panel p-5">
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="text-xl">🏆</span>
          <span className="font-num text-base font-bold uppercase tracking-widest text-gold">Boul Komen</span>
          <span className="font-num text-sm text-mute">({result.common.length})</span>
        </div>

        {result.common.length > 0 ? (
          <>
            <div className="flex flex-wrap justify-center gap-3">
              {result.common.map((n, i) => (
                <CommonBall key={`${n}-${i}`} value={n} selected={favorites.includes(n)} disabled={favorites.length === 3 && !favorites.includes(n)} onClick={() => toggleFavorite(n)} />
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-mute">Peze sou boul yo pou chwazi 3 favori ({favorites.length}/3).</p>
            <button
              onClick={() => copyCommon(result.common.join(" "))}
              className="mx-auto mt-4 flex items-center gap-2 rounded-full border border-gold-dim/60 px-5 py-2 text-xs font-bold uppercase tracking-wide text-gold transition hover:border-gold hover:bg-gold/10 active:scale-95"
            >
              {copiedCommon ? "Kopye ✓" : "⧉ Kopye"}
            </button>
          </>
        ) : (
          <p className="text-center text-sm italic text-mute">Pa gen boul komen pou 2 nimewo sa yo.</p>
        )}
      </div>

      {/* BOX choices and their distinct exact orders */}
      {(result.pick3.length > 0) && (
        <div className="rounded-2xl border border-gold-dim/40 bg-panel p-5">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-num text-base font-bold uppercase tracking-widest text-gold">3 Chif</span>
          </div>

          <label className="mb-4 flex items-center gap-2 text-sm text-gold">
            <input type="checkbox" checked={favoritesOnly} disabled={favorites.length === 0} onChange={e => setFavoritesOnly(e.target.checked)} />
            3 chif ak favori mwen yo sèlman
          </label>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setTab("box")}
              className={`flex-1 rounded-full py-2.5 text-sm font-bold uppercase tracking-wide transition ${
                tab === "box" ? "bg-red text-white" : "border border-line text-mute hover:border-gold-dim hover:text-paper"
              }`}
            >
              3 Chif BOX
            </button>
            <button
              onClick={() => setTab("straight")}
              className={`flex-1 rounded-full py-2.5 text-sm font-bold uppercase tracking-wide transition ${
                tab === "straight" ? "bg-red text-white" : "border border-line text-mute hover:border-gold-dim hover:text-paper"
              }`}
            >
              3 Chif STRAIGHT
            </button>
          </div>

          <p className="mb-3 font-num text-[11px] uppercase tracking-widest text-mute">
            3 Chif {tab.toUpperCase()} <span className="text-line-bright">({activeCombos.length})</span>
          </p>

          {tab === "straight" && <p className="mb-3 text-xs text-mute">Tout lòd posib pou BOX yo.</p>}
          {activeCombos.length === 0 && <p className="mb-3 text-sm text-mute">Pa gen 3 chif pou chwa sa a. Chwazi boul ki ka fòme omwen 2 pè diferan, oswa yon doub pou trip li.</p>}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {activeCombos.map((n, i) => (
              <ComboChip key={`${n}-${i}`} value={n} />
            ))}
          </div>

          <button
            onClick={() => copyCombo(activeCombos.join(" "))}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-gold-dim/60 py-2.5 text-xs font-bold uppercase tracking-wide text-gold transition hover:border-gold hover:bg-gold/10 active:scale-95"
          >
            {copiedCombo ? "Kopye ✓" : `⧉ Kopye ${tab.toUpperCase()}`}
          </button>
        </div>
      )}
    </div>
  );
}
