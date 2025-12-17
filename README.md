# Diato

[Diato](https://diato-explorer.vercel.app/) is a small React + TypeScript web app for exploring diatonic triads and
discovering which major/minor keys contain a given set of chords. The app is designed
for music students, hobbyists, and composers who want a lightweight interactive tool
for learning harmony or experimenting with chord choices while composing.

## Why this app

- Interactive: select chords visually (circle or table) and instantly see matching keys.
- Educational: exposes diatonic triads for each key and highlights remaining available chords.
- Lightweight: runs locally with Vite, no server required — great for quick study or sketching ideas.

## Core features

- Browse all triads or focus "By Key" (select tonic + mode).
- Select multiple chords to find all keys where those chords are diatonic.
- Persistent theme preference (system / light / dark) saved to `localStorage`.
- Tooltips and accessible controls for keyboard + mouse use.

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

- Students learning diatonic harmony and roman numeral analysis.
- Composers or songwriters who want a quick reference to which keys contain selected chords.

## Contributing

- Open a PR with improvements, bug fixes, or additional modes (e.g., Dorian, Mixolydian).

## License

- MIT