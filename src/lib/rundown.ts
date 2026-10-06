export type PairMode = 'adjacent' | 'all' | 'ends';
export function rundown(seed:string,step:string):string[] {
  if(!/^\d{2,4}$/.test(seed)||!/^\d+$/.test(step)||seed.length!==step.length)throw new Error('Antre bon kantite chif yo.');
  return Array.from({length:10},(_,n)=>[...seed].map((d,i)=>(Number(d)+n*Number(step[i]))%10).join(''));
}
export function pairs(rows:string[],mode:PairMode):Set<string> {
  return new Set(rows.flatMap(s=>mode==='ends'?[s.slice(0,2),s.slice(2)]:s.length===2?[s]:mode==='all'?[s[0]+s[1],s[1]+s[2],s[0]+s[2]]:[s.slice(0,2),s.slice(1)]));
}
const reverse=(s:string)=>[...s].reverse().join('');
const canonical=(s:string)=>s<reverse(s)?s:reverse(s);
export function commonReverse(sets:Set<string>[]):string[] {
  if(sets.length<2)return [];
  const candidates=new Set([...sets[0]].map(canonical));
  return [...candidates].filter(p=>sets.every(s=>s.has(p)||s.has(reverse(p)))&&sets.some((a,i)=>sets.some((b,j)=>i!==j&&[...a].some(v=>canonical(v)===p&&b.has(reverse(v)))))).sort();
}
export function calculateRundown(seed:string,steps:string[],mode:PairMode,split=false) {
  const seeds=split?[seed.slice(0,2),seed.slice(2)]:[seed];
  const groups=seeds.map(s=>{const rows=steps.map(step=>rundown(s,step));return {seed:s,rows,followers:commonReverse(rows.map(r=>pairs(r,split?'adjacent':mode)))};});
  return {groups,followers:[...new Set(groups.flatMap(g=>g.followers))].sort()};
}
