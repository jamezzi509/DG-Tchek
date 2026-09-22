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
