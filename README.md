# Diato

[Diato](https://diato-explorer.vercel.app/) is an interactive React + TypeScript web app that helps
musicians discover keys and diatonic chords from a small set of chosen triads. Use the
circle of fifths or the triad table to select chords and instantly see which
Ionian (Major) and Aeolian (Natural Minor) keys contain those chords, plus which
diatonic chords remain available in each matching key.

## Why this app

- Interactive: select chords on the circle of fifths or from the triad table and see matching keys.
- Educational: shows diatonic triads for selected keys and highlights remaining available chords.
- Lightweight: runs locally with Vite, no server required — great for quick study or sketching ideas.


## Core features

 - Browse all triads (Free) or focus "By Key" using the circle of fifths (outer ring = Ionian, inner ring = Aeolian).
 - Select multiple chords to find all keys where those chords are diatonic and see remaining diatonic chords per key.
 - Persistent theme preference (system / light / dark) saved to `localStorage`.
 - Tooltips and accessible controls for keyboard and mouse use.

**Supported modes:**
The app handles Ionian (Major) and Aeolian (Natural Minor) only. It does not include borrowed chords, secondary dominants, or altered minor scales.

## How to use

1. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

2. Open the site shown by Vite (usually http://localhost:5173).
3. Use the top toggles:
   - "By Key": pick a tonic and mode to show that key's diatonic triads.
   - "Free": browse all triads and select any combination.
4. Click a chord to toggle it in the selection. The results list shows matched keys
   and available chords remaining in each matched key.
5. Use the theme icon in the header to cycle between system / light / dark modes.

## Intended audience

- Beginners and students learning basic diatonic harmony.
- Songwriters, composers, and hobbyists who want quick harmony suggestions from a small chord set.

Diato is designed to help users who are starting to write music and want to expand chord choices by exploring which keys fit their current chords and what other diatonic chords are available in those keys.

## Contributing

- Open a PR with improvements, bug fixes, or additional modes (e.g., Dorian, Mixolydian).

## License

- MIT