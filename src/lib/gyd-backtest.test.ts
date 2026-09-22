import {describe,it,expect} from "vitest";
import {backtestGyd} from "./gyd-backtest";
import type {EngineDraw} from "./engine-feed";
const draw=(date:string,prizes:[string,string,string],session="evening"):EngineDraw=>({state:"RDPRI",date,session,pick3:"",pick4:"",prizes});
describe("standalone GYD scoring",()=>{
 it("scores reversals once per session and counts distinct families separately from positions",()=>{
  const result=backtestGyd([draw("2026-09-01",["25","11","13"]),draw("2026-09-02",["78","87","77"])],"2026-09-02","2026-09-03","evening");
  expect(result).toMatchObject({hits:1,opportunities:1,pending:1,rate:100,twoOrMore:1,three:0});
  expect(result.rows[0].positions).toEqual([1,2,3]);
  expect(result.rows[0].hits).toEqual(["78","77"]);
 });
 it("never substitutes another day or session for missing source",()=>{
  const result=backtestGyd([draw("2026-09-01",["25","11","13"]),draw("2026-09-02",["25","11","13"],"midday"),draw("2026-09-03",["78","87","77"])],"2026-09-03","2026-09-03","evening");
  expect(result).toMatchObject({opportunities:0,pending:1,rate:null});
  expect(result.rows[0].numbers).toEqual([]);
 });
 it("counts a completed miss and validates period and lottery isolation",()=>{
  const draws=[draw("2026-09-01",["25","11","13"]),draw("2026-09-02",["00","01","02"])];
  expect(backtestGyd(draws,"2026-09-02","2026-09-02","evening")).toMatchObject({misses:1,opportunities:1,rate:0});
  expect(()=>backtestGyd(draws,"2026-09-03","2026-09-02","evening")).toThrow();
  expect(()=>backtestGyd([draws[0],{...draws[1],state:"FL"}],"2026-09-02","2026-09-02","evening")).toThrow();
 });
});
