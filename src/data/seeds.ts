// Revised DG TCHÈK rows approved October 2026.
export interface Seed { key: string; list: string[]; }
export const BUILT_IN_SEEDS: Seed[] = [
  { key: "00", list: "11,12,16,18,19,29,44,49,66,89,99".split(",") },
  { key: "01", list: "02,08,09,12,13,19,22,27,28,29,39,44,49,77,99".split(",") },
  { key: "02", list: "01,09,11,12,13,14,16,18,19,23,39,66".split(",") },
  { key: "03", list: "12,14,15,19,24,28,29,44,48,49,59,99".split(",") },
  { key: "04", list: "11,12,13,15,16,23,25,29,33,38,39,58,59,66,69,88".split(",") },
  { key: "05", list: "11,13,14,16,17,24,26,39,44,48,49,66,68,69,79,99".split(",") },
];
