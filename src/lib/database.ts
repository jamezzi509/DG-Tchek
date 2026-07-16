import { generateRowsFromSeed, reversePair, type Database } from "./core";
import { BUILT_IN_SEEDS, type Seed } from "../data/seeds";

const CUSTOM_SEEDS_KEY = "dgtchek:custom-seeds";

export function loadCustomSeeds(): Seed[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SEEDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveCustomSeeds(seeds: Seed[]): void {
  localStorage.setItem(CUSTOM_SEEDS_KEY, JSON.stringify(seeds));
}

export function addCustomSeed(seed: Seed): Seed[] {
  const existing = loadCustomSeeds().filter((s) => s.key !== seed.key);
  const updated = [...existing, seed];
  saveCustomSeeds(updated);
  return updated;
}

export function removeCustomSeed(key: string): Seed[] {
  const updated = loadCustomSeeds().filter((s) => s.key !== key);
  saveCustomSeeds(updated);
  return updated;
}

/** Parses "01=12,13,92,93" style text into a Seed. */
export function parseSeedText(text: string): { ok: true; seed: Seed } | { ok: false; error: string } {
  const trimmed = text.trim();
  const match = trimmed.match(/^(\d{2})\s*=\s*(.+)$/);
  if (!match) {
    return { ok: false, error: 'Use the format "01=12,13,92,93,..." (2-digit key, then =, then a comma list).' };
  }
  const key = match[1];
  const list = match[2]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length === 0 || !list.every((n) => /^\d{2}$/.test(n))) {
    return { ok: false, error: "Every value in the list must be a 2-digit number." };
  }
  return { ok: true, seed: { key, list } };
}

export interface DatabaseInfo {
  db: Database;
  directKeys: Set<string>; // keys with data from an actual seed chain
  mirroredKeys: Set<string>; // keys filled by aliasing their mirror's data (07 <- 70)
  seedSources: { key: string; builtIn: boolean }[];
}

/**
 * Builds the full 00-99 database, expanding every seed into its 10-row chain,
 * then fills any still-empty key from its mirror's data — because 07 and 70
 * are the same boul under the mirror rule, not two different ones.
 *
 * This is why only 6 seed chains (00-05) are needed to cover all 100 keys:
 * chain 09 is exactly the mirror of chain 01, chain 08 mirrors chain 02,
 * chain 07 mirrors chain 03, chain 06 mirrors chain 04, and chains 00/05
 * are each their own mirror. Verified digit-for-digit against the shift
 * chains built from the seeds.
 */
export function buildDatabase(): DatabaseInfo {
  const db: Database = {};
  for (let i = 0; i < 100; i++) db[String(i).padStart(2, "0")] = [];

  const directKeys = new Set<string>();
  const seedSources: { key: string; builtIn: boolean }[] = [];

  const customSeeds = loadCustomSeeds();
  const customKeys = new Set(customSeeds.map((s) => s.key));

  for (const seed of BUILT_IN_SEEDS) {
    if (customKeys.has(seed.key)) continue; // custom overrides built-in with same key
    seedSources.push({ key: seed.key, builtIn: true });
    for (const row of generateRowsFromSeed(seed.key, seed.list)) {
      db[row.key] = row.list;
      directKeys.add(row.key);
    }
  }

  for (const seed of customSeeds) {
    seedSources.push({ key: seed.key, builtIn: false });
    for (const row of generateRowsFromSeed(seed.key, seed.list)) {
      db[row.key] = row.list;
      directKeys.add(row.key);
    }
  }

  // Mirror-alias pass: 07 and 70 are the same boul, so if one side has data
  // and the other doesn't, they share it.
  const mirroredKeys = new Set<string>();
  for (const key of Object.keys(db)) {
    if (db[key].length > 0) continue;
    const mirror = reversePair(key);
    if (db[mirror] && db[mirror].length > 0) {
      db[key] = db[mirror];
      mirroredKeys.add(key);
    }
  }

  return { db, directKeys, mirroredKeys, seedSources };
}
