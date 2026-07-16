import type { SuperPickResult } from "../lib/core";
import ResultBoard from "./ResultBoard";

interface Props {
  result: SuperPickResult;
}

export default function SuperPickResults({ result }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="font-num text-xs uppercase tracking-widest text-mute">Konbine</span>
        <span className="font-num text-sm font-bold text-paper">
          {result.pair1[0]} <span className="text-mute">vs</span> {result.pair1[1]}
          <span className="mx-2 text-gold">∩</span>
          {result.pair2[0]} <span className="text-mute">vs</span> {result.pair2[1]}
        </span>
        <span className="text-[11px] text-line-bright">
          Boul Komen: {result.common1.join(",") || "—"} &nbsp;∩&nbsp; {result.common2.join(",") || "—"}
        </span>
      </div>

      {result.common.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line px-5 py-8 text-center">
          <span className="mb-2 block text-2xl">🔍</span>
          <p className="text-sm text-mute">
            Pa gen boul ki komen ant 2 konparezon yo. Sa nòmal — 2 pè diferan pa toujou gen menm boul.
          </p>
        </div>
      ) : (
        <ResultBoard result={result} />
      )}
    </div>
  );
}
