export type HapticKind = 'bead' | 'gloria' | 'decade' | 'complete';

const PATTERNS: Record<HapticKind, number | number[]> = {
  bead: 12,
  gloria: [35, 45, 35],
  decade: [60, 60, 60],
  complete: [80, 60, 80, 60, 180],
};

export function vibrate(kind: HapticKind) {
  try {
    if ('vibrate' in navigator) navigator.vibrate(PATTERNS[kind]);
  } catch {
    /* non supporté */
  }
}
