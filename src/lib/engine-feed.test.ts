import { describe,expect,it } from "vitest";
import { expectedSources,parseEngineFeed } from "./engine-feed";

describe("exact source windows",()=>{
  it("handles both cross-session directions and same-session calendars",()=>{
    expect(expectedSources({date:"2026-09-22",session:"midday"},"all")).toEqual([{date:"2026-09-21",session:"midday"},{date:"2026-09-21",session:"evening"}]);
    expect(expectedSources({date:"2026-09-22",session:"evening"},"all")).toEqual([{date:"2026-09-21",session:"evening"},{date:"2026-09-22",session:"midday"}]);
    expect(expectedSources({date:"2026-09-22",session:"evening"},"midday")).toEqual([{date:"2026-09-21",session:"midday"},{date:"2026-09-22",session:"midday"}]);
    expect(expectedSources({date:"2026-01-01",session:"evening"},"evening")).toEqual([{date:"2025-12-30",session:"evening"},{date:"2025-12-31",session:"evening"}]);
  });
  it("preserves leading zeros and rejects wrong state and conflicting duplicate slots",()=>{
    const row={state:"FL",date:"2026-09-21",session:"evening",pick3:"005",pick4:"0012"};
    expect(parseEngineFeed({draws:[row]},"FL")[0].pick4).toBe("0012");
    expect(()=>parseEngineFeed({draws:[row]},"NY")).toThrow();
    expect(()=>parseEngineFeed({draws:[row,row]},"FL")).toThrow();
    expect(()=>parseEngineFeed({draws:[{...row,pick4:12}]},"FL")).toThrow();
  });
});

it("handles morning/night and hourly source windows without dropping a period",()=>{
 expect(expectedSources({date:"2026-09-22",session:"night"},"all",["morning","midday","evening","night"])).toEqual([{date:"2026-09-22",session:"midday"},{date:"2026-09-22",session:"evening"}]);
 expect(expectedSources({date:"2026-09-22",session:"09:30"},"all",["09:30","10:30","19:30"])).toEqual([{date:"2026-09-21",session:"10:30"},{date:"2026-09-21",session:"19:30"}]);
 expect(expectedSources({date:"2026-09-22",session:"evening"},"all",["evening"])).toEqual([{date:"2026-09-20",session:"evening"},{date:"2026-09-21",session:"evening"}]);
});
it("uses quiniela prizes directly and retains hourly draw identity",()=>{
 const row={state:"HAITI",date:"2026-09-21",session:"09:30",pick3:"",pick4:"",prizes:["00","05","97"]};
 expect(parseEngineFeed({draws:[row]},"HAITI")[0].prizes).toEqual(["00","05","97"]);
 expect(()=>parseEngineFeed({draws:[{...row,prizes:["00","5","97"]}]},"HAITI")).toThrow();
});
