import { useEffect, useState } from "react";
import { computePicksFromCommon } from "../lib/core";

interface MinimalResult {
  common: string[];
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
  const [favorites, setFavorites] = useState<string[]>([]);
  const favoritesOnly = favorites.length > 0;
  const [copiedCommon, copyCommon] = useCopy();
  const [copiedCombo, copyCombo] = useCopy();

  useEffect(() => { setFavorites([]); }, [result]);

  const selectedNumbers = favoritesOnly ? favorites : result.common;
  const activeCombos = computePicksFromCommon(selectedNumbers).pick3Straight;

  function toggleFavorite(n: string) {
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
            <p className="mt-3 text-center text-xs text-mute">Peze sou boul yo pou chwazi jiska 3 favori ({favorites.length}/3).</p>
            <button
              onClick={() => copyCommon(selectedNumbers.join(" "))}
              className="mx-auto mt-4 flex items-center gap-2 rounded-full border border-gold-dim/60 px-5 py-2 text-xs font-bold uppercase tracking-wide text-gold transition hover:border-gold hover:bg-gold/10 active:scale-95"
            >
              {copiedCommon ? "Kopye ✓" : favoritesOnly ? "⧉ Kopye favori yo" : "⧉ Kopye boul yo"}
            </button>
          </>
        ) : (
          <p className="text-center text-sm italic text-mute">Pa gen boul komen pou 2 nimewo sa yo.</p>
        )}
      </div>

      {/* 3-digit straight combinations from the common pairs */}
      {result.common.length > 0 && (
        <div className="rounded-2xl border border-gold-dim/40 bg-panel p-5">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-num text-base font-bold uppercase tracking-widest text-gold">3 Chif Straight</span>
          </div>

          {favoritesOnly && (
            <div className="mb-4 flex items-center justify-between gap-2 text-xs text-gold">
              <span>3 chif ak favori yo: {favorites.join(" · ")}</span>
              <button type="button" className="underline" onClick={() => setFavorites([])}>Wè tout</button>
            </div>
          )}

          <p className="mb-3 font-num text-[11px] uppercase tracking-widest text-mute">
            3 Chif Straight <span className="text-line-bright">({activeCombos.length})</span>
          </p>

          {activeCombos.length === 0 && <p className="mb-3 text-sm text-mute">Pa gen 3 chif pou chwa sa a.</p>}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {activeCombos.map((n, i) => (
              <ComboChip key={`${n}-${i}`} value={n} />
            ))}
          </div>

          <button
            onClick={() => copyCombo(activeCombos.join(" "))}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-gold-dim/60 py-2.5 text-xs font-bold uppercase tracking-wide text-gold transition hover:border-gold hover:bg-gold/10 active:scale-95"
          >
            {copiedCombo ? "Kopye ✓" : "⧉ Kopye Straight"}
          </button>
        </div>
      )}
    </div>
  );
}
