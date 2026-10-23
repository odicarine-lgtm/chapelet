import { CalendarHeart, Clock3, Play } from 'lucide-react';
import { MERCY } from '../data/devotions';
import { MYSTERY_SETS, getSetForDate, type MysterySetId } from '../data/mysteries';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (id: MysterySetId) => void;
  onPickMercy: () => void;
  currentId?: MysterySetId | 'misericorde';
}

const ACCENT: Record<MysterySetId, string> = {
  joyeux: 'from-sky-200/60 to-ivory dark:from-sky-900/40 dark:to-night-800',
  lumineux: 'from-amber-200/70 to-ivory dark:from-amber-800/30 dark:to-night-800',
  douloureux: 'from-rose-200/60 to-ivory dark:from-cardinal/35 dark:to-night-800',
  glorieux: 'from-yellow-100 to-ivory dark:from-gold/25 dark:to-night-800',
};

export function MysteryPicker({ open, onClose, onPick, onPickMercy, currentId }: Props) {
  const today = getSetForDate();
  const sets = [today, ...MYSTERY_SETS.filter((s) => s.id !== today.id)];
  return (
    <Modal open={open} onClose={onClose} title="Démarrer un Mystère" wide>
      <h3 className="eyebrow mb-3">Saint Rosaire</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {sets.map((s, idx) => (
          <button
            key={s.id}
            data-autofocus={idx === 0 ? true : undefined}
            onClick={() => onPick(s.id)}
            className={`group relative flex flex-col rounded-2xl border bg-gradient-to-br p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${ACCENT[s.id]} ${
              s.id === today.id ? 'border-gold shadow-md shadow-gold/20' : 'border-gold/25'
            }`}
          >
            {s.id === today.id && (
              <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-night">
                <CalendarHeart size={12} aria-hidden="true" /> Mystère du jour
              </span>
            )}
            <span className="font-serif text-2xl font-semibold">{s.name}</span>
            <span className="font-serif text-sm italic text-night/60 dark:text-ivory/60">{s.latin}</span>
            <span className="eyebrow mt-1">{s.daysLabel}</span>
            <ol className="mt-3 space-y-0.5 text-sm text-night/80 dark:text-ivory/80">
              {s.mysteries.map((m, i) => (
                <li key={i}>
                  <span className="text-gold-deep dark:text-gold">{i + 1}.</span> {m.title}
                </li>
              ))}
            </ol>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep group-hover:underline dark:text-gold">
              <Play size={14} aria-hidden="true" /> {currentId === s.id ? 'Recommencer' : 'Commencer'}
            </span>
          </button>
        ))}
      </div>

      <h3 className="eyebrow mb-3 mt-6">Autres chapelets</h3>
      <button
        onClick={onPickMercy}
        className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-rose-100/70 via-ivory to-sky-100/70 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:from-cardinal/30 dark:via-night-800 dark:to-sky-900/40"
      >
        <span className="font-serif text-2xl font-semibold">{MERCY.name}</span>
        <span className="font-serif text-sm italic text-night/60 dark:text-ivory/60">{MERCY.latin}</span>
        <span className="eyebrow mt-1 inline-flex items-center gap-1">
          <Clock3 size={12} aria-hidden="true" /> {MERCY.when}
        </span>
        <span className="mt-3 text-sm text-night/80 dark:text-ivory/80">
          Ouverture (signe de croix, Notre Père, Je vous salue Marie, Credo) · 5 dizaines « Père Éternel » / « Par sa douloureuse Passion » · « Dieu Saint » × 3
        </span>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep group-hover:underline dark:text-gold">
          <Play size={14} aria-hidden="true" /> {currentId === 'misericorde' ? 'Recommencer' : 'Commencer'}
        </span>
      </button>
    </Modal>
  );
}
