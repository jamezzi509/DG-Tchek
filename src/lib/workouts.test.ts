import { describe, expect, it } from "vitest";
import publicCases from "./__fixtures__/gyd-public-cases.json";
import pyramidCases from "./__fixtures__/pyramid-public-cases.json";
import tchekCases from "./__fixtures__/tchek-live-cases.json";
import { calculateGyd, calculatePyramid, compareWorkouts, isValidDate, previousDate, pyramidRows, uniqueFamilies } from "./workouts";
import { runDGTchek } from "./core";
import { buildDatabase } from "./database";

describe("GYD public calculator compatibility", () => {
  it.each(publicCases)("reproduces all eight outputs for $inputs", ({ inputs, numbers }) => {
    expect(calculateGyd(inputs as [string, string, string]).rawNumbers).toEqual(numbers);
  });
  it("keeps input order and leading zeros; rejects incomplete input", () => {
    expect(calculateGyd(["01", "02", "03"]).rows[0]).toEqual([0, 1, 0, 2, 0, 3]);
    expect(calculateGyd(["12", "34", "56"]).rawNumbers).not.toEqual(calculateGyd(["56", "34", "12"]).rawNumbers);
    expect(() => calculateGyd(["1", "02", "03"])).toThrow();
    expect(() => calculateGyd(["-1", "02", "03"])).toThrow();
    expect(calculateGyd(["00", "00", "00"]).numbers).toEqual(["00"]);
  });
});

describe("locked date pyramid variant", () => {
  it("matches all 1,461 dates from the public algorithm (2024–2027)", () => {
    for (const { date, numbers } of pyramidCases) expect(calculatePyramid(date).numbers, date).toEqual(numbers);
  });
  it.each([
    ["2026-08-19", ["38", "35", "16", "82", "10", "68"]],
    ["2026-09-14", ["83", "85", "16", "92", "15", "68"]],
    ["2026-09-22", ["74", "73", "26", "92", "24", "68"]],
  ])("matches the published algorithm on %s", (date, numbers) => {
    expect(calculatePyramid(date as string).numbers).toEqual(numbers);
  });
  it("does not turn 11 into 2, validates calendar dates, handles year boundaries", () => {
    expect(pyramidRows([2, 9, 2])[1]).toEqual([1, 1]);
    expect(isValidDate("2026-02-29")).toBe(false);
    expect(isValidDate("2024-02-29")).toBe(true);
    expect(() => calculatePyramid("2026-13-01")).toThrow();
    expect(previousDate("2026-01-01")).toBe("2025-12-31");
    expect(calculatePyramid("2026-01-02").rows[0].join("")).toBe("212026");
  });
});

describe("workout intersections", () => {
  it("preserves every captured live-app comparison", () => {
    const db = buildDatabase().db;
    for (const { a, b, numbers } of tchekCases) expect(runDGTchek(a, b, db).common, `${a}/${b}`).toEqual(numbers);
  });
  it("matches reversals without +5 mirrors, preserves zeros, and does not mutate lists", () => {
    const tchek = ["47", "16", "29", "88", "00"];
    const before = [...tchek];
    expect(compareWorkouts(tchek, ["74", "92", "05"], ["47", "61", "50"])).toEqual({
      tchekPyramid: ["47", "29"], tchekGyd: ["47", "16"], allThree: ["47"],
    });
    expect(tchek).toEqual(before);
    expect(uniqueFamilies(["09", "90", "00", "00"])).toEqual(["09", "00"]);
  });
  it("reproduces the September 16 comparison and retains the full original list", () => {
    const result = runDGTchek("25", "28", buildDatabase().db);
    expect(result.common.map(n => [...n].sort().join("")).sort()).toEqual(["16", "17", "36", "37"]);
    const common = compareWorkouts(result.common, calculatePyramid("2026-09-16").numbers, []);
    expect(common.tchekPyramid.map(n => [...n].sort().join("")).sort()).toEqual(["16", "17"]);
    expect(result.common).toHaveLength(4);
  });
});
