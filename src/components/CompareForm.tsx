import { useEffect, useRef, useState, type FormEvent } from "react";
import BallInput from "./BallInput";
import { isValidPair, normalizePair } from "../lib/core";

interface Props {
  onSubmit: (a: string, b: string) => void;
  onClear: () => void;
}

export default function CompareForm({ onSubmit, onClear }: Props) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputBRef = useRef<HTMLInputElement>(null);
  const lastSubmitted = useRef<string>("");

  function handleSwap() {
    setA(b);
    setB(a);
  }

  function trySubmit(e?: FormEvent) {
    e?.preventDefault();
    const na = normalizePair(a);
    const nb = normalizePair(b);
    if (!isValidPair(na) || !isValidPair(nb)) {
      setError("Antre de nimewo 2 chif, egzanp 45 ak 55.");
      return;
    }
    setError(null);
    lastSubmitted.current = `${na}-${nb}`;
    onSubmit(na, nb);
  }

  // Auto-submit once both fields are simultaneously valid, reading committed
  // state (not a mid-keystroke closure) so fast/mobile typing can't race it.
  useEffect(() => {
    const na = normalizePair(a);
    const nb = normalizePair(b);
    if (isValidPair(na) && isValidPair(nb) && `${na}-${nb}` !== lastSubmitted.current) {
      setError(null);
      lastSubmitted.current = `${na}-${nb}`;
      onSubmit(na, nb);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, b]);

  function handleClear() {
    setA("");
    setB("");
    setError(null);
    lastSubmitted.current = "";
    onClear();
  }

  return (
    <form onSubmit={trySubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2">
        <span className="h-px flex-1 bg-line" />
        <span className="flex items-center gap-2 font-num text-sm font-bold uppercase tracking-[0.2em] text-paper">
          <span className="text-gold">◆</span> Konpare 2 Boul <span className="text-gold">◆</span>
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <BallInput
            id="dgt-input-a"
            value={a}
            onChange={(v) => {
              setA(v);
              if (error) setError(null);
            }}
            onComplete={() => setTimeout(() => inputBRef.current?.focus(), 0)}
            autoFocus
          />
        </div>
        <button
          type="button"
          onClick={handleSwap}
          aria-label="Chanje plas boul yo"
          className="mt-[-20px] flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-dim/60 bg-panel text-gold transition hover:border-red hover:text-red active:scale-90"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 14h13a5 5 0 0 0 5-5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 14l4-4-4-4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 10H8a5 5 0 0 1-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1">
          <BallInput
            ref={inputBRef}
            id="dgt-input-b"
            value={b}
            onChange={(v) => {
              setB(v);
              if (error) setError(null);
            }}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-center text-sm font-medium text-red">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-red to-red-dim px-6 py-4 text-lg font-black uppercase tracking-wide text-white shadow-lg shadow-red/20 transition hover:brightness-110 active:scale-[0.98]"
      >
        Tcheke Kounya
        <span aria-hidden="true">→</span>
      </button>

      {(a || b) && (
        <button type="button" onClick={handleClear} className="self-center text-xs text-mute underline decoration-line-bright hover:text-red">
          Efase
        </button>
      )}
    </form>
  );
}
