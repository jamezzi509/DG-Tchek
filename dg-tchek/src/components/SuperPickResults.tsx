import type { DgTchekResult } from "../lib/core";
import ResultBoard from "./ResultBoard";

interface Props {
  result1: DgTchekResult;
  result2: DgTchekResult;
}

function Labeled({ result, index }: { result: DgTchekResult; index: number }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red text-[11px] font-black text-white">
          {index}
        </span>
        <span className="font-num text-sm font-bold uppercase tracking-widest text-paper">
          {result.input1} <span className="text-mute">vs</span> {result.input2}
        </span>
      </div>
      <ResultBoard result={result} />
    </div>
  );
}

export default function SuperPickResults({ result1, result2 }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <Labeled result={result1} index={1} />
      <div className="h-px bg-line" />
      <Labeled result={result2} index={2} />
    </div>
  );
}
