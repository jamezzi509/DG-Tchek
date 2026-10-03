import { describe, expect, it } from "vitest";
import { rankFollowers, gydFloridaSignals, scanOldWorkout, sourcePairs, type SourceDraw } from "./automatic-checks";
import { buildDatabase } from "./database";

describe("Florida GYD research signals", () => {
  it("detects all three independent conditions, including reversals and wrapping", () => {
    expect(gydFloridaSignals(["80", "43", "50"], "evening").map(s => s.id)).toEqual([
      "gyd-first-gap2", "gyd-third-fake", "gyd-source-34",
    ]);
    expect(gydFloridaSignals(["80", "43", "50"], "midday")).toEqual([]);
    expect(gydFloridaSignals(["34", "02", "11"], "evening").map(s => s.id)).toEqual(["gyd-source-34"]);
  });
});

describe("AJ existing two-draw workout", () => {
  const d: SourceDraw = { date: "2026-09-14", session: "evening", pick3: "200", pick4: "8988" };
  const earlier: SourceDraw = { date: "2026-09-14", session: "midday", pick3: "753", pick4: "2217" };
  const target = { date: "2026-09-15", session: "midday" as const };
  it("finds 88+89 in the same draw and keeps the known 07 follower", () => {
    const match = scanOldWorkout([earlier, d], target, buildDatabase().db).find(x => x.inputs.join() === "88,89")!;
    expect(match).toBeDefined();
    expect(match.followers.some(p => p === "07" || p === "70")).toBe(true);
  });
  it("extracts nonadjacent Pick 3 digits but no crossing Pick 4 pairs", () => {
    expect(sourcePairs({ ...d, pick3: "252", pick4: "2342" })).toEqual(["25", "22", "23", "24"]);
  });
  it("converts fake doubles for gaps 1/2 only and rejects future source draws", () => {
    const a = { ...d, pick3: "905", pick4: "2505" };
    const out = scanOldWorkout([earlier, a], target, buildDatabase().db);
    expect(out.find(x => x.inputs.join() === "00,09")?.evidence.some(e => e.converted && e.pairs.join() === "09,05")).toBe(true);
    expect(out.find(x => x.inputs.join() === "05,25")?.evidence.some(e => !e.converted)).toBe(true);
    expect(() => scanOldWorkout([earlier, { ...d, date: "2026-09-15" }], target, buildDatabase().db)).toThrow();
  });
});

it('excludes older-only pairs, keeps latest-only and cross-draw pairs regardless of source order',()=>{
 const a:SourceDraw={date:'2026-09-14',session:'midday',pick3:'',pick4:'',prizes:['36','66','77']};
 const b:SourceDraw={date:'2026-09-14',session:'evening',pick3:'',pick4:'',prizes:['47','44','00']};
 const target={date:'2026-09-15',session:'midday'};
 const out=scanOldWorkout([a,b],target,buildDatabase().db);
 expect(out.some(c=>c.inputs.join('-')==='36-66')).toBe(false);
 expect(out.some(c=>c.inputs.join('-')==='44-47')).toBe(true);
 expect(out.some(c=>c.inputs.join('-')==='47-77')).toBe(true);
 expect(scanOldWorkout([b,a],target,buildDatabase().db)).toEqual(out);
});
it('does not let fake conversion make an older-only comparison look current',()=>{
 const a:SourceDraw={date:'2026-09-14',session:'midday',pick3:'',pick4:'',prizes:['02','05','88']};
 const b:SourceDraw={date:'2026-09-14',session:'evening',pick3:'',pick4:'',prizes:['00','44','77']};
 const c=scanOldWorkout([a,b],{date:'2026-09-15',session:'midday'},buildDatabase().db).find(c=>c.inputs.join('-')==='00-02');
 expect(c).toBeDefined();
 expect(c!.evidence.every(e=>!e.converted)).toBe(true);
});
it('counts reversals and duplicate comparison evidence once and preserves tied scores',()=>{
 const cs=[
  {inputs:['36','66'] as [string,string],followers:['38','83','00'],evidence:[]},
  {inputs:['66','63'] as [string,string],followers:['83','00'],evidence:[]},
  {inputs:['47','77'] as [string,string],followers:['38','00','11'],evidence:[]},
 ];
 expect(rankFollowers(cs)).toEqual([{number:'00',count:2},{number:'38',count:2},{number:'11',count:1}]);
});
