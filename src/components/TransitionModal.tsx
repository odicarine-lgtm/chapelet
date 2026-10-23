import type { ReactNode } from 'react';
import { Modal } from './Modal';

export interface Fact {
  icon: ReactNode;
  label: string;
  value: string;
}

interface Props {
  open: boolean;
  eyebrow: string;
  title: string;
  body: string;
  facts: Fact[];
  button: string;
  onContinue: () => void;
}

export function TransitionModal({ open, eyebrow, title, body, facts, button, onContinue }: Props) {
  return (
    <Modal open={open} onClose={onContinue} title={title} hideTitle>
      <div className="text-center">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight">{title}</h2>
        <div className="mx-auto my-4 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
        <p className="font-serif text-xl italic leading-relaxed text-night/85 dark:text-ivory/85">{body}</p>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-left text-sm">
          {facts.map((f) => (
            <div key={f.label} className="rounded-2xl bg-parchment/70 p-3 dark:bg-night/60">
              <dt className="flex items-center gap-1.5 font-semibold text-gold-deep dark:text-gold">
                <span aria-hidden="true">{f.icon}</span> {f.label}
              </dt>
              <dd className="mt-1">{f.value}</dd>
            </div>
          ))}
        </dl>
        <button className="btn-gold mt-6 w-full text-base" onClick={onContinue} data-autofocus>
          {button}
        </button>
      </div>
    </Modal>
  );
}
