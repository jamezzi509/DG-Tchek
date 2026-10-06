import {useState} from 'react';
import {calculateRundown,type PairMode} from '../lib/rundown';
const field='max-w-full rounded-xl border border-line bg-panel-raised px-3 py-2 text-sm text-paper';
export default function RundownPanel(){
 const [kind,setKind]=useState('3');const [seed,setSeed]=useState('');const [steps,setSteps]=useState(['111','123']);const [mode,setMode]=useState<PairMode>('all');const [copied,setCopied]=useState(false);
 const options=kind==='3'?['111','123','369','317']:kind==='split'?['11','12','36','31']:['1111','1234'];
 const valid=new RegExp(`^\\d{${kind==='3'?3:4}}$`).test(seed)&&steps.length>=2;
 const result=valid?calculateRundown(seed,steps,kind==='4'?'ends':mode,kind==='split'):null;
 return <details className="rounded-2xl border border-line bg-panel p-4"><summary className="cursor-pointer font-num text-sm font-bold uppercase tracking-widest text-gold">Laboratwa Rundown</summary><div className="mt-4 space-y-4">
 <select aria-label="Kalite rundown" className={field} value={kind} onChange={e=>{const k=e.target.value;setKind(k);setSeed('');setSteps(k==='3'?['111','123']:k==='split'?['11','12']:['1111','1234']);setCopied(false);}}><option value="3">Pick 3</option><option value="split">Pick 4 · devan / dèyè separe</option><option value="4">Pick 4 · 4 chif antye</option></select>
 <input aria-label="Nimewo rundown" placeholder={kind==='3'?'Antre 3 chif':'Antre 4 chif'} className={`${field} w-full font-num`} inputMode="numeric" maxLength={kind==='3'?3:4} value={seed} onChange={e=>{setSeed(e.target.value.replace(/\D/g,''));setCopied(false);}}/>
 <div className="flex flex-wrap gap-3">{options.map(s=><label key={s} className="text-sm"><input type="checkbox" checked={steps.includes(s)} disabled={!steps.includes(s)&&steps.length===3} onChange={()=>{setSteps(v=>v.includes(s)?v.filter(x=>x!==s):[...v,s]);setCopied(false);}}/> +{s}</label>)}</div>
 {kind==='3'&&<select aria-label="Pozisyon pè" className={field} value={mode} onChange={e=>{setMode(e.target.value as PairMode);setCopied(false);}}><option value="all">AB · BC · AC</option><option value="adjacent">AB · BC</option></select>}
 {steps.length<2&&<p className="text-sm text-mute">Chwazi 2 oswa 3 rundown.</p>}
 {result&&<><p className="text-sm text-mute">{result.followers.length} boul komen</p><p className="font-num text-xl font-bold text-paper">{result.followers.join(' · ')||'Pa gen boul komen'}</p><button className="text-sm text-gold underline" onClick={async()=>{try{await navigator.clipboard.writeText(result.followers.join(' '));setCopied(true);}catch{setCopied(false);}}}>{copied?'Kopye ✓':'Kopye boul yo'}</button><details><summary className="cursor-pointer text-sm text-gold">Wè liy yo</summary>{result.groups.map((g,i)=><div key={i} className="mt-3 overflow-x-auto"><p className="text-sm text-mute">Baz {g.seed}</p><table className="w-full text-center font-num text-sm"><thead><tr>{steps.map(s=><th key={s}>+{s}</th>)}</tr></thead><tbody>{g.rows[0].map((_,n)=><tr key={n}>{g.rows.map((r,j)=><td key={j} className="py-1">{r[n]}</td>)}</tr>)}</tbody></table></div>)}</details></>}
 </div></details>;
}
