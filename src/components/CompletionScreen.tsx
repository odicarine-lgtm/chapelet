import { Flame, Layers, RotateCcw, Sparkles } from 'lucide-react';
import { PRAYERS, type Lang, type PrayerId } from '../data/prayers';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  name: string;
  latin: string;
  closing: PrayerId[];
  lang: Lang;
  streak: number;
  total: number;
  intention?: string;
  onRestart: () => void;
  onAnother: () => void;
  onClose: () => void;
}

export function CompletionScreen({ open, name, latin, closing, lang, streak, total, intention, onRestart, onAnother, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Chapelet terminé" hideTitle wide>
      <div className="relative overflow-hidden text-center" role="status">
        <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 w-64 animate-glory rounded-full bg-gold/30 blur-3xl" aria-hidden="true" />
        <Sparkles className="relative mx-auto text-gold" size={40} aria-hidden="true" />
        <p className="relative mt-3 font-serif text-5xl font-semibold tracking-wide text-gold-deep dark:text-gold">TERMINÉ !</p>
        <p className="relative mt-1 text-sm font-bold uppercase tracking-[.22em] text-night dark:text-ivory sm:text-base">
          Chapelet terminé avec succès
        </p>
        <p className="relative mt-2 font-serif text-lg italic text-night/70 dark:text-ivory/70">
          {name} — {latin}
        </p>
        {intention && (
          <p className="relative mx-auto mt-2 max-w-md text-sm text-night/70 dark:text-ivory/70">
            Offert pour : <span className="font-medium">{intention}</span>
          </p>
        )}

        <div className="relative mt-4 flex justify-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1">
            <Layers size={14} aria-hidden="true" /> {total} chapelet{total > 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cardinal/10 px-3 py-1 text-cardinal dark:text-rose-300">
            <Flame size={14} aria-hidden="true" /> {streak} jour{streak > 1 ? 's' : ''} de suite
          </span>
        </div>

        <section className="relative mt-6 rounded-2xl bg-parchment/70 p-5 text-left dark:bg-night/60">
          {closing.map((id, i) => (
            <div key={id} className={i > 0 ? 'mt-5' : ''}>
              <h3 className="eyebrow">{PRAYERS[id].title[lang]}</h3>
              <p className={`mt-2 whitespace-pre-line font-serif text-lg leading-relaxed ${i === closing.length - 1 ? 'italic' : ''}`}>{PRAYERS[id].text[lang]}</p>
            </div>
          ))}
          <p className="mt-3 text-center text-2xl text-gold" aria-hidden="true">✠</p>
        </section>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
          <button className="btn-ghost text-base" onClick={onRestart} data-autofocus>
            <RotateCcw size={18} aria-hidden="true" /> Recommencer ce Chapelet
          </button>
          <button className="btn-gold text-base" onClick={onAnother}>
            <Sparkles size={18} aria-hidden="true" /> Démarrer un autre Mystère
          </button>
        </div>
      </div>
    </Modal>
  );
}
