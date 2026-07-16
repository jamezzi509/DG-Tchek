// ─────────────────────────────────────────────────────────────────────────
// DG TCHEK core logic
//
// Everything here is pure/testable and has no UI or storage dependencies.
// See README.md for the plain-English explanation of the algorithm.
// ─────────────────────────────────────────────────────────────────────────

export type Pair = string; // a 2-digit numeric string, e.g. "45"
export type Database = Record<string, Pair[]>; // key "00".."99" -> list of pairs

/** True if a string is exactly two digits, e.g. "07". */
export function isValidPair(s: string): boolean {
  return /^\d{2}$/.test(s);
}

/**
 * Cleans up a single number token: trims whitespace and left-pads a lone
 * digit ("7" -> "07"). Does NOT apply the mirror rule — this just gets user
 * input into a consistent 2-digit shape before anything else touches it.
 */
export function normalizePair(raw: string): string {
  const trimmed = raw.trim();
  if (/^\d$/.test(trimmed)) return "0" + trimmed;
  return trimmed;
}

/** Reverses the two digits of a pair: "45" -> "54", "09" -> "90". */
export function reversePair(pair: Pair): Pair {
  return pair[1] + pair[0];
}

/** Shifts a single digit forward by one, wrapping 9 -> 0. */
export function shiftDigit(d: number): number {
  return (d + 1) % 10;
}

/** Applies shiftDigit to both digits of a pair: "81" -> "92". */
export function shiftNumber(pair: Pair): Pair {
  return String(shiftDigit(+pair[0])) + String(shiftDigit(+pair[1]));
}

/**
 * The heart of the "don't hardcode everything" data system.
 *
 * Every DG TCHEK number belongs to a chain of 10 keys. Shifting every digit
 * of a row's key AND every digit of every number in that row's list by +1
 * (wrapping 9->0) produces the *next* row in the chain. Applying the shift
 * ten times returns you to the seed, because shifting a digit by 1 ten
 * times is the identity operation (mod 10).
 *
 * So instead of hand-typing all 100 rows, we store one seed row per chain
 * (10 seeds cover all 100 keys) and generate the other 9 rows on the fly.
 *
 * Verified against the provided BAZ/BOUL PÈ reference data — e.g. seed
 * "02" -> [13,14,23,93,94,83,11,10,21,91,90,81] generates all 10 rows of
 * that chain (02, 13, 24, 35, 46, 57, 68, 79, 80, 91) exactly.
 */
export function generateRowsFromSeed(
  seedKey: Pair,
  seedList: Pair[],
  count = 10
): { key: Pair; list: Pair[] }[] {
  const rows: { key: Pair; list: Pair[] }[] = [];
  let key = seedKey;
  let list = seedList;
  for (let i = 0; i < count; i++) {
    rows.push({ key, list });
    key = shiftNumber(key);
    list = list.map(shiftNumber);
  }
  return rows;
}

/**
 * Two numbers are "the same" under the mirror rule if they're identical or
 * one is the digit-reversal of the other (45 = 54, 89 = 98, 02 = 20).
 */
export function isMirrorMatch(a: Pair, b: Pair): boolean {
  return a === b || a === reversePair(b);
}

/** True if both digits are the same, e.g. "55", "00" — a "double". */
export function isDouble(pair: Pair): boolean {
  return pair[0] === pair[1];
}

/**
 * Finds numbers common to both lists, treating mirror pairs as equal.
 * The returned value preserves the numbers as they appear in listA, in
 * first-seen order, de-duplicated (so 81 and its mirror 18 won't both
 * show up if both happen to match something in listB).
 */
export function findCommonNumbers(listA: Pair[], listB: Pair[]): Pair[] {
  const common: Pair[] = [];
  const seen = new Set<string>();
  for (const a of listA) {
    if (seen.has(a) || seen.has(reversePair(a))) continue;
    const hit = listB.some((b) => isMirrorMatch(a, b));
    if (hit) {
      seen.add(a);
      common.push(a);
    }
  }
  return common;
}

/**
 * Reorders a common-numbers list so "doubles" (55, 00, 44...) sort to the
 * end, keeping every other number in its original first-seen order.
 */
export function orderCommonDoublesLast(common: Pair[]): Pair[] {
  const nonDoubles = common.filter((n) => !isDouble(n));
  const doubles = common.filter(isDouble);
  return [...nonDoubles, ...doubles];
}

