import { beforeEach, describe, expect, it } from 'vitest';
import { buildDatabase } from './database';
import { computePicksFromCommon, runDGTchek } from './core';
import { REVISED_ROWS } from '../data/revised-rows';
const canonical = (s:string) => s.split('').sort().join('');
beforeEach(()=>localStorage.clear());
describe('Approved followers and BOX construction',()=>{
 it('matches the backtested default rows for every source, including reversals',()=>{
  const {db}=buildDatabase();
  for(const [key,row] of Object.entries(REVISED_ROWS)) expect([...new Set(db[key].map(canonical))].sort()).toEqual([...row].sort());
 });
 it('36–66 produces the revised six and nine BOX including triples',()=>{
  const r=runDGTchek('36','66',buildDatabase().db);
  expect(r.common.map(canonical).sort()).toEqual(['22','27','45','47','57','77']);
  expect(r.pick3).toEqual(['222','227','247','257','277','457','477','577','777']);
 });
 it('02–00 gives the approved thirteen BOX, preserving 111 and 666',()=>{
  expect(runDGTchek('02','00',buildDatabase().db).pick3).toEqual(['111','112','116','118','119','126','128','129','166','168','169','189','666']);
 });
 it('requires two distinct pairs; repeated occurrences of one pair do not suffice',()=>{
  expect(computePicksFromCommon(['12','21']).pick3).toEqual([]);
  expect(computePicksFromCommon(['00']).pick3).toEqual(['000']);
  expect(computePicksFromCommon(['01','02']).pick3).toEqual(['012']);
 });
 it('retains deliberate custom overrides',()=>{
  localStorage.setItem('dgtchek:custom-seeds',JSON.stringify([{key:'00',list:['07']} ]));
  expect(buildDatabase().db['00']).toEqual(['07']);
 });
});

import { expandStraight } from './core';
it('expands BOX into distinct exact orders, including zeroes and triples',()=>{
 expect(expandStraight(['012'])).toEqual(['012','021','102','120','201','210']);
 expect(expandStraight(['112','121','111'])).toEqual(['111','112','121','211']);
 expect(expandStraight(['000'])).toEqual(['000']);
});
