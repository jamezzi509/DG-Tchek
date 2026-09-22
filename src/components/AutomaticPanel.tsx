import { useEffect, useRef, useState } from "react";
import { gydFloridaSignals, scanOldWorkout } from "../lib/automatic-checks";
import { expectedSources, parseEngineFeed, type EngineDraw, type SourceStream } from "../lib/engine-feed";
import { calculateGyd, calculatePyramid, isValidDate, newYorkToday, previousDate, uniqueFamilies } from "../lib/workouts";
import { findCommonNumbers, type Database } from "../lib/core";

const inputClass="rounded-xl border border-line bg-panel-raised px-3 py-2 text-sm text-paper";
const label=(session:string)=>session==="midday"?"midi":"swa";
function preference(key:string) { try{return localStorage.getItem(`dgtchek:auto:${key}`)!=="off";}catch{return true;} }
function outcome(numbers:string[],actual:EngineDraw|undefined) {
  if(!actual)return "Rezilta: an atant";
  const lo=[actual.pick3.slice(-2),actual.pick4.slice(0,2),actual.pick4.slice(-2)];
  const matched=lo.flatMap((p,i)=>findCommonNumbers(numbers,[p]).length?[`${p} nan lo ${i+1}`]:[]);
  return matched.length?`Frape: ${matched.join(" · ")}`:"Pa frape nan 3 lo yo";
}

