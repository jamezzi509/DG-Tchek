# TCHÈK — Lotto AnDirek

A mobile-first, installable PWA (Haitian Creole UI) that compares two
2-digit numbers, finds their common values using the **mirror rule**, and
generates **Pick 3** and **Pick 4** combinations — styled after the Lotto
AnDirek brand, with DG the mascot in the header.

## Run it

```bash
npm install
npm run dev      # local dev server, http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # serve the production build locally
```

## How the logic works

All algorithm code lives in `src/lib/core.ts`, fully commented, with no UI
or storage dependencies (easy to unit test in isolation).

### 1. Mirror rule

Two numbers are considered "the same" if they're identical or digit-reversed:
`45 = 54`, `89 = 98`, `02 = 20`, `09 = 90`.

```ts
reversePair("45")     // "54"
isMirrorMatch("45", "54") // true
```

### 2. The database — generated, not hand-typed

Every key `00`-`99` belongs to a **chain of 10 keys**. Shifting every digit
of a chain's key and every digit of every number in its list by `+1`
(wrapping `9 -> 0`) produces the next row in the chain. Doing this 10 times
returns you to the start (shifting a digit by 1 ten times is the identity,
mod 10).

So instead of hand-typing 100 rows, the app stores **one seed row per
chain** (`src/data/seeds.ts`) and `generateRowsFromSeed()` expands each seed
into its full 10-row chain at runtime. This was verified digit-for-digit
against the reference data supplied for the project (BAZ 1-5, BOUL PÈ, and
the GROUP 00-05 listings) — every generated row matches exactly.

Six seed chains are built in — and because `07` and `70` are the *same* boul
under the mirror rule (not two different ones), that's actually enough to
cover **all 100 keys**, not just 60:

| Seed | Chain | Mirror of |
|---|---|---|
| `00` | 00,11,22,33,44,55,66,77,88,99 | itself |
| `01` | 01,12,23,34,45,56,67,78,89,90 | chain `09` |
| `02` | 02,13,24,35,46,57,68,79,80,91 | chain `08` |
| `03` | 03,14,25,36,47,58,69,70,81,92 | chain `07` |
| `04` | 04,15,26,37,48,59,60,71,82,93 | chain `06` |
| `05` | 05,16,27,38,49,50,61,72,83,94 | itself |

`buildDatabase()` (`src/lib/database.ts`) does a mirror-alias pass after
generating the seeded chains: for any key still empty, it checks whether
that key's mirror has data, and if so, the two share the exact same list
(`db["07"] === db["70"]`). Verified digit-for-digit — chain `09` really is
the mirror of chain `01`, chain `08` the mirror of `02`, and so on, so
nothing is actually missing.

The Admin panel's row table reflects this: gold keys came directly from a
seed chain, teal keys were filled by their mirror, and (if you ever add a
seed with a typo or gap) grey keys are genuinely empty.

### 3. Finding common numbers

`findCommonNumbers(listA, listB)` walks `listA` and keeps any value that
matches something in `listB` under the mirror rule, de-duplicated.

### 4. Pick 3 / Pick 4

For each unique pair of common numbers `A, B`:

- **Pick 3** (`generatePick3`): take each digit of `A` combined with `B`,
  each digit of `A` combined with reversed `B`, then the same the other way
  round with `B` and `A` swapped — 8 combinations.
- **Pick 4** (`generatePick4`): every combination of `{A, reverse(A)} x
  {B, reverse(B)}`, concatenated both orders — 8 combinations.

Both are verified against the spec's worked example: `81 & 91` ->
Pick 3 `891 191 819 119 981 181 918 118`, Pick 4 `8191 8119 1891 1819 9181
9118 1981 1918`.

Results across all common pairs are combined and de-duplicated with
`dedupePreserveOrder()`, which keeps first-seen order (not sorted).

## File structure

```
src/
  lib/
    core.ts        # pure algorithm: normalizePair, reversePair, shiftDigit,
                    # shiftNumber, generateRowsFromSeed, findCommonNumbers,
                    # generatePick3, generatePick4, dedupePreserveOrder,
                    # runDGTchek, parseInput, formatResult
    database.ts     # builds the full 00-99 db from seeds + localStorage
                    # custom seeds; parseSeedText for the admin form
    recents.ts      # recent-searches persistence (localStorage)
  data/
    seeds.ts        # the 6 built-in seed rows (see table above)
  components/
    InputForm.tsx       # number entry, validation, Check/Clear
    ResultDisplay.tsx   # copy-friendly result block
    RecentSearches.tsx  # tappable recent-search chips
    AdminPanel.tsx      # seed coverage, add missing seeds, row inspector
  App.tsx           # app shell / view switching
public/
  icon-*.png, apple-touch-icon.png, favicon.png
vite.config.ts      # vite-plugin-pwa: manifest + service worker config
```

## Data persisted on-device (localStorage, no backend)

- `dgtchek:recent-searches` — last 20 searches
- `dgtchek:custom-seeds` — any seed rows you add via the Admin panel

## PWA

- Installable (manifest + icons, `display: standalone`)
- Offline-capable (service worker via `vite-plugin-pwa`, precaches the app
  shell, `NetworkFirst` for navigations so you always get the latest build
  when online and the cached shell when offline)
- Works on iOS "Add to Home Screen" and Android/desktop install prompts

## A note on the top-of-spec example

The illustrative output block in the spec (`00 90` -> `COMMON 81 91 98`)
doesn't include `11`, even though `11` legitimately appears in both `00`'s
and `90`'s lists and matches under the mirror rule. The app includes it,
since the detailed Pick 3 / Pick 4 rules and worked example (`81 & 91`)
match the implemented algorithm exactly — the top block reads as a rough
formatting mockup rather than an exact reference case.
