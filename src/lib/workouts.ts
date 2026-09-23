import { dedupePreserveOrder, findCommonNumbers, isValidPair, reversePair } from "./core";

/** Adjacent sums, keeping units (11 -> 1, never 2). */
export function pyramidRows(digits: number[]): number[][] {
  if (!digits.length || digits.some(d => !Number.isInteger(d) || d < 0 || d > 9)) {
    throw new Error("Chak chif dwe ant 0 ak 9.");
  }
  const rows = [[...digits]];
  while (rows.at(-1)!.length > 1) {
    const row = rows.at(-1)!;
    rows.push(row.slice(0, -1).map((digit, i) => (digit + row[i + 1]) % 10));
  }
  return rows;
}

export function isValidDate(date: string): boolean {
  if (!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
}

export function previousDate(date: string): string {
  if (!isValidDate(date)) throw new Error("Dat la pa valab.");
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function newYorkToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Same date-based variant as the historical backtest (loteriadela1.com). */
export function calculatePyramid(date: string) {
  if (!isValidDate(date)) throw new Error("Dat la pa valab.");
  const [year, month, day] = date.split("-").map(Number);
  const base = [...`${day}${month}${year}`].map(Number);
  const rows = pyramidRows(base);
  const apex = rows.at(-1)![0];
  const penultimate = rows.at(-2)!;
  const middle = Math.floor(base.length / 2);
  const candidates = [
    `${apex}${penultimate[0]}`, `${apex}${penultimate[1]}`,
    `${base[0]}${base.at(-1)}`, `${base[middle - 1]}${base[middle]}`,
    `${base[0]}${rows[1][0]}`, `${base.at(-1)}${rows[1].at(-1)}`,
    String(day).padStart(2, "0"),
  ];
  // Exact duplicates only here: reverse matching happens AFTER the six-slot rule.
  return { date, rows, apex, numbers: dedupePreserveOrder(candidates).slice(0, 6) };
}

/**
 * Reconstructed behavior of the public GYD calculator, verified against 180
 * archived and 16 newly requested cases. Not the provider's private source.
 * Keep input order and leading zeros. No +5 mirrors or fake-double conversion.
 */
export function calculateGyd(prizes: [string, string, string]) {
  if (!prizes.every(isValidPair)) throw new Error("Antre 3 lo, chak ak 2 chif (00–99).");
  const rows = pyramidRows([...prizes.join("")].map(Number));
  const top = rows.at(-1)![0];
  const [a, b] = rows.at(-2)!;
  const left = (a + top) % 10;
  const right = (b + top) % 10;
  const bottom = (left + right) % 10;
  const rawNumbers = [
    `${left}${right}`, `${right}${right}`, `${right}${left}`, `${left}${left}`,
    `${top}${right}`, `${right}${bottom}`, `${bottom}${left}`, `${left}${top}`,
  ];
  return { prizes: [...prizes], rows, cross: { top, left, right, bottom }, rawNumbers,
    numbers: dedupePreserveOrder(rawNumbers) };
}

export function pairFamily(pair: string): string {
  if (!isValidPair(pair)) throw new Error("Boul la dwe gen 2 chif.");
  return pair < reversePair(pair) ? pair : reversePair(pair);
}

export function uniqueFamilies(numbers: string[]): string[] {
  const seen = new Set<string>();
  return numbers.filter(pair => {
    const key = pairFamily(pair);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function compareWorkouts(tchek: string[], pyramid: string[], gyd: string[]) {
  const tchekPyramid = findCommonNumbers(tchek, pyramid);
  const tchekGyd = findCommonNumbers(tchek, gyd);
  return { tchekPyramid, tchekGyd, allThree: findCommonNumbers(tchekPyramid, gyd) };
}
