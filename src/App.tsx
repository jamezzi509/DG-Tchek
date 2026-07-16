import { useEffect, useState } from "react";
import CompareForm from "./components/CompareForm";
import ResultBoard from "./components/ResultBoard";
import SuperPickForm from "./components/SuperPickForm";
import SuperPickResults from "./components/SuperPickResults";
import RecentSearches from "./components/RecentSearches";
import AdminPanel from "./components/AdminPanel";
import { runDGTchek, runSuperPick, type DgTchekResult, type SuperPickResult } from "./lib/core";
import { buildDatabase } from "./lib/database";
import { addRecent, clearRecents, loadRecents, type RecentSearch } from "./lib/recents";
import dgAvatar from "./assets/dg-avatar.png";

type View = "checker" | "admin";

export default function App() {
  const [dbInfo, setDbInfo] = useState(() => buildDatabase());
  const [result, setResult] = useState<DgTchekResult | null>(null);
  const [superResult, setSuperResult] = useState<SuperPickResult | null>(null);
  const [recents, setRecents] = useState<RecentSearch[]>(() => loadRecents());
  const [view, setView] = useState<View>("checker");

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.key === "Enter" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        document.getElementById("dgt-input-a")?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function handleAnalyze(a: string, b: string) {
    const res = runDGTchek(a, b, dbInfo.db);
    setResult(res);
    setRecents(addRecent(a, b, res.common.length));
  }

  function handleSuperAnalyze(pair1: [string, string], pair2: [string, string]) {
    const res = runSuperPick(pair1, pair2, dbInfo.db);
    setSuperResult(res);
    let r = addRecent(pair1[0], pair1[1], res.common1.length);
    r = addRecent(pair2[0], pair2[1], res.common2.length);
    setRecents(r);
  }

  function handleClear() {
    setResult(null);
  }

  function handleSuperClear() {
    setSuperResult(null);
  }

  function handleClearRecents() {
    clearRecents();
    setRecents([]);
  }

  function handleDbChange() {
    const fresh = buildDatabase();
    setDbInfo(fresh);
    if (result) setResult(runDGTchek(result.input1, result.input2, fresh.db));
    if (superResult) {
      setSuperResult(runSuperPick(superResult.pair1, superResult.pair2, fresh.db));
    }
  }

  return (
    <div className="min-h-dvh bg-ink">
      {/* Brand header */}
      <div className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-md items-center gap-4 px-4 pb-5 pt-6 sm:max-w-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-white to-gold-dim text-[11px] font-black text-ink">
                7
              </span>
              <span className="font-num text-[11px] font-bold uppercase tracking-[0.2em] text-mute">
                Lotto <span className="text-red">An</span>Direk
              </span>
            </div>
            <h1 className="mt-1 font-num text-3xl font-black tracking-tight text-paper">
              TCH<span className="text-red text-glow-red">È</span>K
            </h1>
            <p className="mt-0.5 text-xs text-gold">
              {view === "checker" ? "Rezilta an dirèk · Boul cho" : "Seed data & row inspector"}
            </p>
          </div>
          <img
            src={dgAvatar}
            alt="DG"
            className="h-16 w-16 shrink-0 drop-shadow-[0_0_12px_rgba(229,28,43,0.25)] sm:h-20 sm:w-20"
          />
        </div>
      </div>

      <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pb-10 pt-6 sm:max-w-lg">
        <div className="flex justify-end">
          <button
            onClick={() => setView(view === "checker" ? "admin" : "checker")}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-mute transition hover:border-red hover:text-red"
          >
            {view === "checker" ? "Admin" : "← Retounen"}
          </button>
        </div>

        {view === "checker" ? (
          <div className="flex flex-col gap-6">
            <CompareForm onSubmit={handleAnalyze} onClear={handleClear} />
            <RecentSearches recents={recents} onSelect={handleAnalyze} onClear={handleClearRecents} />
            {result ? (
              <ResultBoard result={result} />
            ) : (
              <div className="rounded-2xl border border-dashed border-line px-5 py-10 text-center">
                <span className="mb-2 block text-2xl">🏆</span>
                <p className="text-sm text-mute">Antre 2 boul pou konpare.</p>
              </div>
            )}

            {/* Super Pick lives right here on the same page — no navigation */}
            <div className="mt-2 border-t border-dashed border-line pt-6">
              <SuperPickForm onSubmit={handleSuperAnalyze} onClear={handleSuperClear} />
              {superResult && (
                <div className="mt-6">
                  <SuperPickResults result={superResult} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <AdminPanel info={dbInfo} onChange={handleDbChange} />
        )}

        <footer className="mt-4 text-center text-[11px] text-line-bright">
          Fonksyone san entènèt · Ka enstale · Done yo rete sou aparèy la sèlman
        </footer>
      </div>
    </div>
  );
}
