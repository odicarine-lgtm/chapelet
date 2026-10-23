import type { MysterySetId } from '../data/mysteries';
import type { DevotionId } from '../data/devotions';

export interface HistoryEntry {
  id: string;
  date: string; // ISO
  setId: MysterySetId;
  devotion?: DevotionId; // absent = rosaire (entrées antérieures)
  intention?: string;
}

export interface Stats {
  totalDecades: number;
  totalRosaries: number;
  activeDays: string[]; // AAAA-MM-JJ (heure locale)
  history: HistoryEntry[];
}

export const EMPTY_STATS: Stats = { totalDecades: 0, totalRosaries: 0, activeDays: [], history: [] };

export function dayKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${j}`;
}

function shift(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + days));
}

export function withActiveToday(days: string[]): string[] {
  const k = dayKey();
  return days.includes(k) ? days : [...days, k].slice(-1000);
}

/** Série en cours : jours consécutifs se terminant aujourd'hui (ou hier, si l'on n'a pas encore prié aujourd'hui). */
export function currentStreak(days: string[]): number {
  const set = new Set(days);
  let cursor = dayKey();
  if (!set.has(cursor)) cursor = shift(cursor, -1);
  let n = 0;
  while (set.has(cursor)) {
    n++;
    cursor = shift(cursor, -1);
  }
  return n;
}

export function bestStreak(days: string[]): number {
  const sorted = [...new Set(days)].sort();
  let best = 0;
  let run = 0;
  let prev = '';
  for (const k of sorted) {
    run = prev && shift(prev, 1) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return best;
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
