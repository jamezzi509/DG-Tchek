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
  expect(r.pick3).toEqual(['222','227','224','225','277','247','257','245','457','445','455','477','447','577','557','777']);
 });
 it('59–69 includes every exact trailing-pair Pick 3 straight, including 778',()=>{
  const r=runDGTchek('59','69',buildDatabase().db);
  expect(r.common).toEqual(['04','07','48','78']);
  expect(computePicksFromCommon(r.common).pick3Straight).toEqual(['004','404','704','804','007','407','707','807','048','448','748','848','078','478','778','878']);
  expect(computePicksFromCommon(r.common).pick3Straight).toContain('778');
  expect(r.pick3).toContain('778');
 });
 it('02–00 preserves leading-zero and triple Pick 3 forms',()=>{
  expect(runDGTchek('02','00',buildDatabase().db).pick3).toEqual(['111','112','116','118','119','122','126','128','129','166','168','169','188','189','199','266','666','668','669']);
 });
 it('requires two distinct pairs; repeated occurrences of one pair do not suffice',()=>{
  expect(computePicksFromCommon(['12','21']).pick3).toEqual(['112','122']);
  expect(computePicksFromCommon(['00']).pick3).toEqual(['000']);
  expect(computePicksFromCommon(['12','21']).pick3Straight).toEqual(['112','212']);
  expect(computePicksFromCommon(['01','02']).pick3).toEqual(['001','011','012','002','022']);
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

import { directedStraight } from './core';
it('keeps follower direction without automatic reversals',()=>{
 expect(directedStraight(['38','39'])).toEqual(['839','938']);
 expect(directedStraight(['00'])).toEqual(['000']);
 expect(directedStraight(['01','02'])).toEqual(['102','201']);
 expect(directedStraight(['22','27','77'])).toEqual(['222','227','277','722','727','777']);
});

it('reproduces all eighteen approved 35–38 STRAIGHT values',()=>{
 const common=runDGTchek('35','38',buildDatabase().db).common;
 expect(directedStraight(common)).toEqual(['246','426','444','446','447','449','499','644','647','649','744','746','749','944','946','947','949','999']);
});
