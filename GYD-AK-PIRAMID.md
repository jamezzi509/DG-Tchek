# GYD + Piramid nan TCHÈK

Prepare 22 septanm 2026. Kopi lokal: `pair-followers/tchek-workouts`.

## Men fòmil GYD a

Pran **3 lo yo nan lòd yo**. Pou Florida / New York:

- 1ye lo: 2 dènye chif Pick 3.
- 2èm lo: 2 premye chif Pick 4.
- 3èm lo: 2 dènye chif Pick 4.

Kenbe chak lo ak 2 chif: **01 pa dwe pèdi 0 a**. Pa konvèti fo doub yo, pa ranplase boul sous yo ak anvè oswa miwa yo anvan kalkil la.

### Egzanp kalkil: 25 / 11 / 13

Kole yo: **251113**. Ajoute vwazen yo epi kenbe inite a (11 → 1).

```text
2  5  1  1  1  3
 7  6  2  2  4
  3  8  4  6
   1  2  0
    3  2
     5
```

Fòme kwa a:

- **Anwo = 5**, pwent piramid la.
- **Agoch = 3 + 5 = 8**.
- **Adwat = 2 + 5 = 7**.
- **Anba = 8 + 7 = 15 → 5**.

```text
    5
8   +   7
    5
```

Rale 8 boul yo nan lòd sa a. “Kole” vle di kole chif yo, pa ajoute yo.

| Chif pou kole | Boul |
|---|---|
| Agoch + adwat | 87 |
| Adwat + adwat | 77 |
| Adwat + agoch | 78 |
| Agoch + agoch | 88 |
| Anwo + adwat | 57 |
| Adwat + anba | 75 |
| Anba + agoch | 58 |
| Agoch + anwo | 85 |

**Lis orijinal: 87, 77, 78, 88, 57, 75, 58, 85.**

Avèk règ anvè pa w la: **87/78, 77, 88, 57/75, 58/85**. Chak fanmi konte yon sèl fwa.

Fòmil sa a te rekonstwi apati antre ak rezilta [kalkilatè GYD piblik la](https://loteriadominicanas.net/metodo-g-y-d/). Li matche egzakteman, menm lòd ak repetisyon yo, sou **180 egzanp konsève + 16 nouvo egzanp**. Nou pa jwenn kòd prive sèvè sit la; se konpòtman kalkilatè a nou repwodui ak verifye. Verifikasyon sa a pa vle di yon pousantaj chans genyen.

## Piramid dat la

Vèsyon [Lotería de la 1](https://loteriadela1.com/piramide-de-hoy), menm ak tès istorik la:

1. Kole jou + mwa + ane, san zewo devan jou ak mwa.
2. Ajoute vwazen yo modulo 10, jiskaske rete yon chif.
3. Fè lis kandida yo nan lòd sa a:
   - Pwent + premye chif liy ki gen 2 chif la.
   - Pwent + dezyèm chif liy ki gen 2 chif la.
   - Premye + dènye chif baz la.
   - Baz nan endèks `floor(n/2)-1` ak `floor(n/2)` (endèks kòmanse a 0).
   - Premye chif baz la + premye chif liy ki vini apre baz la.
   - Dènye chif baz la + dènye chif liy ki vini apre baz la.
   - Jou mwa a kòm boul rezèv, sou 2 chif.
4. Retire repetisyon egzak yo, kenbe premye 6 yo. Se apre sa nou mete anvè yo ansanm pou konpare.

**22/09/2026 → 2292026 → 74, 73, 26, 92, 24, 68.**

Piramid sa a baze sou dat sèlman: menm lis la pou midi ak swa.

## Itilizasyon nan aplikasyon an

1. Fè konparezon 2 boul pa w la anlè ekran an.
2. Desann nan **Piramid + GYD**; chwazi dat pou verifye a ak Midi/Swa.
3. Antre 3 lo **jou anvan an, nan menm tiraj la**, jan ekran an mande a. Sa repwodui fenèt tès GYD nou te itilize a.
4. Peze **Wè boul komen**.
5. Gade **Tchek ou + Piramid**, **Tchek ou + GYD**, ak **Komen nan toule 3**.

Tout lis orijinal yo rete vizib. Zetwal la make boul ki komen ak tchek ou a. Chanje dat oswa tiraj efase 3 lo yo pou pa sèvi ak yon ansyen sous san wè sa. Chanje konparezon aktif la mete rezilta komen yo ajou.

Afichaj ak kopi lis yo montre chak boul yon sèl fwa (egzanp **67**). Pwogram nan toujou rekonèt anvè li (**76**) otomatikman; li pa bezwen ekri toulede sou ekran an.

GYD ak piramid mache san apèl sou entènèt. Se itilizatè a ki antre rezilta sous yo; nouvo ekran sa a pa telechaje rezilta lotri otomatikman.

## Kòd ak verifikasyon

- `src/lib/workouts.ts`: fòmil yo, validasyon dat, anvè ak entèseksyon.
- `src/components/WorkoutPanel.tsx`: ekran an kreyòl.
- `src/lib/__fixtures__/gyd-public-cases.json`: 196 egzanp referans GYD.
- `src/lib/__fixtures__/pyramid-public-cases.json`: 1 461 dat (2024–2027) soti nan kòd piblik piramid la.
- `src/lib/__fixtures__/tchek-live-cases.json`: 450 konparezon TCHÈK anrejistre sou sit la.

Achiv sous orijinal `/Users/aj/Downloads/dg-tchek-source.zip` rete entak. Li te gen lis followers elaji ki pa menm ak sit piblik la. Kopi sa a sèvi ak 6 lis baz ki soti nan bundle aktyèl `index-DVxY0ocd.js` sou `dg-tchek.vercel.app`, verifye 22 septanm 2026. Tout 450 konparezon yo matche. Lis pèsonèl ki nan navigatè itilizatè a toujou gen priyorite sou lis pa defo yo; yo pa transfere otomatikman ant sit piblik la ak localhost.

Pou lanse:

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 4178
```

Pou verifye:

```sh
npm run build
npx vitest run
npm run lint
```

209 tès pase, ansanm ak tès sou 1 461 dat ak 450 konparezon. Nouvo kòd la prepare lokalman; sit piblik la poko deplwaye ak chanjman sa yo.
