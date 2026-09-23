import {useState} from "react";
import {calculateGyd,uniqueFamilies} from "../lib/workouts";

export default function GydManualPanel(){
 const [prizes,setPrizes]=useState<[string,string,string]>(["","",""]);
 const [numbers,setNumbers]=useState<string[]|null>(null);
 const [error,setError]=useState("");
 return <section aria-labelledby="manual-gyd-title" className="space-y-4 rounded-2xl border border-gold-dim/40 bg-panel p-4">
  <h2 id="manual-gyd-title" className="font-num text-sm font-bold uppercase tracking-[0.2em] text-paper"><span className="text-gold">◆</span> GYD sèlman</h2>
  <form className="space-y-4" onSubmit={e=>{e.preventDefault();if(!prizes.every(n=>/^\d{2}$/.test(n))){setError("Antre 2 chif nan chak lo.");return;}setError("");setNumbers(uniqueFamilies(calculateGyd(prizes).numbers));}}>
   <div className="grid grid-cols-3 gap-3">{["1ye lo","2èm lo","3èm lo"].map((label,i)=><label key={label} className="text-xs text-mute">{label}<input aria-label={`GYD pa mwen · ${label}`} inputMode="numeric" autoComplete="off" placeholder="00" maxLength={2} value={prizes[i]} onChange={e=>{const value=e.target.value.replace(/\D/g,"").slice(0,2);setPrizes(old=>{const next:[string,string,string]=[...old];next[i]=value;return next;});setNumbers(null);setError("");}} className="mt-2 w-full min-w-0 rounded-2xl border border-gold-dim/60 bg-panel-raised px-2 py-4 text-center font-num text-3xl font-bold text-paper focus:border-red focus:outline-none"/></label>)}</div>
   <button type="submit" className="w-full rounded-full bg-gradient-to-b from-red to-red-dim px-4 py-3 text-sm font-bold uppercase tracking-wide text-white">Kalkile GYD</button>
   {error&&<p role="alert" className="text-xs text-red">{error}</p>}
  </form>
  {numbers&&<div aria-live="polite" aria-label="Rezilta GYD pa mwen" className="flex flex-wrap justify-center gap-3">{numbers.map(n=><span key={n} className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-dim bg-gradient-to-b from-panel-raised to-ink font-num text-xl font-bold text-paper">{n}</span>)}</div>}
  {prizes.some(Boolean)&&<button className="block mx-auto text-xs text-mute underline" onClick={()=>{setPrizes(["","",""]);setNumbers(null);setError("");}}>Efase</button>}
 </section>;
}
