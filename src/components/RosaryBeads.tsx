import type { KeyboardEvent } from 'react';

interface Props {
  /** Grain courant : -1 croix, 0 gros grain, 1-10 petits grains, 11 médaille ; null hors prière. */
  activeBead: number | null;
  /** Tous les grains de la boucle sont récités (conclusion). */
  allDone?: boolean;
  center: string;
  sub: string;
  label: (bead: number) => string;
  /** La médaille correspond-elle à un grain cliquable dans la dizaine (Gloria du Rosaire) ? */
  medalSelectable: boolean;
  onSelect: (bead: number) => void;
}

const CX = 150;
const CY = 125;
const R = 100;
const rad = (a: number) => (a * Math.PI) / 180;
const at = (a: number) => [CX + R * Math.cos(rad(a)), CY + R * Math.sin(rad(a))] as const;

// Médaille en bas (90°), Pater juste à gauche, puis les dix Ave dans le sens horaire.
const ANGLES = [120, ...Array.from({ length: 10 }, (_, i) => 150 + (i * (414 - 150)) / 9)];

export function RosaryBeads({ activeBead, allDone, center, sub, label, medalSelectable, onSelect }: Props) {
  const active = activeBead !== null;
  const state = (i: number) =>
    i === activeBead ? 'active' : allDone || (activeBead !== null && activeBead >= 0 && i < activeBead) ? 'done' : 'pending';
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
  const crossActive = activeBead === -1;

  return (
    <svg viewBox="0 0 300 335" className="mx-auto h-auto w-full max-w-[280px] sm:max-w-[340px]" role="group" aria-label={`Chapelet — ${sub}`}>
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
      <text x={CX} y={CY - 6} textAnchor="middle" className={`fill-gold-deep font-serif font-semibold dark:fill-gold ${center.length > 6 ? 'text-[24px]' : 'text-[30px]'}`} aria-hidden="true">
        {center}
      </text>
      <text x={CX} y={CY + 20} textAnchor="middle" className="fill-night/60 text-[11px] uppercase tracking-[.2em] dark:fill-ivory/60" aria-hidden="true">
        {sub}
      </text>

      {ANGLES.map((_, i) => bead(i))}

      {/* Médaille : grain du Gloire au Père */}
      <g
        role={medalSelectable ? 'button' : undefined}
        tabIndex={medalSelectable && active ? 0 : -1}
        aria-label={label(11)}
        aria-current={medalState === 'active' ? 'step' : undefined}
        className={medalSelectable ? 'cursor-pointer outline-none' : 'outline-none'}
        onClick={medalSelectable ? () => onSelect(11) : undefined}
        onKeyDown={medalSelectable ? keySelect(11) : undefined}
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
        {crossActive && <ellipse cx={150} cy={292} rx={30} ry={38} className="animate-halo fill-gold/35" style={{ transformOrigin: '150px 292px' }} />}
        <path
          filter={crossActive ? 'url(#glow)' : undefined}
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