/**
 * Pick 3 for a pair of common numbers A, B — 4 combinations:
 *   digit0(A)+B, digit1(A)+B, digit0(B)+A, digit1(B)+A
 * (Reversed-digit variants were dropped on request — this used to also
 * include digit(A)+reverse(B) and digit(B)+reverse(A), which is why this
 * no longer matches the very first 81-and-91 worked example from earlier.)
 */
export function generatePick3(A: Pair, B: Pair): string[] {
  return [A[0] + B, A[1] + B, B[0] + A, B[1] + A];
}

/**
 * Pick 4 for a pair of common numbers A, B: every combination of
 * {A, reverse(A)} x {B, reverse(B)}, concatenated both ways round.
 * Verified against the spec example:
 *   81 & 91 -> 8191 8119 1891 1819 9181 9118 1981 1918
 */
export function generatePick4(A: Pair, B: Pair): string[] {
  const revA = reversePair(A);
  const revB = reversePair(B);
  const out: string[] = [];
  for (const X of [A, revA]) for (const Y of [B, revB]) out.push(X + Y);
  for (const X of [B, revB]) for (const Y of [A, revA]) out.push(X + Y);
  return out;
}

/** Removes duplicates while preserving the order items first appeared. */
export function dedupePreserveOrder<T>(items: T[]): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const item of items) {
    if (!seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}

/** Every unique unordered pair from a list, e.g. [a,b,c] -> [a,b] [a,c] [b,c]. */
function allPairs<T>(items: T[]): [T, T][] {
  const out: [T, T][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) out.push([items[i], items[j]]);
  }
  return out;
}

/**
 * Every pair from a common-numbers list, with any pair involving a double
 * (55, 00...) sorted after every pair that doesn't — matching the "doubles
 * generate/display last" rule for both Common and Pick 3/Pick 4.
 */
function pairsDoublesLast(common: Pair[]): [Pair, Pair][] {
  const pairs = allPairs(orderCommonDoublesLast(common));
  const withoutDouble = pairs.filter(([a, b]) => !isDouble(a) && !isDouble(b));
  const withDouble = pairs.filter(([a, b]) => isDouble(a) || isDouble(b));
  return [...withoutDouble, ...withDouble];
}

/** Parses free-text input like "45 55" into two validated 2-digit pairs. */
export function parseInput(raw: string): { ok: true; a: Pair; b: Pair } | { ok: false; error: string } {
  const parts = raw.trim().split(/\s+/).filter(Boolean).map(normalizePair);
  if (parts.length !== 2) {
    return { ok: false, error: "Enter exactly two numbers, e.g. \"45 55\"." };
  }
  const [a, b] = parts;
  if (!isValidPair(a) || !isValidPair(b)) {
    return { ok: false, error: "Each number must be two digits, e.g. \"07\" or \"45\"." };
  }
  return { ok: true, a, b };
}

export interface DgTchekResult {
  input1: Pair;
  input2: Pair;
  list1: Pair[];
  list2: Pair[];
  common: Pair[];
  pick3: string[];
  pick4: string[];
}

/**
 * Runs the full DG TCHEK pipeline for two raw 2-digit inputs against a
 * database (see database.ts for how the database itself is generated).
 */
export function runDGTchek(input1: Pair, input2: Pair, db: Database): DgTchekResult {
  const list1 = db[input1] ?? [];
  const list2 = db[input2] ?? [];
  const rawCommon = findCommonNumbers(list1, list2);
  const common = orderCommonDoublesLast(rawCommon);

  const p3: string[] = [];
  const p4: string[] = [];
  for (const [A, B] of pairsDoublesLast(rawCommon)) {
    p3.push(...generatePick3(A, B));
    p4.push(...generatePick4(A, B));
  }

  return {
    input1,
    input2,
    list1,
    list2,
    common,
    pick3: dedupePreserveOrder(p3),
    pick4: dedupePreserveOrder(p4),
  };
}

/** Formats a result into the clean, copy-friendly block the spec asks for. */
export function formatResult(result: DgTchekResult): string {
  const lines = [
    "DG TCHEK",
    `${result.input1} ${result.list1.join(",")}`,
    `${result.input2} ${result.list2.join(",")}`,
    `COMMON ${result.common.join(" ")}`,
    `PICK 3 ${result.pick3.join(" ")}`,
    `PICK 4 ${result.pick4.join(" ")}`,
  ];
  return lines.join("\n");
}
