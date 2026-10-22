import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';
import {
  Bell,
  BellOff,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Cross,
  Heart,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Sprout,
  Sun,
  Vibrate,
  VibrateOff,
} from 'lucide-react';
import { ORDINALS, getSet, getSetForDate, type MysterySetId } from './data/mysteries';
import { PRAYERS, prayersForStep, type Lang } from './data/prayers';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ringBell } from './lib/bell';
import { vibrate, type HapticKind } from './lib/haptics';
import { speak, stopSpeaking, ttsSupported } from './lib/tts';
import { EMPTY_STATS, currentStreak, uid, withActiveToday, type Stats } from './lib/stats';
import { RosaryBeads } from './components/RosaryBeads';
import { MysteryPicker } from './components/MysteryPicker';
import { TransitionModal } from './components/TransitionModal';
import { CompletionScreen } from './components/CompletionScreen';
import { Journal, type Intention } from './components/Journal';
import { Modal } from './components/Modal';

type Phase = 'idle' | 'praying' | 'done';

interface Session {
  setId: MysterySetId;
  decade: number; // 0-4
  step: number; // 0 = Pater, 1-10 = Ave, 11 = Gloria + Fatima
  phase: Phase;
  counted: number[]; // dizaines déjà comptabilisées dans les statistiques
  intentionId: string | null;
}

interface Prefs {
  lang: Lang;
  sound: boolean;
  haptics: boolean;
  theme: 'light' | 'dark';
}

const STEPS = 12;
const DECADES = 5;

const freshSession = (setId: MysterySetId, intentionId: string | null = null): Session => ({
  setId,
  decade: 0,
  step: 0,
  phase: 'praying',
  counted: [],
  intentionId,
});

const todayLabel = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

