import { forwardRef } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (value: string) => void;
  id?: string;
  autoFocus?: boolean;
  label?: string;
}

const BallInput = forwardRef<HTMLInputElement, Props>(function BallInput(
  { value, onChange, onComplete, id, autoFocus, label = "Boul 00–99" },
  ref
) {
  return (
    <div className="flex flex-col items-center gap-2">
      <input
        ref={ref}
        id={id}
        value={value}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 2);
          onChange(digits);
          if (digits.length === 2) onComplete?.(digits);
        }}
        inputMode="numeric"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        autoFocus={autoFocus}
        placeholder="00"
        className="w-full rounded-2xl border border-gold-dim/60 bg-panel-raised py-6 text-center font-num text-5xl font-bold tracking-wider text-paper placeholder:text-line-bright focus:border-red focus:outline-none focus:ring-2 focus:ring-red/30 transition"
      />
      <span className="font-num text-[10px] uppercase tracking-[0.2em] text-mute">{label}</span>
    </div>
  );
});

export default BallInput;
