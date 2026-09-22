import { sessionRank, sourcePairs, type SourceDraw } from "./automatic-checks";
import { isValidDate, previousDate } from "./workouts";

export type EngineDraw = SourceDraw & { state: string; sourceUrl?: string; collectedAt?: string };
export type SourceStream = string;
export type EngineLottery = {code:string;name:string;sessions:string[]};
export function drawPrizes(d:EngineDraw):[string,string,string] {return d.prizes ?? [d.pick3.slice(-2),d.pick4.slice(0,2),d.pick4.slice(-2)];}
export function drawLabel(d:EngineDraw) {return d.prizes?d.prizes.join(" / "):`${d.pick3} / ${d.pick4}`;}

export function parseEngineFeed(raw: unknown, state: string): EngineDraw[] {
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
  }).sort((a,b) => a.date.localeCompare(b.date) || sessionRank(a.session) - sessionRank(b.session));
}

/** Exact scheduled slots: never silently substitute an older draw for a gap. */
export function expectedSources(target: Pick<SourceDraw, "date" | "session">, stream: SourceStream, sessions: string[] = ["midday","evening"]) {
  if (!isValidDate(target.date)) throw new Error("Dat la pa valab.");
  const slots: Pick<SourceDraw, "date" | "session">[] = [];
  let day = target.date;
  for (let i=0; i<4 && slots.length<2; i++, day=previousDate(day)) {
    for (const session of [...sessions].sort((a,b)=>sessionRank(b)-sessionRank(a))) {
      if (day === target.date && sessionRank(session) >= sessionRank(target.session)) continue;
      if (stream !== "all" && stream !== session) continue;
      slots.push({date:day,session});
      if (slots.length===2) break;
    }
  }
  return slots.reverse();
}
