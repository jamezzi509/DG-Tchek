import {useEffect,useRef,useState} from "react";
import {backtestGyd} from "../lib/gyd-backtest";
import {drawLabel,parseEngineFeed,type EngineLottery} from "../lib/engine-feed";
import {newYorkToday,previousDate} from "../lib/workouts";
const field="min-w-0 max-w-full rounded-xl border border-line bg-panel-raised px-3 py-2 text-sm text-paper";
const label=(s:string)=>({morning:"Maten",midday:"Midi",evening:"Swa",night:"Lannuit"}[s]??s);
export default function GydBacktestPanel({lotteries}:{lotteries:EngineLottery[]}){
 const [state,setState]=useState("FL"),[session,setSession]=useState("evening");
 const [start,setStart]=useState(()=>previousDate(newYorkToday()).slice(0,8)+"01"),[end,setEnd]=useState(()=>previousDate(newYorkToday()));
 const [result,setResult]=useState<ReturnType<typeof backtestGyd>|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const request=useRef<AbortController|null>(null);
 const sessions=lotteries.find(l=>l.code===state)?.sessions??["midday","evening"];
 useEffect(()=>()=>request.current?.abort(),[]);
 function reset(){request.current?.abort();request.current=null;setResult(null);setError("");setBusy(false);}
 async function run(){
  request.current?.abort();const controller=new AbortController();request.current=controller;setBusy(true);setError("");setResult(null);
  try{
   backtestGyd([],start,end,session);
   if(end>newYorkToday())throw new Error("Dat fen an pa ka nan lavni.");
   const response=await fetch(`http://127.0.0.1:4179/api/results?${new URLSearchParams({state,start,end})}`,{signal:controller.signal,cache:"no-store"});
   if(!response.ok)throw new Error("Istwa a pa disponib. Verifye konektè LottoEngine la ak dat yo.");
   const raw=await response.json();const draws=parseEngineFeed(raw,state);
   if(request.current!==controller)return;
   setResult(backtestGyd(draws,start,end,session));
   if(raw.invalidRows)setError(`${raw.invalidRows} rezilta enkonplè pa antre nan tès la.`);
  }catch(e){if(request.current===controller)setError(e instanceof Error?e.message:"Tès la pa mache.");}
  finally{if(request.current===controller)setBusy(false);}
 }
 return <details className="rounded-2xl border border-gold-dim/40 bg-panel p-4">
  <summary className="cursor-pointer font-num text-sm font-bold uppercase tracking-widest text-paper">GYD sèlman · Backtest</summary>
  <div className="mt-4 space-y-4">
   <p className="text-xs text-mute">Menm tiraj jou anvan → 3 lo jou sib la. Anvè konte.</p>
   <div className="grid grid-cols-2 gap-2">
    <select aria-label="Lotri backtest GYD" className={field} value={state} onChange={e=>{reset();setState(e.target.value);setSession(lotteries.find(l=>l.code===e.target.value)?.sessions[0]??"evening");}}>{(lotteries.length?lotteries:[{code:"FL",name:"Florida",sessions:[]}]).map(l=><option key={l.code} value={l.code}>{l.name}</option>)}</select>
    <select aria-label="Tiraj backtest GYD" className={field} value={session} onChange={e=>{reset();setSession(e.target.value);}}>{sessions.map(s=><option key={s} value={s}>{label(s)}</option>)}</select>
    <label className="text-xs text-mute">Depi<input aria-label="Dat kòmansman backtest" type="date" className={`${field} mt-1 w-full`} value={start} onChange={e=>{reset();setStart(e.target.value);}}/></label>
    <label className="text-xs text-mute">Jiska<input aria-label="Dat fen backtest" type="date" className={`${field} mt-1 w-full`} value={end} max={newYorkToday()} onChange={e=>{reset();setEnd(e.target.value);}}/></label>
   </div>
   <button onClick={run} disabled={busy} className="w-full rounded-full bg-gradient-to-b from-red to-red-dim px-4 py-3 text-sm font-bold uppercase text-white disabled:opacity-50">{busy?"Ap teste…":"Teste GYD"}</button>
   {error&&<p role="alert" className="text-xs text-gold">{error}</p>}
   {result&&<div aria-live="polite" className="space-y-3">
    <p className="font-num text-xl font-bold text-gold">{result.hits} / {result.opportunities} frape · {result.rate===null?"—":`${result.rate.toFixed(1)}%`}</p>
    <p className="text-xs text-mute">{result.misses} rate · {result.pending} an atant · {result.twoOrMore} ak omwen 2 boul diferan · {result.three} ak 3 boul diferan</p>
    <p className="text-xs text-mute">Chak tiraj konte yon fwa. Jou san sous oswa rezilta pa antre nan pousantaj la. Sa se rezilta istorik.</p>
    <details><summary className="cursor-pointer text-sm text-gold">Wè chak tiraj ({result.rows.length})</summary>
     <div className="mt-3 max-h-96 space-y-3 overflow-y-auto">{result.rows.map(r=><div key={r.date} className="rounded-xl border border-line p-3 text-xs">
      <p className="font-bold text-paper">{r.date} · {label(session)} · {r.status==="hit"?"FRAPE":r.status==="miss"?"RATE":"AN ATANT"}</p>
      <p className="mt-1 text-mute">Sous {previousDate(r.date)}: {r.source?drawLabel(r.source):"manke"}</p>
      <p className="mt-1 font-num text-lg text-paper">{r.numbers.join(" · ")||"—"}</p>
      <p className="mt-1 text-mute">Rezilta: {r.target?drawLabel(r.target):"manke"}</p>
      {!!r.hits.length&&<p className="mt-1 text-gold">Frape: {r.hits.join(" · ")} · lo {r.positions.join(", ")}</p>}
     </div>)}</div>
    </details>
   </div>}
  </div>
 </details>;
}
