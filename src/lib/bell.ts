// Cloche d'église synthétisée (Web Audio) : aucun fichier audio, fonctionne hors-ligne.
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// Partiels inharmoniques typiques d'une cloche (hum, prime, tierce, quinte, nominal).
const PARTIALS = [
  { r: 0.5, a: 0.35 },
  { r: 1, a: 1 },
  { r: 1.19, a: 0.45 },
  { r: 1.5, a: 0.3 },
  { r: 2, a: 0.5 },
  { r: 2.74, a: 0.22 },
  { r: 3.76, a: 0.12 },
];

export type BellKind = 'soft' | 'gloria' | 'decade' | 'complete';

const SETTINGS: Record<BellKind, { freq: number; vol: number; decay: number; strikes: number }> = {
  soft: { freq: 1046, vol: 0.035, decay: 0.9, strikes: 1 },
  gloria: { freq: 659, vol: 0.09, decay: 2.6, strikes: 1 },
  decade: { freq: 523, vol: 0.12, decay: 3.4, strikes: 1 },
  complete: { freq: 392, vol: 0.14, decay: 4.5, strikes: 3 },
};

export function ringBell(kind: BellKind = 'soft') {
  const c = getCtx();
  if (!c) return;
  const { freq, vol, decay, strikes } = SETTINGS[kind];
  const master = c.createGain();
  master.gain.value = vol;
  master.connect(c.destination);
  for (let s = 0; s < strikes; s++) {
    const t0 = c.currentTime + s * 0.9;
    PARTIALS.forEach(({ r, a }, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * r;
      const d = decay / (1 + i * 0.35);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(a, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      osc.connect(g).connect(master);
      osc.start(t0);
      osc.stop(t0 + d + 0.05);
    });
  }
}
