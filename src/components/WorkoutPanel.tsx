import { useState } from "react";
import { type DgTchekResult } from "../lib/core";
import { calculateGyd, calculatePyramid, compareWorkouts, isValidDate, newYorkToday, pairFamily, previousDate, uniqueFamilies } from "../lib/workouts";
import { gydFloridaSignals } from "../lib/automatic-checks";

const fieldClass = "w-full min-w-0 rounded-xl border border-line bg-panel-raised px-3 py-3 font-num text-paper focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

function Balls({ numbers, highlighted = [] }: { numbers: string[]; highlighted?: string[] }) {
  const stars = new Set(highlighted.map(pairFamily));
  const families = uniqueFamilies(numbers);
  return families.length ? (
    <div className="flex flex-wrap gap-2">
      {families.map(n => (
        <span key={pairFamily(n)} className={`rounded-xl border px-3 py-2 font-num text-xl font-bold ${stars.has(pairFamily(n)) ? "border-gold bg-gold/10 text-gold" : "border-line bg-panel-raised text-paper"}`}>
          {stars.has(pairFamily(n)) && <span aria-label="Komen ak tchek ou">★ </span>}
          {n}
        </span>
      ))}
    </div>
  ) : <p className="text-sm text-mute">Pa gen boul komen.</p>;
}

function Triangle({ rows }: { rows: number[][] }) {
  return <pre className="overflow-x-auto rounded-xl bg-ink p-3 text-center font-num text-sm leading-7 text-paper" aria-label="Etap piramid la">{rows.map(row => row.join("  ")).join("\n")}</pre>;
}

