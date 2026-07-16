import { useEffect, useRef, useState, type FormEvent } from "react";
import BallInput from "./BallInput";
import { isValidPair, normalizePair } from "../lib/core";

interface Props {
  onSubmit: (pair1: [string, string], pair2: [string, string]) => void;
  onClear: () => void;
}

function SwapButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
  );
}

export default function SuperPickForm({ onSubmit, onClear }: Props) {
  const [a1, setA1] = useState("");
  const [b1, setB1] = useState("");
  const [a2, setA2] = useState("");
  const [b2, setB2] = useState("");
  const [error, setError] = useState<string | null>(null);

  const b1Ref = useRef<HTMLInputElement>(null);
  const a2Ref = useRef<HTMLInputElement>(null);
  const b2Ref = useRef<HTMLInputElement>(null);
  const lastSubmitted = useRef<string>("");

  function clearError() {
    if (error) setError(null);
  }

  function trySubmit(e?: FormEvent) {
    e?.preventDefault();
    const n = [a1, b1, a2, b2].map(normalizePair);
    const key = n.join("-");
    if (!n.every(isValidPair)) {
      setError("Antre 4 nimewo 2 chif, egzanp 66, 36, 47, 77.");
      return;
    }
    setError(null);
    lastSubmitted.current = key;
    onSubmit([n[0], n[1]], [n[2], n[3]]);
  }

  // Auto-submit once all 4 fields are simultaneously *fully typed* (2 raw
  // digits each — checking isValidPair(normalizePair(x)) here was the bug:
  // normalizePair pads a single digit like "3" into "03", which then reads
  // as "valid," letting this fire mid-keystroke with a half-typed value).
  useEffect(() => {
    const allComplete = [a1, b1, a2, b2].every((v) => v.length === 2);
    if (!allComplete) return;
    const n = [a1, b1, a2, b2].map(normalizePair);
    const key = n.join("-");
    if (n.every(isValidPair) && key !== lastSubmitted.current) {
      setError(null);
      lastSubmitted.current = key;
      onSubmit([n[0], n[1]], [n[2], n[3]]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a1, b1, a2, b2]);

  function handleClear() {
    setA1("");
    setB1("");
    setA2("");
    setB2("");
    setError(null);
    lastSubmitted.current = "";
    onClear();
  }

  return (
    <form onSubmit={trySubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-center gap-2">
        <span className="h-px flex-1 bg-line" />
        <span className="flex items-center gap-2 font-num text-sm font-bold uppercase tracking-[0.2em] text-paper">
          <span className="text-red">⚡</span> Super Pick <span className="text-red">⚡</span>
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <p className="-mt-3 text-center text-xs text-mute">Konpare 2 pè boul an menm tan.</p>

      {/* Pair 1 */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <BallInput
            id="sp-input-a1"
            value={a1}
            onChange={(v) => {
              setA1(v);
              clearError();
            }}
            onComplete={() => setTimeout(() => b1Ref.current?.focus(), 0)}
          />
        </div>
        <SwapButton
          onClick={() => {
            setA1(b1);
            setB1(a1);
          }}
        />
        <div className="flex-1">
          <BallInput
            ref={b1Ref}
            id="sp-input-b1"
            value={b1}
            onChange={(v) => {
              setB1(v);
              clearError();
            }}
            onComplete={() => setTimeout(() => a2Ref.current?.focus(), 0)}
          />
        </div>
      </div>

      {/* Pair 2 */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <BallInput
            ref={a2Ref}
            id="sp-input-a2"
            value={a2}
            onChange={(v) => {
              setA2(v);
              clearError();
            }}
            onComplete={() => setTimeout(() => b2Ref.current?.focus(), 0)}
          />
        </div>
        <SwapButton
          onClick={() => {
            setA2(b2);
            setB2(a2);
          }}
        />
        <div className="flex-1">
          <BallInput
            ref={b2Ref}
            id="sp-input-b2"
            value={b2}
            onChange={(v) => {
              setB2(v);
              clearError();
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

      {(a1 || b1 || a2 || b2) && (
        <button
          type="button"
          onClick={handleClear}
          className="self-center text-xs text-mute underline decoration-line-bright hover:text-red"
        >
          Efase
        </button>
      )}
    </form>
  );
}
