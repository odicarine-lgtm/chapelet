import { BookOpen, Sprout } from 'lucide-react';
import { ORDINALS, type MysterySet } from '../data/mysteries';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  set: MysterySet;
  decade: number;
  onContinue: () => void;
}

export function TransitionModal({ open, set, decade, onContinue }: Props) {
  const m = set.mysteries[decade];
  return (
    <Modal open={open} onClose={onContinue} title={`${ORDINALS[decade]} mystère`} hideTitle>
      <div className="text-center">
        <p className="eyebrow">
          {set.name} · {ORDINALS[decade]} mystère
        </p>
        <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight">{m.title}</h2>
        <div className="mx-auto my-4 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
        <p className="font-serif text-xl italic leading-relaxed text-night/85 dark:text-ivory/85">{m.meditation}</p>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-left text-sm">
          <div className="rounded-2xl bg-parchment/70 p-3 dark:bg-night/60">
            <dt className="flex items-center gap-1.5 font-semibold text-gold-deep dark:text-gold">
              <Sprout size={15} aria-hidden="true" /> Fruit du mystère
            </dt>
            <dd className="mt-1">{m.fruit}</dd>
          </div>
          <div className="rounded-2xl bg-parchment/70 p-3 dark:bg-night/60">
            <dt className="flex items-center gap-1.5 font-semibold text-gold-deep dark:text-gold">
              <BookOpen size={15} aria-hidden="true" /> Écriture
            </dt>
            <dd className="mt-1">{m.reference}</dd>
          </div>
        </dl>
        <button className="btn-gold mt-6 w-full text-base" onClick={onContinue} data-autofocus>
          Commencer la dizaine {decade + 1}
        </button>
      </div>
    </Modal>
  );
}
