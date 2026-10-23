import type { PrayerId } from './prayers';

export type DevotionId = 'rosaire' | 'misericorde';

/**
 * Une dévotion est une suite de segments. Les dizaines portent les numéros 0 à 4 ;
 * l'ouverture est le segment -1 et la conclusion le segment 5.
 */
export const INTRO = -1;
export const OUTRO = 5;
export const DECADES = 5;

interface Segment {
  decade: number;
  steps: number;
}

export interface Position {
  decade: number;
  step: number;
}

const SEGMENTS: Record<DevotionId, Segment[]> = {
  // Rosaire : 5 × (Pater + 10 Ave + Gloria/Fatima)
  rosaire: Array.from({ length: DECADES }, (_, d) => ({ decade: d, steps: 12 })),
  // Divine Miséricorde : ouverture (croix, Pater, Ave, Credo), 5 × (Père Éternel + 10 grains), « Dieu Saint » × 3
  misericorde: [
    { decade: INTRO, steps: 4 },
    ...Array.from({ length: DECADES }, (_, d) => ({ decade: d, steps: 11 })),
    { decade: OUTRO, steps: 3 },
  ],
};

export const MERCY = {
  name: 'Chapelet de la Divine Miséricorde',
  latin: 'Corona Divinae Misericordiae',
  when: 'Vendredi · 15 h, Heure de la Miséricorde',
  source: 'Petit Journal de sainte Faustine, n° 474-476',
  intro:
    'Enseigné par Jésus à sainte Faustine Kowalska à Vilnius, en septembre 1935. Il se prie sur un chapelet ordinaire, de préférence à 15 heures, l’heure de la mort du Christ, en s’unissant à sa Passion pour implorer la miséricorde sur nous et sur le monde entier.',
  quote: '« Jésus, j’ai confiance en Toi. » — sainte Faustine',
  closing: ['finaleMisericorde', 'jesusConfiance'] as PrayerId[],
};

export function segmentsOf(dev: DevotionId): Segment[] {
  return SEGMENTS[dev];
}

export function firstPosition(dev: DevotionId): Position {
  return { decade: SEGMENTS[dev][0].decade, step: 0 };
}

export function stepsIn(dev: DevotionId, decade: number): number {
  return SEGMENTS[dev].find((s) => s.decade === decade)?.steps ?? 0;
}

/** Rang absolu de la position et nombre total de grains, pour la barre de progression. */
export function progressOf(dev: DevotionId, pos: Position): { index: number; total: number } {
  let index = 0;
  let total = 0;
  for (const s of SEGMENTS[dev]) {
    if (s.decade < pos.decade) index += s.steps;
    total += s.steps;
  }
  return { index: index + pos.step, total };
}

export function nextPosition(dev: DevotionId, pos: Position): Position | null {
  if (pos.step < stepsIn(dev, pos.decade) - 1) return { decade: pos.decade, step: pos.step + 1 };
  const segs = SEGMENTS[dev];
  const i = segs.findIndex((s) => s.decade === pos.decade);
  return i < segs.length - 1 ? { decade: segs[i + 1].decade, step: 0 } : null;
}

export function prevPosition(dev: DevotionId, pos: Position): Position | null {
  if (pos.step > 0) return { decade: pos.decade, step: pos.step - 1 };
  const segs = SEGMENTS[dev];
  const i = segs.findIndex((s) => s.decade === pos.decade);
  return i > 0 ? { decade: segs[i - 1].decade, step: segs[i - 1].steps - 1 } : null;
}

export function prayersAt(dev: DevotionId, { decade, step }: Position): PrayerId[] {
  if (dev === 'rosaire') {
    if (step === 0) return ['pater'];
    if (step === 11) return ['gloria', 'fatima'];
    return ['ave'];
  }
  if (decade === INTRO) return ([['signeCroix', 'sangEau'], ['pater'], ['ave'], ['credo']] as PrayerId[][])[step];
  if (decade === OUTRO) return ['dieuSaint'];
  return step === 0 ? ['pereEternel'] : ['parSaPassion'];
}

/** Grain à mettre en lumière sur le dessin : -1 croix, 0 gros grain, 1-10 petits grains, 11 médaille. */
export function beadAt(_dev: DevotionId, { decade, step }: Position): number {
  if (decade === INTRO) return -1;
  if (decade === OUTRO) return 11;
  return step;
}

/** Compteur affiché (ex. 3/10, 2/3), ou null pour les grains isolés. */
export function counterAt(dev: DevotionId, { decade, step }: Position): { n: number; of: number } | null {
  if (decade === OUTRO) return { n: step + 1, of: 3 };
  if (decade >= 0 && decade < DECADES && step >= 1 && step <= 10) return { n: step, of: 10 };
  void dev;
  return null;
}

/** Libellé court au centre du chapelet. */
export function centerLabelAt(dev: DevotionId, pos: Position): string {
  const c = counterAt(dev, pos);
  if (c) return `${c.n}/${c.of}`;
  if (dev === 'rosaire') return pos.step === 0 ? 'Pater' : 'Gloria';
  if (pos.decade === INTRO) return ['✠', 'Pater', 'Ave', 'Credo'][pos.step];
  return 'Offrande';
}

export function segmentLabel(decade: number): string {
  if (decade === INTRO) return 'Ouverture';
  if (decade === OUTRO) return 'Conclusion';
  return `Dizaine ${decade + 1}/${DECADES}`;
}
