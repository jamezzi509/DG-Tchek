import { describe, expect, it } from "vitest";
import { gydFloridaSignals, scanOldWorkout, sourcePairs, type SourceDraw } from "./automatic-checks";
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
    const a = { ...earlier, pick3: "905", pick4: "2505" };
    const out = scanOldWorkout([a, d], target, buildDatabase().db);
    expect(out.find(x => x.inputs.join() === "00,09")?.evidence.some(e => e.converted && e.pairs.join() === "09,05")).toBe(true);
    expect(out.find(x => x.inputs.join() === "05,25")?.evidence.some(e => !e.converted)).toBe(true);
    expect(() => scanOldWorkout([earlier, { ...d, date: "2026-09-15" }], target, buildDatabase().db)).toThrow();
  });
});