export default function AutomaticPanel({db,onCompare}:{db:Database;onCompare:(a:string,b:string)=>void}) {
  const [state,setState]=useState<"FL"|"NY">("FL");
  const [day,setDay]=useState(newYorkToday);
  const [session,setSession]=useState<"midday"|"evening">("midday");
  const [stream,setStream]=useState<SourceStream>("all");
  const [draws,setDraws]=useState<EngineDraw[]>([]);
  const [error,setError]=useState("");
  const [loaded,setLoaded]=useState(false);
  const [refresh,setRefresh]=useState(0);
  const [gydAlerts,setGydAlerts]=useState(()=>preference("gyd"));
  const [oldAlerts,setOldAlerts]=useState(()=>preference("old"));
  const manualTarget=useRef(false);
  useEffect(()=>{try{localStorage.setItem("dgtchek:auto:gyd",gydAlerts?"on":"off");localStorage.setItem("dgtchek:auto:old",oldAlerts?"on":"off");}catch{/* Device storage may be unavailable. */}},[gydAlerts,oldAlerts]);
  useEffect(()=>{
    let controller:AbortController|undefined;
    let active=true;
    async function read() {
      if(document.hidden)return;
      controller?.abort();controller=new AbortController();
      try {
        const response=await fetch(`http://127.0.0.1:4179/api/results?state=${state}&days=10`,{signal:controller.signal,cache:"no-store"});
        if(!response.ok)throw new Error("LottoEngine pa disponib.");
        const raw=await response.json();
        const incoming=parseEngineFeed(raw,state);
        if(!active)return;
        setDraws(incoming);setLoaded(true);
        if(!manualTarget.current){
          const today=newYorkToday();
          if(incoming.some(d=>d.date===today && d.session==="evening")){
            const next=new Date(`${today}T12:00:00Z`);next.setUTCDate(next.getUTCDate()+1);setDay(next.toISOString().slice(0,10));setSession("midday");
          }else{setDay(today);setSession(incoming.some(d=>d.date===today && d.session==="midday")?"evening":"midday");}
        }
        setError(raw.invalidRows ? "LottoEngine gen rezilta ki pa konplè; yo pa antre nan tchek yo." : "");
      } catch(e) {
        if(!active || (e instanceof Error && e.name==="AbortError"))return;
        setDraws([]);setLoaded(false);setError("Koneksyon LottoEngine sou Mac la pa disponib. Louvri lansè TCHÈK la epi eseye ankò.");
      }
    }
    setDraws([]);setLoaded(false);void read();
    const timer=window.setInterval(read,60000);
    const wake=()=>{void read();};
    window.addEventListener("focus",wake);document.addEventListener("visibilitychange",wake);
    return()=>{active=false;controller?.abort();window.clearInterval(timer);window.removeEventListener("focus",wake);document.removeEventListener("visibilitychange",wake);};
  },[state,refresh]);
  const valid=isValidDate(day);
  const target={date:day,session};
  const required=valid?expectedSources(target,stream):[];
  const selected=required.map(s=>draws.find(d=>d.date===s.date && d.session===s.session));
  const comparisons=selected.length===2 && selected.every((s):s is EngineDraw=>!!s)?scanOldWorkout([selected[0]!,selected[1]!],target,db):[];
  const gydSource=valid?draws.find(d=>d.date===previousDate(day) && d.session===session):undefined;
  const prizes:[string,string,string]|null=gydSource?[gydSource.pick3.slice(-2),gydSource.pick4.slice(0,2),gydSource.pick4.slice(-2)]:null;
  const gyd=prizes?calculateGyd(prizes):null;
  const signals=prizes && state==="FL"?gydFloridaSignals(prizes,session):[];
  const pyramid=valid?calculatePyramid(day):null;
  const latest=draws.at(-1);
  const actual=draws.find(d=>d.date===day && d.session===session);
  return <section aria-labelledby="auto-title" className="space-y-4 rounded-2xl border border-teal/40 bg-panel p-4">
    <div><p className="text-xs uppercase tracking-widest text-teal">LottoEngine → TCHÈK</p><h2 id="auto-title" className="mt-1 text-xl font-bold">Tchek otomatik ak alèt</h2><p className="mt-2 text-xs text-mute">Rezilta apwouve ki soti nan LottoEngine sou Mac sa a. Li rafrechi lè ou ouvri ekran an, epi chak minit pandan ekran an vizib.</p></div>
    <div className="flex flex-wrap gap-2">
      <select aria-label="Eta lotri" className={inputClass} value={state} onChange={e=>setState(e.target.value as "FL"|"NY")}><option value="FL">Florida</option><option value="NY">New York</option></select>
      <input aria-label="Dat tchek otomatik" className={`${inputClass} min-w-0`} type="date" value={day} onChange={e=>{manualTarget.current=true;setDay(e.target.value);}}/>
      <select aria-label="Tiraj sib otomatik" className={inputClass} value={session} onChange={e=>{manualTarget.current=true;setSession(e.target.value as "midday"|"evening");}}><option value="midday">Midi</option><option value="evening">Swa</option></select>
    </div>
    <button className="text-sm text-teal underline" onClick={()=>setRefresh(x=>x+1)}>Rafrechi rezilta yo</button>
    {error && <p role="alert" className="text-sm text-gold">{error}</p>}
    {latest && <p className="text-xs text-mute">Dènye tiraj resevwa: <b>{latest.date} {label(latest.session)} · {latest.pick3} / {latest.pick4}</b></p>}
    {!valid && <p role="alert">Chwazi yon dat valab.</p>}
    {loaded && !draws.length && <p className="text-sm text-mute">Pa gen rezilta apwouve nan 10 dènye jou yo.</p>}
    {loaded && valid && <>
      <p className="text-sm">{actual?`Rezilta sib: ${actual.pick3} / ${actual.pick4}`:"Rezilta sib la poko disponib nan LottoEngine. Nou pa konte l kòm yon miss."}</p>
      <div className="flex flex-wrap gap-3 text-xs"><label><input type="checkbox" checked={gydAlerts} onChange={e=>setGydAlerts(e.target.checked)}/> Alèt kondisyon GYD</label><label><input type="checkbox" checked={oldAlerts} onChange={e=>setOldAlerts(e.target.checked)}/> Alèt tchek pa m</label></div>
      <div className="space-y-2 border-t border-line pt-3"><h3 className="font-bold text-gold">GYD otomatik</h3>
        {gyd && gydSource?<><p className="text-xs text-mute">Sous: {gydSource.date} {label(session)} · {gydSource.pick3} / {gydSource.pick4}</p><p className="font-num text-lg">{uniqueFamilies(gyd.numbers).join(" · ")}</p>
          <p className="text-xs text-teal">{outcome(gyd.numbers,actual)}</p>
          {gydAlerts && signals.map(s=><p key={s.id} className="text-sm text-gold">● {s.reason} → verifye {day} swa</p>)}
          {gydAlerts && signals.length===0 && <p className="text-xs text-mute">{state==="FL" && session==="evening"?"Okenn nan 3 kondisyon GYD Florida yo pa prezan.":"3 kondisyon rechèch GYD yo aplike pou Florida swa → swa sèlman."}</p>}
        </>:<p className="text-sm text-mute">Sous GYD manke: {previousDate(day)} {label(session)}. Tchek la ap tann.</p>}
      </div>
      <div><h3 className="font-bold text-gold">Piramid dat la</h3><p className="mt-2 font-num">{pyramid && uniqueFamilies(pyramid.numbers).join(" · ")}</p>{pyramid && <p className="mt-1 text-xs text-teal">{outcome(pyramid.numbers,actual)}</p>}</div>
      <div className="space-y-3 border-t border-line pt-3"><h3 className="font-bold text-teal">Tchek pa w · 2 dènye tiraj</h3>
        <select aria-label="Fenèt sous tchek" className={`${inputClass} w-full`} value={stream} onChange={e=>setStream(e.target.value as SourceStream)}><option value="all">Midi + swa, youn apre lòt</option><option value="midday">Midi + midi</option><option value="evening">Swa + swa</option></select>
        {required.map((s,i)=><p key={`${s.date}-${s.session}`} className="text-xs text-mute">{s.date} {label(s.session)}: {selected[i]?`${selected[i]!.pick3} / ${selected[i]!.pick4}`:"manke — ap tann"}</p>)}
        {selected.every(Boolean) && <p className="text-sm">{comparisons.length} konparezon jwenn selon règ ou yo.</p>}
        {oldAlerts && comparisons.length>0 && <details open><summary className="cursor-pointer text-sm text-teal">Wè konparezon yo ak boul komen</summary><div className="mt-3 space-y-3">{comparisons.map(c=><div key={c.inputs.join()} className="rounded-xl border border-line p-3">
          <button onClick={()=>onCompare(...c.inputs)} className="font-num font-bold text-gold underline">{c.inputs.join(" + ")}</button>
          <p className="mt-1 font-num text-sm">{c.followers.length?c.followers.join(" · "):"Pa gen follower komen"}</p>
          {c.followers.length>0 && <p className="mt-1 text-xs text-teal">{outcome(c.followers,actual)}</p>}
          <p className="mt-1 text-xs text-mute">{c.evidence.map(e=>`${e.rule}: ${e.pairs.join(" + ")}${e.converted?" (fo doub konvèti ak chif komen an)":""}`).join("; ")}</p>
          {gyd && <p className="mt-1 text-xs">Komen ak GYD: {findCommonNumbers(c.followers,gyd.numbers).join(" · ") || "pa gen"}</p>}
          {pyramid && <p className="mt-1 text-xs">Komen ak piramid: {findCommonNumbers(c.followers,pyramid.numbers).join(" · ") || "pa gen"}</p>}
        </div>)}</div></details>}
      </div><p className="text-xs text-mute">Alèt yo parèt nan TCHÈK sèlman. Kondisyon rechèch yo pa garanti yon hit. Done manke rete an atant.</p>
    </>}
  </section>;
}
