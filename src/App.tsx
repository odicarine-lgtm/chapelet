import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';
import {
  Bell,
  BellOff,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Cross,
  Heart,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Sprout,
  Sun,
  SunDim,
  Vibrate,
  VibrateOff,
} from 'lucide-react';
import { ORDINALS, getSet, getSetForDate, type MysterySetId } from './data/mysteries';
import { PRAYERS, type Lang, type PrayerId } from './data/prayers';
import {
  DECADES,
  INTRO,
  MERCY,
  OUTRO,
  beadAt,
  centerLabelAt,
  counterAt,
  firstPosition,
  nextPosition,
  prayersAt,
  prevPosition,
  progressOf,
  segmentLabel,
  stepsIn,
  type DevotionId,
  type Position,
} from './data/devotions';
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
  devotion: DevotionId;
  setId: MysterySetId; // série de mystères (Rosaire uniquement)
  decade: number; // 0-4 ; -1 = ouverture ; 5 = conclusion (voir data/devotions)
  step: number;
  phase: Phase;
  counted: number[]; // dizaines déjà comptabilisées dans les statistiques
  intentionId: string | null;
}

interface Prefs {
  lang: Lang;
  sound: boolean;
  haptics: boolean;
  theme: 'light' | 'dark';
  wakeLock: boolean; // garder l'écran allumé pendant la prière
}

const wakeLockSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

