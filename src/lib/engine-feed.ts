import { sourcePairs, type SourceDraw } from "./automatic-checks";
import { isValidDate, previousDate } from "./workouts";

export type EngineDraw = SourceDraw & { state: "FL" | "NY"; sourceUrl?: string; collectedAt?: string };
export type SourceStream = "all" | "midday" | "evening";

export function parseEngineFeed(raw: unknown, state: "FL" | "NY"): EngineDraw[] {
  if (!raw || typeof raw !== "object" || !("draws" in raw) || !Array.isArray(raw.draws)) throw new Error("Repons LottoEngine la pa valab.");
  const seen = new Set<string>();
  return raw.draws.map((value: unknown) => {
    if (!value || typeof value !== "object") throw new Error("Yon rezilta pa valab.");
    const row = value as EngineDraw;
    if (row.state !== state || typeof row.date !== "string" || !isValidDate(row.date)
      || typeof row.pick3 !== "string" || typeof row.pick4 !== "string") throw new Error("Yon rezilta pa valab.");
    sourcePairs(row);
    const key = `${row.date}:${row.session}`;
    if (seen.has(key)) throw new Error("De rezilta genyen menm dat ak tiraj. Verifye LottoEngine.");
    seen.add(key);
    return { ...row };
  }).sort((a,b) => a.date.localeCompare(b.date) || Number(a.session === "evening") - Number(b.session === "evening"));
}

/** Exact scheduled slots: never silently substitute an older draw for a gap. */
export function expectedSources(target: Pick<SourceDraw, "date" | "session">, stream: SourceStream) {
  if (!isValidDate(target.date)) throw new Error("Dat la pa valab.");
  const slots: Pick<SourceDraw, "date" | "session">[] = [];
  let day = target.date;
  for (let i=0; i<4 && slots.length<2; i++, day=previousDate(day)) {
    for (const session of ["evening", "midday"] as const) {
      if (day === target.date && (target.session === "midday" || session === "evening")) continue;
      if (stream !== "all" && stream !== session) continue;
      slots.push({date:day,session});
      if (slots.length===2) break;
    }
  }
  return slots.reverse();
}
