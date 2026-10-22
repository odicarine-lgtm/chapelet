# Chapelet — Rosaire médité (PWA)

Application de prière du chapelet, grain par grain, en français ou en latin. 100 % hors-ligne, sans publicité, sans compte.

## Lancer

```bash
npm install
npm run dev        # développement (http://localhost:5173)
npm run build      # production → dist/
npm run preview    # tester le build (service worker actif)
```

Le dossier `dist/` se déploie tel quel sur n'importe quel hébergement statique (GitHub Pages, Cloudflare Pages, Netlify…). Chemins relatifs : fonctionne aussi dans un sous-dossier.

## Structure

| Fichier | Rôle |
|---|---|
| `src/data/prayers.ts` | Textes FR/LA : Pater, Ave, Gloria, Fatima, Salve Regina, bénédiction |
| `src/data/mysteries.ts` | 4 séries × 5 mystères : fruit, référence biblique, méditation, jours recommandés |
| `src/App.tsx` | Logique de progression (5 dizaines × 12 grains), clavier, swipe, TTS, statistiques |
| `src/components/RosaryBeads.tsx` | Chapelet SVG interactif (Pater, 10 Ave, médaille = Gloria, croix) |
| `src/components/*` | Sélecteur, transition de dizaine, écran « TERMINÉ ! », journal & intentions |
| `src/lib/bell.ts` | Cloche synthétisée (Web Audio, aucun fichier son) |
| `src/lib/tts.ts` | Récitation vocale (voix française ; latin lu avec une voix italienne, la plus proche du latin ecclésiastique) |

## Données (localStorage)

`chapelet.prefs` (langue, son, vibrations, thème) · `chapelet.session` (progression en cours, reprise automatique) · `chapelet.stats` (dizaines, chapelets, jours de prière, historique) · `chapelet.intentions`.

## Raccourcis

→ / Espace / Page↓ : grain suivant · ← / Page↑ : grain précédent · Échap : fermer une fenêtre · glisser gauche/droite sur mobile.

Régénérer les icônes après modification de `public/icon.svg` : `npm run icons`.
