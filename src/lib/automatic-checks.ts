import { isValidPair, runDGTchek, type Database } from "./core";
import { isValidDate, pairFamily } from "./workouts";

export function circularGap(pair: string): number {
  if (!isValidPair(pair)) throw new Error("Boul la dwe gen 2 chif.");
  const d = Math.abs(Number(pair[0]) - Number(pair[1]));
  return Math.min(d, 10 - d);
}

export function gydFloridaSignals(prizes: [string, string, string], session: string) {
  if (!prizes.every(isValidPair)) throw new Error("Antre 3 lo valab.");
  if (session !== "evening") return [];
  const signals: { id: string; reason: string }[] = [];
  if (circularGap(prizes[0]) === 2) signals.push({ id: "gyd-first-gap2", reason: `1ye lo ${prizes[0]} ekate 2` });
  if (circularGap(prizes[2]) === 5) signals.push({ id: "gyd-third-fake", reason: `3èm lo ${prizes[2]} se yon fo doub` });
  if (prizes.some(p => pairFamily(p) === "34")) signals.push({ id: "gyd-source-34", reason: "34 prezan nan 3 lo sous yo (anvè konte)" });
  return signals;
}

export type SourceDraw = { date: string; session: string; pick3: string; pick4: string; prizes?: [string,string,string] };
export type AutoComparison = {
  inputs: [string, string]; followers: string[];
  evidence: { pairs: [string, string]; rule: string; converted: boolean }[];
};

/** Pick 3 any two positions, Pick 4 only front/back. Sources retain zeroes. */
export function sessionRank(session: string): number {
  const named: Record<string,number> = {morning: 360, midday: 720, evening: 1080, night: 1380};
  if (session in named) return named[session];
  if (/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(session)) return Number(session.slice(0,2))*60+Number(session.slice(3));
  throw new Error("Tiraj la pa valab.");
}

export function sourcePairs(draw: SourceDraw): string[] {
  sessionRank(draw.session);
  if (draw.prizes) {
    if (!isValidDate(draw.date) || draw.prizes.length !== 3 || !draw.prizes.every(isValidPair)) throw new Error("Lo yo pa valab.");
    return [...new Set(draw.prizes.map(pairFamily))];
  }
  if (!isValidDate(draw.date) || !/^\d{3}$/.test(draw.pick3) || !/^\d{4}$/.test(draw.pick4)) throw new Error("Rezilta sous la pa konplè oswa li pa valab.");
  return [...new Set([
    draw.pick3[0] + draw.pick3[1], draw.pick3[0] + draw.pick3[2], draw.pick3.slice(1),
    draw.pick4.slice(0, 2), draw.pick4.slice(2),
  ].map(pairFamily))];
}

/**
 * Scans an explicitly chosen two-draw window using AJ's existing workout rules.
 * Both compared pairs may come from one draw. Caller must choose the source
 * stream; this helper does not guess missing draws or fetch lottery results.
 */
export function scanOldWorkout(sources: [SourceDraw, SourceDraw], target: Pick<SourceDraw, "date" | "session">, db: Database): AutoComparison[] {
  if (!isValidDate(target.date)) throw new Error("Tiraj sib la pa valab.");
  const key = (d: Pick<SourceDraw, "date" | "session">) => `${d.date}-${String(sessionRank(d.session)).padStart(4,"0")}`;
  if (key(sources[0]) === key(sources[1]) || sources.some(s => key(s) >= key(target))) {
    throw new Error("Chwazi 2 tiraj diferan ki anvan tiraj sib la.");
  }
  const pool = [...new Set(sources.flatMap(sourcePairs))].sort();
  const found = new Map<string, AutoComparison>();
  for (const x of pool) for (const y of pool) {
    const gx = circularGap(x), gy = circularGap(y);
    const shared = [...new Set([...x].filter(d => y.includes(d)))];
    if (!shared.length || gx < 1 || gx > 4) continue;
    const partner = gy === 0 || gy === 5;
    const neighboring = gx <= 3 && gy === gx + 1;
    if (!partner && !neighboring) continue;
    for (const digit of shared) {
      const converted = gy === 5 && gx <= 2;
      const second = converted ? digit + digit : y;
      const inputs = [x, second].sort() as [string, string];
      const id = inputs.join("-");
      const rule = `Ekate ${gx} + ${gy === 0 ? "doub" : gy === 5 ? "fo doub" : `ekate ${gy}`}`;
      if (!found.has(id)) found.set(id, { inputs, followers: runDGTchek(inputs[0], inputs[1], db).common, evidence: [] });
      const item = found.get(id)!;
      if (!item.evidence.some(e => e.pairs[0] === x && e.pairs[1] === y && e.rule === rule)) {
        item.evidence.push({ pairs: [x, y], rule, converted });
      }
    }
  }
  return [...found.values()];
}
