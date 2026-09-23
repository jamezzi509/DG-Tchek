import { calculateGyd, isValidDate, pairFamily, previousDate, uniqueFamilies } from "./workouts";
import { drawPrizes, type EngineDraw } from "./engine-feed";

export type GydTestRow = {date:string; source?:EngineDraw; target?:EngineDraw; numbers:string[]; hits:string[]; positions:number[]; status:"hit"|"miss"|"pending"};
export function backtestGyd(draws:EngineDraw[],start:string,end:string,session:string) {
  if(!isValidDate(start)||!isValidDate(end)||start>end || (Date.parse(end)-Date.parse(start))/86400000>366)throw new Error("Chwazi yon peryòd ki pa depase 367 jou.");
  const slots=new Map<string,EngineDraw>();
  if(new Set(draws.map(d=>d.state)).size>1)throw new Error("Chwazi yon sèl lotri.");
  for(const d of draws){const key=`${d.date}/${d.session}`;if(slots.has(key))throw new Error("Rezilta repete.");slots.set(key,d);}
  const rows:GydTestRow[]=[];
  const cursor=new Date(`${start}T12:00:00Z`);
  while(cursor.toISOString().slice(0,10)<=end){
    const date=cursor.toISOString().slice(0,10);
    const source=slots.get(`${previousDate(date)}/${session}`),target=slots.get(`${date}/${session}`);
    const numbers=source?uniqueFamilies(calculateGyd(drawPrizes(source)).numbers):[];
    const families=new Set(numbers.map(pairFamily));
    const prizes=target?drawPrizes(target):[];
    const positions=source?prizes.flatMap((n,i)=>families.has(pairFamily(n))?[i+1]:[]):[];
    const hits=uniqueFamilies(positions.map(i=>prizes[i-1]));
    rows.push({date,source,target,numbers,hits,positions,status:!source||!target?"pending":hits.length?"hit":"miss"});
    cursor.setUTCDate(cursor.getUTCDate()+1);
  }
  const resolved=rows.filter(r=>r.status!=="pending");
  const hits=resolved.filter(r=>r.status==="hit").length;
  return {rows,hits,opportunities:resolved.length,misses:resolved.length-hits,pending:rows.length-resolved.length,rate:resolved.length?100*hits/resolved.length:null,twoOrMore:resolved.filter(r=>r.hits.length>=2).length,three:resolved.filter(r=>r.hits.length===3).length};
}
