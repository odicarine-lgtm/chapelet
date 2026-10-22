import type { KeyboardEvent } from 'react';

interface Props {
  step: number; // 0 = Pater, 1-10 = Ave, 11 = Gloria (médaille)
  decade: number;
  active: boolean;
  onSelect: (step: number) => void;
}

const CX = 150;
const CY = 125;
const R = 100;
const rad = (a: number) => (a * Math.PI) / 180;
const at = (a: number) => [CX + R * Math.cos(rad(a)), CY + R * Math.sin(rad(a))] as const;

// Médaille en bas (90°), Pater juste à gauche, puis les dix Ave dans le sens horaire.
const ANGLES = [120, ...Array.from({ length: 10 }, (_, i) => 150 + (i * (414 - 150)) / 9)];

function label(i: number) {
  if (i === 0) return 'Notre Père';
  if (i === 11) return 'Gloire au Père et prière de Fatima';
  return `Je vous salue Marie ${i} sur 10`;
}

export function RosaryBeads({ step, decade, active, onSelect }: Props) {
  const state = (i: number) => (!active ? 'pending' : i < step ? 'done' : i === step ? 'active' : 'pending');
  const keySelect = (i: number) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onSelect(i);
    }
  };

  const bead = (i: number) => {
    const [x, y] = at(ANGLES[i]);
    const s = state(i);
    const r = i === 0 ? 11 : 8;
    return (
      <g
        key={i}
        role="button"
        tabIndex={active ? 0 : -1}
        aria-label={label(i)}
        aria-current={s === 'active' ? 'step' : undefined}
        className="cursor-pointer outline-none [&:focus-visible>circle.ring]:opacity-100"
        onClick={() => onSelect(i)}
        onKeyDown={keySelect(i)}
      >
        <circle cx={x} cy={y} r={17} fill="transparent" />
        <circle className="ring opacity-0" cx={x} cy={y} r={r + 5} fill="none" stroke="#D4AF37" strokeWidth={2} />
        {s === 'active' && (
          <circle cx={x} cy={y} r={r + 9} className="origin-center animate-halo fill-gold/40" style={{ transformOrigin: `${x}px ${y}px` }} />
        )}
        <circle
          cx={x}
          cy={y}
          r={s === 'active' ? r + 2 : r}
          filter={s === 'active' ? 'url(#glow)' : undefined}
          fill={s === 'pending' ? undefined : 'url(#gold)'}
          className={
            s === 'pending'
              ? 'fill-ivory stroke-gold-deep/50 dark:fill-night-700 dark:stroke-gold/40'
              : s === 'done'
                ? 'stroke-gold-deep/40 opacity-70'
                : 'stroke-gold-light'
          }
          strokeWidth={1.5}
        />
        {i === 0 && <circle cx={x - 3} cy={y - 3} r={2.5} className="fill-white/60" />}
      </g>
    );
  };

  const [mx, my] = at(90);
  const medalState = state(11);
  const center = !active ? 'Ave' : step === 0 ? 'Pater' : step === 11 ? 'Gloria' : `${step}/10`;

  return (
    <svg viewBox="0 0 300 335" className="mx-auto h-auto w-full max-w-[280px] sm:max-w-[340px]" role="group" aria-label={`Chapelet, dizaine ${decade + 1} sur 5`}>
      <defs>
        <radialGradient id="gold" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#FBF0C4" />
          <stop offset=".45" stopColor="#D4AF37" />
          <stop offset="1" stopColor="#8E6B16" />
        </radialGradient>
        <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Chaînette */}
      <circle cx={CX} cy={CY} r={R} fill="none" className="stroke-gold-deep/40 dark:stroke-gold/35" strokeWidth={1.4} strokeDasharray="2 3" />
      <line x1={CX} y1={my + 12} x2={CX} y2={262} className="stroke-gold-deep/50 dark:stroke-gold/45" strokeWidth={1.4} strokeDasharray="2 3" />

      {/* Centre */}
      <text x={CX} y={CY - 6} textAnchor="middle" className="fill-gold-deep font-serif text-[30px] font-semibold dark:fill-gold" aria-hidden="true">
        {center}
      </text>
      <text x={CX} y={CY + 20} textAnchor="middle" className="fill-night/60 text-[11px] uppercase tracking-[.2em] dark:fill-ivory/60" aria-hidden="true">
        Dizaine {decade + 1}/5
      </text>

      {ANGLES.map((_, i) => bead(i))}

      {/* Médaille : grain du Gloire au Père */}
      <g
        role="button"
        tabIndex={active ? 0 : -1}
        aria-label={label(11)}
        aria-current={medalState === 'active' ? 'step' : undefined}
        className="cursor-pointer outline-none"
        onClick={() => onSelect(11)}
        onKeyDown={keySelect(11)}
      >
        {medalState === 'active' && (
          <ellipse cx={mx} cy={my} rx={22} ry={26} className="animate-halo fill-gold/40" style={{ transformOrigin: `${mx}px ${my}px` }} />
        )}
        <path
          d={`M${mx} ${my - 15} C ${mx + 13} ${my - 15} ${mx + 13} ${my + 15} ${mx} ${my + 15} C ${mx - 13} ${my + 15} ${mx - 13} ${my - 15} ${mx} ${my - 15} Z`}
          fill={medalState === 'pending' ? undefined : 'url(#gold)'}
          filter={medalState === 'active' ? 'url(#glow)' : undefined}
          className={medalState === 'pending' ? 'fill-ivory stroke-gold-deep/60 dark:fill-night-700 dark:stroke-gold/50' : 'stroke-gold-deep/50'}
          strokeWidth={1.5}
        />
        <text x={mx} y={my + 4} textAnchor="middle" className="pointer-events-none fill-night/70 font-serif text-[12px] font-semibold" aria-hidden="true">
          M
        </text>
      </g>

      {/* Croix */}
      <g aria-hidden="true">
        <path
          d="M146 262 h8 v18 h16 v8 h-16 v34 h-8 v-34 h-16 v-8 h16 z"
          fill="url(#gold)"
          className="stroke-gold-deep/60"
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
