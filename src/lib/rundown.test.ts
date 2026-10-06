import {describe,it,expect} from 'vitest';
import {rundown,pairs,commonReverse,calculateRundown} from './rundown';
describe('rundown',()=>{
 it('preserves zeroes and uses digitwise arithmetic',()=>{expect(rundown('099','123').slice(0,3)).toEqual(['099','112','235']);expect(rundown('0000','1111')).toHaveLength(10);});
 it('requires reverse before canonicalizing',()=>{expect(commonReverse([new Set(['65']),new Set(['65'])])).toEqual([]);expect(commonReverse([new Set(['56']),new Set(['65'])])).toEqual(['56']);});
 it('uses only Pick4 ends',()=>{expect([...pairs(['1234'],'ends')]).toEqual(['12','34']);});
 it('reproduces archived 8984 example',()=>{expect(calculateRundown('8984',['1111','1234'],'ends').followers).toEqual(['15','26','56','67']);});
 it('merges split duplicates and retains self reversing doubles',()=>{const r=calculateRundown('0000',['11','31'],'ends',true);expect(r.followers).toEqual(r.groups[0].followers);expect(commonReverse([new Set(['00']),new Set(['00'])])).toEqual(['00']);});
 it('requires membership in all three and cross-list reversal',()=>{expect(commonReverse([new Set(['12']),new Set(['21']),new Set(['34'])])).toEqual([]);});
});
