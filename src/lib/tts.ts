import type { Lang } from '../data/prayers';

export const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

let token = 0;
// Référence conservée : évite que Chrome ne libère l'énoncé avant l'événement « end ».
let current: SpeechSynthesisUtterance | null = null;

function pickVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  // Pas de voix latine dans les navigateurs : la prononciation italienne est la plus proche du latin ecclésiastique.
  const prefixes = lang === 'la' ? ['la', 'it'] : ['fr'];
  for (const p of prefixes) {
    const v = voices.find((x) => x.lang.toLowerCase().startsWith(p));
    if (v) return v;
  }
  return undefined;
}

export function speak(text: string, lang: Lang, onEnd: () => void) {
  if (!ttsSupported) return;
  const synth = window.speechSynthesis;
  const my = ++token;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[℣℟]\.?/g, '').replace(/\n/g, ' '));
  const voice = pickVoice(lang);
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? (lang === 'la' ? 'it-IT' : 'fr-FR');
  u.rate = 0.9;
  u.pitch = 1;
  u.onend = () => {
    if (my === token) onEnd();
  };
  current = u;
  synth.speak(u);
}

export function stopSpeaking() {
  if (!ttsSupported) return;
  token++;
  current = null;
  window.speechSynthesis.cancel();
}

export function isSpeaking() {
  return current !== null;
}