const freshSession = (devotion: DevotionId, setId: MysterySetId, intentionId: string | null = null): Session => ({
  devotion,
  setId,
  ...firstPosition(devotion),
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
    wakeLock: true,
  }));
  const [session, setSession] = useLocalStorage<Session>('chapelet.session', () => ({
    ...freshSession('rosaire', getSetForDate().id),
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
  const dev = session.devotion;
  const isMercy = dev === 'misericorde';
  const pos: Position = { decade: session.decade, step: session.step };
  const inDecade = session.decade >= 0 && session.decade < DECADES;
  const mystery = set.mysteries[Math.min(Math.max(session.decade, 0), DECADES - 1)];
  const devotionName = isMercy ? MERCY.name : set.name;
  const devotionLatin = isMercy ? MERCY.latin : set.latin;
  const now = new Date();
  const mercyHour = now.getHours() === 15;
  const mercyHighlight = mercyHour || now.getDay() === 5;
  const todaySet = getSetForDate();
  const intention = intentions.find((i) => i.id === session.intentionId);
  const streak = currentStreak(stats.activeDays);
  const anyModal = pickerOpen || journalOpen || confirmReset || transition || session.phase === 'done';

  // Écran toujours allumé pendant la prière (Screen Wake Lock, Safari iOS 16.4+).
  // Le verrou est relâché par le système quand l'app passe en arrière-plan : on le redemande au retour.
  useEffect(() => {
    if (!wakeLockSupported || !prefs.wakeLock || session.phase !== 'praying') return;
    let lock: WakeLockSentinel | null = null;
    let disposed = false;
    const acquire = async () => {
      if (lock || document.visibilityState !== 'visible') return;
      try {
        const l = await navigator.wakeLock.request('screen');
        if (disposed) return void l.release();
        lock = l;
        l.addEventListener('release', () => {
          if (lock === l) lock = null;
        });
      } catch {
        /* refusé (économie d'énergie, etc.) */
      }
    };
    void acquire();
    const onVisible = () => void acquire();
    document.addEventListener('visibilitychange', onVisible);
    // Certains navigateurs n'accordent le verrou qu'après une interaction : on réessaie à chaque toucher.
    document.addEventListener('pointerdown', onVisible);
    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', onVisible);
      document.removeEventListener('pointerdown', onVisible);
      void lock?.release();
    };
  }, [prefs.wakeLock, session.phase]);

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
        { id: uid(), date: new Date().toISOString(), setId: s.setId, devotion: s.devotion, intention: intentions.find((i) => i.id === s.intentionId)?.text },
      ].slice(-500),
    }));

  // Grains « forts » : Gloria du Rosaire, Père Éternel et Dieu Saint de la Miséricorde
  const strongBead = (d: DevotionId, p: Position) =>
    d === 'rosaire' ? p.step === 11 : p.decade === OUTRO || (p.decade >= 0 && p.decade < DECADES && p.step === 0);

  const next = () => {
    const s = session;
    if (s.phase !== 'praying') return;
    const p = { decade: s.decade, step: s.step };
    const n = nextPosition(s.devotion, p);
    const endOfDecade = n?.decade !== p.decade && p.decade >= 0 && p.decade < DECADES;
    let counted = s.counted;
    if (endOfDecade && !counted.includes(p.decade)) {
      counted = [...counted, p.decade];
      recordDecade();
    }
    if (!n) {
      feedback('complete');
      setSession({ ...s, phase: 'done', counted });
      recordRosary(s);
      return;
    }
    if (n.decade !== p.decade) {
      feedback('decade');
      setShowMeditation(false);
      // Méditation du mystère avant chaque dizaine du Rosaire
      if (s.devotion === 'rosaire') setTransition(true);
    } else feedback(strongBead(s.devotion, n) ? 'gloria' : 'bead');
    setSession({ ...s, ...n, counted });
  };

  const prev = () => {
    const s = session;
    if (s.phase !== 'praying') return;
    const p = prevPosition(s.devotion, { decade: s.decade, step: s.step });
    if (!p) return;
    setSession({ ...s, ...p });
    feedback('bead');
  };

  // Clic sur un grain du dessin (dans la dizaine en cours uniquement)
  const selectBead = (bead: number) => {
    if (session.phase !== 'praying' || !inDecade || bead >= stepsIn(dev, session.decade)) return;
    setSession({ ...session, step: bead });
    feedback(strongBead(dev, { decade: session.decade, step: bead }) ? 'gloria' : 'bead');
  };

  const jumpToDecade = (decade: number) => {
    setSession({ ...session, decade, step: 0, phase: 'praying' });
    setShowMeditation(false);
    if (dev === 'rosaire') setTransition(true);
  };

  const startDevotion = (devotion: DevotionId, setId: MysterySetId = session.setId) => {
    setSession(freshSession(devotion, setId, session.intentionId));
    setPickerOpen(false);
    setShowMeditation(false);
    setTransition(true);
    if (prefs.sound) ringBell('decade');
  };
  const startSet = (id: MysterySetId) => startDevotion('rosaire', id);

  const restart = () => {
    setSession(freshSession(session.devotion, session.setId, session.intentionId));
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

  const closingPrayers: PrayerId[] = isMercy ? MERCY.closing : ['salve', 'benediction'];

  // Récitation vocale : lit le grain courant puis avance automatiquement.
  const speech = useMemo(() => {
    const L = prefs.lang;
    if (session.phase === 'done') return closingPrayers.map((id) => PRAYERS[id].text[L]).join(' ');
    if (transition) {
      if (isMercy) return `${MERCY.name}. ${MERCY.intro}`;
      return `${ORDINALS[session.decade].replace('ᵉʳ', 'er').replace('ᵉ', 'e')} mystère. ${mystery.title}. ${mystery.meditation}`;
    }
    return prayersAt(dev, { decade: session.decade, step: session.step })
      .map((id) => PRAYERS[id].text[L])
      .join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.lang, session.phase, session.step, session.decade, dev, transition, mystery]);
  const speechKey = `${dev}-${session.setId}-${session.decade}-${session.step}-${session.phase}-${transition}-${prefs.lang}`;

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

  const prog = progressOf(dev, pos);
  const progress = session.phase === 'done' ? 100 : (prog.index / prog.total) * 100;
  const prayers = prayersAt(dev, pos);
  const stepLabel = prayers.map((id) => PRAYERS[id].title[prefs.lang]).join(' · ');
  const counter = counterAt(dev, pos);
  const nextPos = nextPosition(dev, pos);
  const nextLabel = !nextPos
    ? 'Terminer le chapelet'
    : nextPos.decade === session.decade
      ? 'Grain suivant'
      : nextPos.decade === OUTRO
        ? 'Conclusion'
        : session.decade === INTRO
          ? 'Première dizaine'
          : 'Dizaine suivante';

  // Libellé accessible de chaque grain du dessin
  const beadLabel = (bead: number) => {
    if (bead === 11) return isMercy ? 'Médaille' : 'Gloire au Père et prière de Fatima';
    if (isMercy) return bead === 0 ? 'Père Éternel' : `Par sa douloureuse Passion ${bead} sur 10`;
    return bead === 0 ? 'Notre Père' : `Je vous salue Marie ${bead} sur 10`;
  };

  const controls = (
<div className="grid grid-cols-[auto_auto_1fr] items-center gap-2 sm:gap-3">
    <button className="btn-ghost h-14 w-14 rounded-full px-0" onClick={prev} aria-label="Grain précédent" title="Grain précédent (←)" disabled={!prevPosition(dev, pos)}>
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
      {nextLabel}
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
        ) : null}

        {session.phase === 'idle' && (
          <section
            className={`card mx-auto mt-4 flex max-w-2xl animate-rise flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left ${mercyHighlight ? 'border-gold shadow-md shadow-gold/20' : ''}`}
          >
            <div className="flex-1">
              {mercyHighlight && (
                <p className="eyebrow mb-1 inline-flex items-center gap-1">
                  <Clock3 size={12} aria-hidden="true" /> {mercyHour ? 'C’est l’Heure de la Miséricorde' : 'Vendredi, jour de la Passion'}
                </p>
              )}
              <h2 className="font-serif text-2xl font-semibold">{MERCY.name}</h2>
              <p className="text-sm text-night/70 dark:text-ivory/70">Environ 10 minutes · {MERCY.when}</p>
            </div>
            <button className={mercyHighlight ? 'btn-gold text-base' : 'btn-ghost text-base'} onClick={() => startDevotion('misericorde')}>
              <Play size={18} aria-hidden="true" /> Prier ce chapelet
            </button>
          </section>
        )}

        {session.phase !== 'idle' && (
          <div className="animate-rise space-y-4">
            {/* Mystère courant */}
            <section className="card p-5 sm:p-6" aria-labelledby="mystere">
              {isMercy ? (
                <div>
                  <p className="eyebrow">
                    {MERCY.name} · {segmentLabel(session.decade)}
                  </p>
                  <h2 id="mystere" className="mt-1 font-serif text-3xl font-semibold leading-tight">
                    {session.decade === INTRO ? 'Prières d’ouverture' : session.decade === OUTRO ? 'Dieu Saint, Dieu Fort, Dieu Immortel' : `${['1ʳᵉ', '2ᵉ', '3ᵉ', '4ᵉ', '5ᵉ'][session.decade]} dizaine`}
                  </h2>
                  <p className="mt-1 text-sm text-night/70 dark:text-ivory/70">
                    {session.decade === INTRO
                      ? 'Sur la croix et les premiers grains du chapelet.'
                      : session.decade === OUTRO
                        ? 'Trois fois, sur la médaille.'
                        : 'Unis à la Passion du Christ, pour nous et pour le monde entier.'}
                  </p>
                </div>
              ) : (
              <>
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
              </>
              )}

              {/* Pilules D1…D5 */}
              <nav className={`mt-4 flex ${isMercy ? 'gap-1.5' : 'gap-2'}`} aria-label="Dizaines">
                {(isMercy ? [INTRO, 0, 1, 2, 3, 4, OUTRO] : [0, 1, 2, 3, 4]).map((d) => {
                  const current = d === session.decade;
                  const done = session.counted.includes(d) || (d === INTRO && session.decade > INTRO);
                  const name = isMercy ? segmentLabel(d) : `Dizaine ${d + 1} : ${set.mysteries[d].title}`;
                  return (
                    <button
                      key={d}
                      onClick={() => jumpToDecade(d)}
                      aria-current={current ? 'step' : undefined}
                      aria-label={`${name}${done ? ' (récitée)' : ''}`}
                      title={isMercy ? segmentLabel(d) : set.mysteries[d].title}
                      className={`min-h-11 min-w-0 flex-1 rounded-full border text-sm font-semibold transition ${
                        current
                          ? 'border-gold bg-gold text-night shadow-md shadow-gold/30'
                          : done
                            ? 'border-gold/50 bg-gold/20 text-gold-deep dark:text-gold-light'
                            : 'border-gold/30 text-night/70 hover:bg-gold/10 dark:text-ivory/70'
                      }`}
                    >
                      {d === INTRO ? 'Ouv.' : d === OUTRO ? 'Fin' : `D${d + 1}`}
                    </button>
                  );
                })}
              </nav>
            </section>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
              {/* Chapelet visuel */}
              <section className="card flex items-center justify-center p-4" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                <RosaryBeads
                  activeBead={session.phase === 'praying' ? beadAt(dev, pos) : null}
                  allDone={session.decade === OUTRO}
                  center={centerLabelAt(dev, pos)}
                  sub={segmentLabel(session.decade)}
                  label={beadLabel}
                  medalSelectable={!isMercy}
                  onSelect={selectBead}
                />
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
                  {counter && (
                    <span className="shrink-0 font-serif text-3xl font-semibold tabular-nums" aria-label={`${counter.n} sur ${counter.of}`}>
                      {counter.n}
                      <span className="text-lg text-night/50 dark:text-ivory/50">/{counter.of}</span>
                    </span>
                  )}
                </div>

                {counter && (
                  <div className="mt-2 flex gap-1.5" aria-hidden="true">
                    {Array.from({ length: counter.of }, (_, i) => (
                      <span key={i} className={`h-1.5 flex-1 rounded-full ${i < counter.n ? 'bg-gold' : 'bg-gold/15'}`} />
                    ))}
                  </div>
                )}

                <div key={`${dev}-${session.decade}-${session.step}-${prefs.lang}`} className="mt-4 flex-1 animate-rise space-y-4" lang={prefs.lang}>
                  {prayers.map((id) => (
                    <div key={id}>
                      {prayers.length > 1 && <p className="eyebrow mb-1">{PRAYERS[id].title[prefs.lang]}</p>}
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
                  <span className="sm:hidden">Glissez ← →</span>
                  {wakeLockSupported && (
                    <button
                      className={`btn text-xs ${prefs.wakeLock ? 'text-gold-deep dark:text-gold-light' : 'text-night/60 dark:text-ivory/60'}`}
                      onClick={() => setPrefs({ ...prefs, wakeLock: !prefs.wakeLock })}
                      aria-pressed={prefs.wakeLock}
                      title="Empêche l'écran de se mettre en veille pendant la prière"
                    >
                      {prefs.wakeLock ? <Sun size={14} aria-hidden="true" /> : <SunDim size={14} aria-hidden="true" />}
                      Écran {prefs.wakeLock ? 'allumé' : 'auto'}
                    </button>
                  )}
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
        {isMercy && session.phase !== 'idle' ? MERCY.quote : '« Le Rosaire est la prière la plus belle et la plus riche en grâces. » — saint Pie X'}
      </footer>

      <MysteryPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={startSet}
        onPickMercy={() => startDevotion('misericorde')}
        currentId={session.phase === 'idle' ? undefined : isMercy ? 'misericorde' : session.setId}
      />

      <TransitionModal
        open={transition && session.phase === 'praying'}
        onContinue={() => setTransition(false)}
        {...(isMercy
          ? {
              eyebrow: 'Petit Journal de sainte Faustine',
              title: MERCY.name,
              body: MERCY.intro,
              facts: [
                { icon: <Clock3 size={15} />, label: 'Heure', value: '15 h, Heure de la Miséricorde' },
                { icon: <BookOpen size={15} />, label: 'Source', value: 'Petit Journal, n° 474-476' },
              ],
              button: 'Commencer le chapelet',
            }
          : {
              eyebrow: `${set.name} · ${ORDINALS[session.decade]} mystère`,
              title: mystery.title,
              body: mystery.meditation,
              facts: [
                { icon: <Sprout size={15} />, label: 'Fruit du mystère', value: mystery.fruit },
                { icon: <BookOpen size={15} />, label: 'Écriture', value: mystery.reference },
              ],
              button: `Commencer la dizaine ${session.decade + 1}`,
            })}
      />

      <CompletionScreen
        open={session.phase === 'done'}
        name={devotionName}
        latin={devotionLatin}
        closing={closingPrayers}
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
          La progression actuelle ({devotionName}, {segmentLabel(session.decade).toLowerCase()}) sera remise au début. Les dizaines déjà récitées restent comptées dans votre journal.
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
