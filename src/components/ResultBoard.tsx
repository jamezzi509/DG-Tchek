import { useEffect, useState } from "react";

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

function CommonBall({ value }: { value: string }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-dim bg-gradient-to-b from-panel-raised to-ink font-num text-xl font-bold text-paper shadow-inner">
      {value}
    </div>
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
  const [tab, setTab] = useState<"3" | "4">("3");
  const [copiedCommon, copyCommon] = useCopy();
  const [copiedCombo, copyCombo] = useCopy();

  // Reset to the 3-digit tab whenever a fresh comparison comes in.
  useEffect(() => setTab("3"), [result]);

  const activeCombos = tab === "3" ? result.pick3 : result.pick4;

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
                <CommonBall key={`${n}-${i}`} value={n} />
              ))}
            </div>
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

      {/* Pick 3 / Pick 4 combos */}
      {result.common.length >= 2 && (
        <div className="rounded-2xl border border-gold-dim/40 bg-panel p-5">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-num text-base font-bold uppercase tracking-widest text-gold">3 Chif &amp; 4 Chif</span>
          </div>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setTab("3")}
              className={`flex-1 rounded-full py-2.5 text-sm font-bold uppercase tracking-wide transition ${
                tab === "3" ? "bg-red text-white" : "border border-line text-mute hover:border-gold-dim hover:text-paper"
              }`}
            >
              3 Chif
            </button>
            <button
              onClick={() => setTab("4")}
              className={`flex-1 rounded-full py-2.5 text-sm font-bold uppercase tracking-wide transition ${
                tab === "4" ? "bg-red text-white" : "border border-line text-mute hover:border-gold-dim hover:text-paper"
              }`}
            >
              4 Chif
            </button>
          </div>

          <p className="mb-3 font-num text-[11px] uppercase tracking-widest text-mute">
            Kombinèzon {tab} Chif <span className="text-line-bright">({activeCombos.length})</span>
          </p>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {activeCombos.map((n, i) => (
              <ComboChip key={`${n}-${i}`} value={n} />
            ))}
          </div>

          <button
            onClick={() => copyCombo(activeCombos.join(" "))}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-gold-dim/60 py-2.5 text-xs font-bold uppercase tracking-wide text-gold transition hover:border-gold hover:bg-gold/10 active:scale-95"
          >
            {copiedCombo ? "Kopye ✓" : `⧉ Kopye ${tab} Chif`}
          </button>
        </div>
      )}
    </div>
  );
}
