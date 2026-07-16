export interface RecentSearch {
  id: string;
  input1: string;
  input2: string;
  commonCount: number;
  timestamp: number;
}

const RECENTS_KEY = "dgtchek:recent-searches";
const MAX_RECENTS = 20;

export function loadRecents(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecent(input1: string, input2: string, commonCount: number): RecentSearch[] {
  const existing = loadRecents().filter((r) => !(r.input1 === input1 && r.input2 === input2));
  const entry: RecentSearch = {
    id: `${input1}-${input2}-${Date.now()}`,
    input1,
    input2,
    commonCount,
    timestamp: Date.now(),
  };
  const updated = [entry, ...existing].slice(0, MAX_RECENTS);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
  return updated;
}

export function clearRecents(): void {
  localStorage.removeItem(RECENTS_KEY);
}
