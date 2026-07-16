// ─────────────────────────────────────────────────────────────────────────
// Seed data for DG TCHEK.
//
// Only ONE row per chain is stored here. The other 9 rows in each chain are
// produced at runtime by generateRowsFromSeed() (see lib/core.ts), which
// shifts every digit +1 (wrapping 9->0). This has been verified to exactly
// reproduce every full chain supplied in the spec (GROUP 00-05 / BAZ 1-5 /
// BOUL PÈ).
//
// Chains cover keys by their key's digit-pair "family":
//   seed 00 -> chain {00,11,22,33,44,55,66,77,88,99}
//   seed 01 -> chain {01,12,23,34,45,56,67,78,89,90}
//   seed 02 -> chain {02,13,24,35,46,57,68,79,80,91}
//   seed 03 -> chain {03,14,25,36,47,58,69,70,81,92}
//   seed 04 -> chain {04,15,26,37,48,59,60,71,82,93}
//   seed 05 -> chain {05,16,27,38,49,50,61,72,83,94}
//   seed 06 -> chain {06,17,28,39,40,51,62,73,84,95}  (not yet seeded)
//   seed 07 -> chain {07,18,29,30,41,52,63,74,85,96}  (not yet seeded)
//   seed 08 -> chain {08,19,20,31,42,53,64,75,86,97}  (not yet seeded)
//   seed 09 -> chain {09,10,21,32,43,54,65,76,87,98}  (not yet seeded)
//
// Use the in-app Admin panel to paste in the missing seed rows (06-09) —
// they'll be saved locally and merged in automatically.
// ─────────────────────────────────────────────────────────────────────────

export interface Seed {
  key: string;
  list: string[];
}

export const BUILT_IN_SEEDS: Seed[] = [
  { key: "00", list: "11,12,91,92,81,99,98".split(",") },
  { key: "01", list: "12,13,92,93,82,90,99,80,19,20,22".split(",") },
  { key: "02", list: "13,14,23,93,94,83,11,10,21,91,90,81".split(",") },
  { key: "03", list: "14,15,24,94,95,12,11,22,92,91,82,84".split(",") },
  { key: "04", list: "15,16,25,95,96,85,13,12,23,93,92,83".split(",") },
  { key: "05", list: "16,17,26,96,97,86,14,13,24,94,93,84".split(",") },
];
