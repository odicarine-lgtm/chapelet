import { useState, type FormEvent, type ReactNode } from 'react';
import { CalendarDays, Check, Flame, Heart, Layers, Plus, Trash2, Trophy } from 'lucide-react';
import { getSet } from '../data/mysteries';
import { bestStreak, currentStreak, dayKey, type Stats } from '../lib/stats';
import { Modal } from './Modal';

export interface Intention {
  id: string;
  text: string;
  createdAt: string;
  answered: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  stats: Stats;
  intentions: Intention[];
  selectedIntentionId: string | null;
  onAddIntention: (text: string) => void;
  onToggleAnswered: (id: string) => void;
  onDeleteIntention: (id: string) => void;
  onSelectIntention: (id: string | null) => void;
}

type Tab = 'stats' | 'intentions' | 'history';

const fmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

export function Journal(props: Props) {
  const { open, onClose, stats, intentions } = props;
  const [tab, setTab] = useState<Tab>('stats');
  const [draft, setDraft] = useState('');

  const streak = currentStreak(stats.activeDays);
  const best = bestStreak(stats.activeDays);

  // 4 dernières semaines pour le calendrier de fidélité
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return { key: dayKey(d), label: d.getDate() };
  });
  const active = new Set(stats.activeDays);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t) return;
    props.onAddIntention(t);
    setDraft('');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'stats', label: 'Statistiques' },
    { id: 'intentions', label: 'Intentions' },
    { id: 'history', label: 'Historique' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Journal de prière" wide>
      <div role="tablist" aria-label="Sections du journal" className="mb-5 grid grid-cols-3 gap-1 rounded-full bg-parchment/70 p-1 dark:bg-night/60">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-11 rounded-full text-sm font-medium transition ${tab === t.id ? 'bg-gold text-night shadow' : 'text-night/70 dark:text-ivory/70'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stats' && (
        <div role="tabpanel" className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={<Layers size={18} />} value={stats.totalRosaries} label="Chapelets terminés" />
            <Stat icon={<CalendarDays size={18} />} value={stats.totalDecades} label="Dizaines récitées" />
            <Stat icon={<Flame size={18} />} value={streak} label="Jours consécutifs" accent />
            <Stat icon={<Trophy size={18} />} value={best} label="Meilleure série" />
          </div>
          <div>
            <h3 className="eyebrow mb-2">Fidélité — 28 derniers jours</h3>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((d) => (
                <div
                  key={d.key}
                  title={d.key}
                  aria-label={`${d.key} : ${active.has(d.key) ? 'prière' : 'pas de prière'}`}
                  className={`flex aspect-square items-center justify-center rounded-lg text-xs ${
                    active.has(d.key) ? 'bg-gold font-semibold text-night' : 'bg-parchment/60 text-night/40 dark:bg-night/60 dark:text-ivory/30'
                  } ${d.key === dayKey() ? 'ring-2 ring-gold-deep dark:ring-gold-light' : ''}`}
                >
                  {d.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'intentions' && (
        <div role="tabpanel" className="space-y-4">
          <form onSubmit={submit} className="flex gap-2">
            <label htmlFor="intention" className="sr-only">
              Nouvelle intention
            </label>
            <input
              id="intention"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Pour qui, pour quoi prier ?"
              maxLength={200}
              className="min-h-11 flex-1 rounded-full border border-gold/40 bg-white px-4 text-sm placeholder:text-night/40 dark:bg-night dark:placeholder:text-ivory/40"
            />
            <button className="btn-gold" type="submit" aria-label="Ajouter l’intention">
              <Plus size={18} aria-hidden="true" />
            </button>
          </form>
          {intentions.length === 0 ? (
            <p className="py-6 text-center font-serif text-lg italic text-night/60 dark:text-ivory/60">
              « Demandez, on vous donnera. » — Mt 7, 7
            </p>
          ) : (
            <ul className="space-y-2">
              {intentions.map((it) => {
                const selected = props.selectedIntentionId === it.id;
                return (
                  <li
                    key={it.id}
                    className={`flex items-center gap-2 rounded-2xl border p-2 pl-4 ${selected ? 'border-gold bg-gold/10' : 'border-gold/20'}`}
                  >
                    <span className={`flex-1 text-sm ${it.answered ? 'text-night/50 line-through dark:text-ivory/50' : ''}`}>{it.text}</span>
                    <button
                      className={`icon-btn ${selected ? 'text-cardinal dark:text-rose-300' : ''}`}
                      onClick={() => props.onSelectIntention(selected ? null : it.id)}
                      aria-pressed={selected}
                      aria-label={selected ? 'Ne plus associer au chapelet en cours' : 'Associer au chapelet en cours'}
                      title="Associer au chapelet en cours"
                    >
                      <Heart size={18} fill={selected ? 'currentColor' : 'none'} aria-hidden="true" />
                    </button>
                    <button
                      className={`icon-btn ${it.answered ? 'text-emerald-700 dark:text-emerald-400' : ''}`}
                      onClick={() => props.onToggleAnswered(it.id)}
                      aria-pressed={it.answered}
                      aria-label={it.answered ? 'Marquer comme non exaucée' : 'Marquer comme exaucée'}
                      title="Exaucée"
                    >
                      <Check size={18} aria-hidden="true" />
                    </button>
                    <button className="icon-btn" onClick={() => props.onDeleteIntention(it.id)} aria-label="Supprimer l’intention">
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div role="tabpanel">
          {stats.history.length === 0 ? (
            <p className="py-6 text-center text-sm text-night/60 dark:text-ivory/60">Aucun chapelet terminé pour l’instant.</p>
          ) : (
            <ul className="divide-y divide-gold/15">
              {[...stats.history].reverse().slice(0, 60).map((h) => (
                <li key={h.id} className="py-3">
                  <p className="font-serif text-lg font-semibold">{getSet(h.setId).name}</p>
                  <p className="text-xs capitalize text-night/60 dark:text-ivory/60">{fmt.format(new Date(h.date))}</p>
                  {h.intention && <p className="mt-1 text-sm italic">Intention : {h.intention}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}

function Stat({ icon, value, label, accent }: { icon: ReactNode; value: number; label: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-parchment/70 p-4 text-center dark:bg-night/60">
      <div className={`mx-auto mb-1 w-fit ${accent ? 'text-cardinal dark:text-rose-300' : 'text-gold-deep dark:text-gold'}`} aria-hidden="true">
        {icon}
      </div>
      <p className="font-serif text-3xl font-semibold">{value}</p>
      <p className="text-xs text-night/70 dark:text-ivory/70">{label}</p>
    </div>
  );
}