export default function App() {
  const [prefs, setPrefs] = useLocalStorage<Prefs>('chapelet.prefs', () => ({
    lang: 'fr',
    sound: true,
    haptics: true,
    theme: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  }));
  const [session, setSession] = useLocalStorage<Session>('chapelet.session', () => ({
    ...freshSession(getSetForDate().id),
    phase: 'idle',
  }));
  const [stats, setStats] = useLocalStorage<Stats>('chapelet.stats', EMPTY_STATS);
  const [intentions, setIntentions] = useLocalStorage<Intention[]>('chapelet.intentions', []);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [transition, setTransition] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);
  const [tts, setTts] = useState(false);

  const set = getSet(session.setId);
  const mystery = set.mysteries[session.decade];
  const todaySet = getSetForDate();
  const intention = intentions.find((i) => i.id === session.intentionId);
  const streak = currentStreak(stats.activeDays);
  const anyModal = pickerOpen || journalOpen || confirmReset || transition || session.phase === 'done';

  // Thème
  useEffect(() => {
    const dark = prefs.theme === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0F172A' : '#FDFBF7');
  }, [prefs.theme]);

  const feedback = useCallback(
    (kind: HapticKind) => {
      if (prefs.haptics) vibrate(kind);
      if (prefs.sound) ringBell(kind === 'bead' ? 'soft' : kind);
    },
    [prefs.haptics, prefs.sound],
  );

  const recordDecade = () =>
    setStats((s) => ({ ...s, totalDecades: s.totalDecades + 1, activeDays: withActiveToday(s.activeDays) }));

  const recordRosary = (s: Session) =>
    setStats((st) => ({
      ...st,
      totalRosaries: st.totalRosaries + 1,
      activeDays: withActiveToday(st.activeDays),
      history: [
        ...st.history,
        { id: uid(), date: new Date().toISOString(), setId: s.setId, intention: intentions.find((i) => i.id === s.intentionId)?.text },
      ].slice(-500),
    }));

  const next = () => {
    const s = session;
    if (s.phase !== 'praying') return;
    if (s.step < STEPS - 1) {
      const step = s.step + 1;
      feedback(step === STEPS - 1 ? 'gloria' : 'bead');
      setSession({ ...s, step });
      return;
    }
    // Fin de dizaine
    const firstTime = !s.counted.includes(s.decade);
    const counted = firstTime ? [...s.counted, s.decade] : s.counted;
    if (firstTime) recordDecade();
    if (s.decade < DECADES - 1) {
      feedback('decade');
      setSession({ ...s, decade: s.decade + 1, step: 0, counted });
      setShowMeditation(false);
      setTransition(true);
    } else {
      feedback('complete');
      setSession({ ...s, phase: 'done', counted });
      recordRosary(s);
    }
  };

  const prev = () => {
    const s = session;
    if (s.phase !== 'praying') return;
    if (s.step > 0) setSession({ ...s, step: s.step - 1 });
    else if (s.decade > 0) setSession({ ...s, decade: s.decade - 1, step: STEPS - 1 });
    else return;
    feedback('bead');
  };

  const selectStep = (step: number) => {
    if (session.phase !== 'praying') return;
    setSession({ ...session, step });
    feedback(step === STEPS - 1 ? 'gloria' : 'bead');
  };

  const jumpToDecade = (decade: number) => {
    setSession({ ...session, decade, step: 0, phase: 'praying' });
    setShowMeditation(false);
    setTransition(true);
  };

  const startSet = (id: MysterySetId) => {
    setSession(freshSession(id, session.intentionId));
    setPickerOpen(false);
    setShowMeditation(false);
    setTransition(true);
    if (prefs.sound) ringBell('decade');
  };

  const restart = () => {
    setSession(freshSession(session.setId, session.intentionId));
    setConfirmReset(false);
    setShowMeditation(false);
    setTransition(true);
  };

  // Clavier : → / Espace = suivant, ← = précédent
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyRef.current = (e: KeyboardEvent) => {
    if (anyModal || session.phase !== 'praying') return;
    const t = e.target as HTMLElement;
    if (t.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prev();
    } else if (e.key === ' ' && !t.closest('button, [role="button"], a')) {
      e.preventDefault();
      next();
    }
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Gestes tactiles
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: TouchEvent) => {
    const p = e.touches[0];
    touch.current = { x: p.clientX, y: p.clientY };
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (!touch.current) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - touch.current.x;
    const dy = p.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) (dx < 0 ? next : prev)();
  };

  // Récitation vocale : lit le grain courant puis avance automatiquement.
  const speech = useMemo(() => {
    const L = prefs.lang;
    if (session.phase === 'done') return `${PRAYERS.salve.text[L]} ${PRAYERS.benediction.text[L]}`;
    if (transition) return `${ORDINALS[session.decade].replace('ᵉʳ', 'er').replace('ᵉ', 'e')} mystère. ${mystery.title}. ${mystery.meditation}`;
    return prayersForStep(session.step)
      .map((id) => PRAYERS[id].text[L])
      .join(' ');
  }, [prefs.lang, session.phase, session.step, session.decade, transition, mystery]);
  const speechKey = `${session.setId}-${session.decade}-${session.step}-${session.phase}-${transition}-${prefs.lang}`;

  const onSpeechEnd = useRef<() => void>(() => {});
  onSpeechEnd.current = () => {
    if (session.phase === 'done') return setTts(false);
    if (transition) return setTransition(false);
    next();
  };
  useEffect(() => {
    if (!tts) {
      stopSpeaking();
      return;
    }
    let timer = 0;
    speak(speech, prefs.lang, () => {
      timer = window.setTimeout(() => onSpeechEnd.current(), 450);
    });
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tts, speechKey]);
  useEffect(() => () => stopSpeaking(), []);

  const progress = session.phase === 'done' ? 100 : ((session.decade * STEPS + session.step) / (DECADES * STEPS)) * 100;
  const stepLabel =
    session.step === 0
      ? PRAYERS.pater.title[prefs.lang]
      : session.step === STEPS - 1
        ? `${PRAYERS.gloria.title[prefs.lang]} · ${PRAYERS.fatima.title[prefs.lang]}`
        : PRAYERS.ave.title[prefs.lang];

  const controls = (
<div className="grid grid-cols-[auto_auto_1fr] items-center gap-2 sm:gap-3">
    <button className="btn-ghost h-14 w-14 rounded-full px-0" onClick={prev} aria-label="Grain précédent" title="Grain précédent (←)" disabled={session.decade === 0 && session.step === 0}>
      <ChevronLeft size={24} aria-hidden="true" />
    </button>
    {ttsSupported ? (
      <button
        className={`btn h-14 w-14 rounded-full px-0 ${tts ? 'bg-cardinal text-ivory' : 'border border-gold/40 text-gold-deep dark:text-gold-light'}`}
        onClick={() => setTts((v) => !v)}
        aria-pressed={tts}
        aria-label={tts ? 'Mettre la récitation vocale en pause' : 'Lancer la récitation vocale'}
        title="Récitation à voix haute"
      >
        {tts ? <Pause size={22} aria-hidden="true" /> : <Play size={22} aria-hidden="true" />}
      </button>
    ) : (
      <span />
    )}
    <button className="btn-gold h-14 text-base" onClick={next} title="Grain suivant (→ ou Espace)">
      {session.step === STEPS - 1 ? (session.decade === DECADES - 1 ? 'Terminer le chapelet' : 'Dizaine suivante') : 'Grain suivant'}
      <ChevronRight size={22} aria-hidden="true" />
    </button>
  </div>
  );

  return (
    <div className={`mx-auto flex min-h-screen max-w-6xl flex-col px-4 pt-[max(env(safe-area-inset-top),0.75rem)] ${session.phase === 'praying' ? 'pb-32 lg:pb-10' : 'pb-10'} sm:px-6`}>
      {/* En-tête */}
      <header className="z-30 -mx-4 mb-4 border-b border-gold/15 bg-ivory/85 px-4 py-3 backdrop-blur dark:bg-night/85 sm:sticky sm:top-0 sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="hidden h-10 w-10 items-center sm:flex justify-center rounded-full bg-gradient-to-br from-gold-light to-gold-deep text-night shadow" aria-hidden="true">
              <Cross size={20} />
            </span>
            <div>
              <h1 className="font-serif text-2xl font-semibold leading-none">Chapelet</h1>
              <p className="hidden text-[11px] uppercase tracking-[.2em] text-night/60 dark:text-ivory/60 sm:block">Rosaire médité</p>
            </div>
          </div>
          <button className="btn-gold order-last w-full text-base sm:order-none sm:w-auto" onClick={() => setPickerOpen(true)}>
            <Sparkles size={18} aria-hidden="true" /> Démarrer un Mystère
          </button>
          <nav className="-mr-2 flex items-center sm:mr-0 sm:gap-0.5" aria-label="Réglages">
            <button className="icon-btn" onClick={() => setJournalOpen(true)} aria-label="Journal et intentions" title="Journal et intentions">
              <BookOpen size={20} aria-hidden="true" />
            </button>
            <button
              className="icon-btn px-2 font-serif text-base font-semibold"
              onClick={() => setPrefs({ ...prefs, lang: prefs.lang === 'fr' ? 'la' : 'fr' })}
              aria-label={`Langue des prières : ${prefs.lang === 'fr' ? 'français' : 'latin'}. Basculer`}
              title="Français ↔ Latin"
            >
              {prefs.lang === 'fr' ? 'FR' : 'LA'}
            </button>
            <button
              className="icon-btn"
              onClick={() => setPrefs({ ...prefs, sound: !prefs.sound })}
              aria-pressed={prefs.sound}
              aria-label="Son de cloche"
              title="Son de cloche"
            >
              {prefs.sound ? <Bell size={20} aria-hidden="true" /> : <BellOff size={20} aria-hidden="true" />}
            </button>
            <button
              className="icon-btn"
              onClick={() => setPrefs({ ...prefs, haptics: !prefs.haptics })}
              aria-pressed={prefs.haptics}
              aria-label="Vibrations"
              title="Vibrations"
            >
              {prefs.haptics ? <Vibrate size={20} aria-hidden="true" /> : <VibrateOff size={20} aria-hidden="true" />}
            </button>
            <button
              className="icon-btn"
              onClick={() => setPrefs({ ...prefs, theme: prefs.theme === 'dark' ? 'light' : 'dark' })}
              aria-label={prefs.theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              title="Thème"
            >
              {prefs.theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {session.phase === 'idle' ? (
          <section className="card mx-auto mt-4 max-w-2xl animate-rise p-6 text-center sm:p-10">
            <p className="eyebrow capitalize">{todayLabel}</p>
            <h2 className="mt-3 font-serif text-4xl font-semibold">{todaySet.name}</h2>
            <p className="font-serif text-lg italic text-night/60 dark:text-ivory/60">{todaySet.latin} · mystère du jour</p>
            <div className="mx-auto my-5 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <ol className="mx-auto max-w-sm space-y-1 text-left font-serif text-lg">
              {todaySet.mysteries.map((m, i) => (
                <li key={i}>
                  <span className="text-gold-deep dark:text-gold">{i + 1}.</span> {m.title}
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button className="btn-gold text-base" onClick={() => startSet(todaySet.id)}>
                <Play size={18} aria-hidden="true" /> Prier les {todaySet.name}
              </button>
              <button className="btn-ghost text-base" onClick={() => setPickerOpen(true)}>
                Choisir un autre mystère
              </button>
            </div>
            {stats.totalRosaries > 0 && (
              <p className="mt-6 text-sm text-night/60 dark:text-ivory/60">
                {stats.totalRosaries} chapelet{stats.totalRosaries > 1 ? 's' : ''} terminé{stats.totalRosaries > 1 ? 's' : ''} · série de {streak} jour
                {streak > 1 ? 's' : ''}
              </p>
            )}
          </section>
        ) : (
          <div className="animate-rise space-y-4">
            {/* Mystère courant */}
            <section className="card p-5 sm:p-6" aria-labelledby="mystere">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="eyebrow">
                    {set.name} · {ORDINALS[session.decade]} mystère
                  </p>
                  <h2 id="mystere" className="mt-1 font-serif text-3xl font-semibold leading-tight">
                    {mystery.title}
                  </h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-night/70 dark:text-ivory/70">
                    <span className="inline-flex items-center gap-1">
                      <Sprout size={14} className="text-gold-deep dark:text-gold" aria-hidden="true" /> Fruit : {mystery.fruit}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BookOpen size={14} className="text-gold-deep dark:text-gold" aria-hidden="true" /> {mystery.reference}
                    </span>
                  </p>
                </div>
                <button className="btn-ghost text-xs" onClick={() => setShowMeditation((v) => !v)} aria-expanded={showMeditation}>
                  {showMeditation ? 'Masquer' : 'Méditation'}
                </button>
              </div>
              {showMeditation && <p className="mt-3 font-serif text-lg italic leading-relaxed">{mystery.meditation}</p>}

              {/* Pilules D1…D5 */}
              <nav className="mt-4 flex gap-2" aria-label="Dizaines">
                {Array.from({ length: DECADES }, (_, d) => {
                  const current = d === session.decade;
                  const done = session.counted.includes(d);
                  return (
                    <button
                      key={d}
                      onClick={() => jumpToDecade(d)}
                      aria-current={current ? 'step' : undefined}
                      aria-label={`Dizaine ${d + 1} : ${set.mysteries[d].title}${done ? ' (récitée)' : ''}`}
                      title={set.mysteries[d].title}
                      className={`min-h-11 flex-1 rounded-full border text-sm font-semibold transition ${
                        current
                          ? 'border-gold bg-gold text-night shadow-md shadow-gold/30'
                          : done
                            ? 'border-gold/50 bg-gold/20 text-gold-deep dark:text-gold-light'
                            : 'border-gold/30 text-night/70 hover:bg-gold/10 dark:text-ivory/70'
                      }`}
                    >
                      D{d + 1}
                    </button>
                  );
                })}
              </nav>
            </section>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
              {/* Chapelet visuel */}
              <section className="card flex items-center justify-center p-4" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                <RosaryBeads step={session.step} decade={session.decade} active={session.phase === 'praying'} onSelect={selectStep} />
              </section>

              {/* Prière courante */}
              <section className="card flex flex-col p-5 sm:p-7" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} aria-labelledby="priere">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gold/15" role="progressbar" aria-label="Progression du chapelet" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>

                <div className="mt-5 flex items-baseline justify-between gap-3" aria-live="polite" aria-atomic="true">
                  <h3 id="priere" className="font-serif text-2xl font-semibold text-gold-deep dark:text-gold">
                    {stepLabel}
                  </h3>
                  {session.step >= 1 && session.step <= 10 && (
                    <span className="shrink-0 font-serif text-3xl font-semibold tabular-nums" aria-label={`${session.step} sur 10`}>
                      {session.step}
                      <span className="text-lg text-night/50 dark:text-ivory/50">/10</span>
                    </span>
                  )}
                </div>

                {session.step >= 1 && session.step <= 10 && (
                  <div className="mt-2 flex gap-1.5" aria-hidden="true">
                    {Array.from({ length: 10 }, (_, i) => (
                      <span key={i} className={`h-1.5 flex-1 rounded-full ${i < session.step ? 'bg-gold' : 'bg-gold/15'}`} />
                    ))}
                  </div>
                )}

                <div key={`${session.decade}-${session.step}-${prefs.lang}`} className="mt-4 flex-1 animate-rise space-y-4" lang={prefs.lang}>
                  {prayersForStep(session.step).map((id) => (
                    <div key={id}>
                      {session.step === STEPS - 1 && <p className="eyebrow mb-1">{PRAYERS[id].title[prefs.lang]}</p>}
                      <p className="font-serif text-xl leading-relaxed sm:text-[1.4rem]">{PRAYERS[id].text[prefs.lang]}</p>
                    </div>
                  ))}
                </div>

                {/* Intention */}
                <div className="mt-5 flex items-center gap-2 text-sm">
                  <Heart size={16} className="shrink-0 text-cardinal dark:text-rose-300" aria-hidden="true" />
                  <label htmlFor="intention-select" className="sr-only">
                    Intention associée
                  </label>
                  <select
                    id="intention-select"
                    value={session.intentionId ?? ''}
                    onChange={(e) => {
                      if (e.target.value === '__new') {
                        setJournalOpen(true);
                        return;
                      }
                      setSession({ ...session, intentionId: e.target.value || null });
                    }}
                    className="min-h-11 min-w-0 flex-1 truncate rounded-full border border-gold/30 bg-transparent px-3 dark:bg-night-800"
                  >
                    <option value="">Aucune intention particulière</option>
                    {intentions
                      .filter((i) => !i.answered || i.id === session.intentionId)
                      .map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.text}
                        </option>
                      ))}
                    <option value="__new">＋ Ajouter une intention…</option>
                  </select>
                </div>

                <div className="mt-5 hidden lg:block">{controls}</div>
                <div className="mt-4 flex items-center justify-between text-xs text-night/50 dark:text-ivory/50">
                  <span className="hidden sm:inline">← → ou Espace · glissez sur mobile</span>
                  <span className="sm:hidden">Glissez ← → pour avancer</span>
                  <button className="btn -mr-3 text-xs text-night/60 hover:text-cardinal dark:text-ivory/60" onClick={() => setConfirmReset(true)}>
                    <RotateCcw size={14} aria-hidden="true" /> Recommencer
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {session.phase === 'praying' && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gold/20 bg-ivory/90 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur dark:bg-night/90 lg:hidden">
          {controls}
        </div>
      )}

      <footer className="mt-8 text-center font-serif text-sm italic text-night/50 dark:text-ivory/50">
        « Le Rosaire est la prière la plus belle et la plus riche en grâces. » — saint Pie X
      </footer>

      <MysteryPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={startSet} currentId={session.phase !== 'idle' ? session.setId : undefined} />

      <TransitionModal open={transition && session.phase === 'praying'} set={set} decade={session.decade} onContinue={() => setTransition(false)} />

      <CompletionScreen
        open={session.phase === 'done'}
        set={set}
        lang={prefs.lang}
        streak={streak}
        total={stats.totalRosaries}
        intention={intention?.text}
        onRestart={restart}
        onAnother={() => {
          setSession({ ...session, phase: 'idle' });
          setTts(false);
          setPickerOpen(true);
        }}
        onClose={() => {
          setSession({ ...session, phase: 'idle' });
          setTts(false);
        }}
      />

      <Journal
        open={journalOpen}
        onClose={() => setJournalOpen(false)}
        stats={stats}
        intentions={intentions}
        selectedIntentionId={session.intentionId}
        onAddIntention={(text) => {
          const it: Intention = { id: uid(), text, createdAt: new Date().toISOString(), answered: false };
          setIntentions((l) => [it, ...l]);
          setSession((s) => ({ ...s, intentionId: it.id }));
        }}
        onToggleAnswered={(id) => setIntentions((l) => l.map((i) => (i.id === id ? { ...i, answered: !i.answered } : i)))}
        onDeleteIntention={(id) => {
          setIntentions((l) => l.filter((i) => i.id !== id));
          if (session.intentionId === id) setSession((s) => ({ ...s, intentionId: null }));
        }}
        onSelectIntention={(id) => setSession((s) => ({ ...s, intentionId: id }))}
      />

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Recommencer le chapelet ?">
        <p className="text-sm text-night/80 dark:text-ivory/80">
          La progression actuelle ({set.name}, dizaine {session.decade + 1}) sera remise au début. Les dizaines déjà récitées restent comptées dans votre journal.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="btn-ghost" onClick={() => setConfirmReset(false)} data-autofocus>
            Annuler
          </button>
          <button className="btn bg-cardinal text-ivory hover:bg-cardinal/90" onClick={restart}>
            <RotateCcw size={16} aria-hidden="true" /> Recommencer
          </button>
        </div>
      </Modal>
    </div>
  );
}