export default function WorkoutPanel({ tchek }: { tchek: DgTchekResult | null }) {
  const [date, setDate] = useState(newYorkToday);
  const [session, setSession] = useState("Midi");
  const [prizes, setPrizes] = useState<[string, string, string]>(["", "", ""]);
  const [compare, setCompare] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const pyramid = isValidDate(date) ? calculatePyramid(date) : null;
  const gyd = prizes.every(n => /^\d{2}$/.test(n)) ? calculateGyd(prizes) : null;
  const common = compareWorkouts(tchek?.common ?? [], pyramid?.numbers ?? [], gyd?.numbers ?? []);
  const sourceDate = pyramid ? previousDate(date) : null;
  const signals = gyd ? gydFloridaSignals(prizes, session === "Swa" ? "evening" : "midday") : [];
  const labels = ["1ye lo · Pick 3 dèyè", "2èm lo · Pick 4 devan", "3èm lo · Pick 4 dèyè"];

  async function copyResults() {
    if (!pyramid) return;
    const lines = [
      `TCHÈK · ${date} ${session}`, `PIRAMID: ${uniqueFamilies(pyramid.numbers).join(" ")}`,
      ...(gyd ? [`GYD · sous ${sourceDate} ${session}: ${prizes.join(" / ")}`, `GYD: ${uniqueFamilies(gyd.numbers).join(" ")}`] : []),
      ...(tchek ? [`TCHEK ${tchek.input1} + ${tchek.input2}: ${tchek.common.join(" ")}`, `TCHEK + PIRAMID: ${common.tchekPyramid.join(" ") || "Pa gen"}`] : []),
      ...(tchek && gyd ? [`TCHEK + GYD: ${common.tchekGyd.join(" ") || "Pa gen"}`, `TOULE 3: ${common.allThree.join(" ") || "Pa gen"}`] : []),
      "Chak boul konte ak anvè li. Sa pa garanti yon hit.",
    ];
    try { await navigator.clipboard.writeText(lines.join("\n")); setCopyStatus("Kopye ✓"); }
    catch { setCopyStatus("Kopi a pa mache nan navigatè sa a."); }
  }

  return (
    <section id="workouts" aria-labelledby="workout-title" className="flex flex-col gap-5 rounded-2xl border border-gold-dim/40 bg-panel p-4 sm:p-5">
      <div>
        <h2 id="workout-title" className="font-num text-sm font-bold uppercase tracking-[0.2em] text-paper">Piramid + GYD</h2>
        
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_100px] gap-3">
        <label className="text-xs text-mute">Dat pou verifye
          <input aria-label="Dat pou verifye" type="date" value={date} onChange={e => { setDate(e.target.value); setPrizes(["", "", ""]); setCopyStatus(""); }} className={`${fieldClass} mt-2`} />
        </label>
        <label className="text-xs text-mute">Tiraj
          <select aria-label="Tiraj" value={session} onChange={e => { setSession(e.target.value); setPrizes(["", "", ""]); setCopyStatus(""); }} className={`${fieldClass} mt-2`}><option>Midi</option><option>Swa</option></select>
        </label>
      </div>
      {!pyramid && <p role="alert" className="text-sm text-red">Chwazi yon dat ki valab.</p>}

      <div className="space-y-3">
        <h3 className="font-num text-sm font-bold uppercase tracking-widest text-gold">1. Piramid dat la</h3>
        {pyramid ? <>
          <Balls numbers={pyramid.numbers} highlighted={compare && tchek ? common.tchekPyramid : []} />
          <details className="text-sm text-mute">
            <summary className="cursor-pointer py-1">Wè kalkil piramid la</summary>
            <p className="my-2">Jou + mwa + ane, san zewo devan jou ak mwa. Ajoute vwazen yo; kenbe dènye chif chak sòm.</p>
            <Triangle rows={pyramid.rows} />
            <p className="mt-2 font-num">Lis orijinal: {pyramid.numbers.join(" · ")}</p>
            <p className="mt-2">Pran pwent la ak chak chif liy 2 a; premye/dènye chif baz la; de chif nan mitan an; epi premye/dènye chif baz la ak vwazen yo nan liy apre a. Ajoute jou mwa a kòm rezèv. Retire repetisyon egzak yo epi kenbe premye 6 yo.</p>
            <a className="mt-2 inline-block text-gold underline" href="https://loteriadela1.com/piramide-de-hoy" target="_blank" rel="noreferrer">Sous vèsyon piramid la ↗</a>
          </details>
        </> : <p className="text-sm text-mute">Antre dat la pou kalkile piramid la.</p>}
      </div>

      <div className="space-y-3 border-t border-line pt-4">
        <h3 className="font-num text-sm font-bold uppercase tracking-widest text-gold">2. GYD ak 3 lo yo</h3>
        <p className="text-sm text-mute">Antre lo <strong className="text-paper">{sourceDate ?? "jou anvan an"} · {session}</strong> pou verifye {date || "dat la"} · {session}.</p>
        <div className="grid grid-cols-3 gap-2">
          {labels.map((label, i) => <label key={label} className="text-[11px] leading-4 text-mute">{label}
            <input aria-label={label} inputMode="numeric" autoComplete="off" placeholder="00" maxLength={2} value={prizes[i]} onChange={e => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 2);
              setPrizes(old => { const next: [string, string, string] = [...old]; next[i] = value; return next; });
              setCopyStatus("");
            }} className={`${fieldClass} mt-2 text-center text-2xl`} />
          </label>)}
        </div>
        
        {gyd ? <>
          {signals.length > 0 && <aside aria-label="Kondisyon GYD Florida" className="rounded-xl border border-gold-dim bg-gold/10 p-3 text-sm">
            <p className="font-num text-sm font-bold uppercase tracking-widest text-gold">Kondisyon pou swivi · Florida swa → swa</p>
            <ul className="mt-2 list-inside list-disc text-paper">{signals.map(signal => <li key={signal.id}>{signal.reason}</li>)}</ul>
            
          </aside>}
          <Balls numbers={gyd.numbers} highlighted={compare && tchek ? common.tchekGyd : []} />
          <details className="text-sm text-mute">
            <summary className="cursor-pointer py-1">Wè fòmil GYD a</summary>
            <Triangle rows={gyd.rows} />
            <p className="my-2">Anwo = pwent piramid la. Agoch = anwo + premye chif liy 2 a. Adwat = anwo + dezyèm chif liy 2 a. Anba = agoch + adwat. Toujou kenbe inite a.</p>
            <pre className="rounded-xl bg-ink p-3 text-center font-num leading-7 text-paper">{`    ${gyd.cross.top}\n${gyd.cross.left}   +   ${gyd.cross.right}\n    ${gyd.cross.bottom}`}</pre>
            <p className="mt-2">Lòd boul yo: agoch/adwat, adwat/adwat, adwat/agoch, agoch/agoch, anwo/adwat, adwat/anba, anba/agoch, agoch/anwo.</p>
            <p className="mt-2 font-num">8 rezilta anvan retire repetisyon: {gyd.rawNumbers.join(" · ")}</p>
            <p className="mt-2">Fòmil rekonstwi a matche ak 196 egzanp kalkilatè piblik la. Sa verifye kalkil la, li pa mezire chans pou genyen.</p>
            <a className="mt-2 inline-block text-gold underline" href="https://loteriadominicanas.net/metodo-g-y-d/" target="_blank" rel="noreferrer">Kalkilatè referans GYD ↗</a>
          </details>
        </> : <p className="text-sm text-mute">Antre tout 3 lo yo ak 2 chif chak pou wè GYD a.</p>}
      </div>

      <div className="space-y-3 border-t border-line pt-4">
        {tchek ? <p className="text-sm text-paper">Tchek aktif: <b className="font-num">{tchek.input1} + {tchek.input2}</b></p> : <p className="text-sm text-mute">Fè yon konparezon 2 boul anlè a pou aktive boul komen yo.</p>}
        <button type="button" disabled={!tchek || !pyramid} onClick={() => setCompare(true)} className="w-full rounded-full bg-gradient-to-b from-red to-red-dim px-4 py-3 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-40">Wè boul komen</button>
        {compare && tchek && pyramid && <div aria-live="polite" className="space-y-4">
          <div><h3 className="mb-2 text-sm font-bold">Tchek ou + Piramid</h3><Balls numbers={common.tchekPyramid} /></div>
          <div><h3 className="mb-2 text-sm font-bold">Tchek ou + GYD</h3>{gyd ? <Balls numbers={common.tchekGyd} /> : <p className="text-sm text-mute">Antre 3 lo GYD yo anvan.</p>}</div>
          <div><h3 className="mb-2 text-sm font-bold text-gold">Komen nan toule 3</h3>{gyd ? <Balls numbers={common.allThree} /> : <p className="text-sm text-mute">Antre 3 lo GYD yo anvan.</p>}</div>
        </div>}
        <button type="button" disabled={!pyramid} onClick={copyResults} className="w-full rounded-full border border-line px-4 py-2 text-sm text-paper disabled:opacity-40">Kopye kalkil yo</button>
        <p role="status" className="text-xs text-gold">{copyStatus}</p>
        
      </div>
    </section>
  );
}
