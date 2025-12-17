/**
 * Pure functions for diatonic harmony analysis (Ionian/Aeolian, no modulations)
 * All logic is independent from UI.
 */
import type { Note, Mode, Chord, Key } from './types';
import { } from './types';

/**
 * All 12 chromatic notes in order
 */
export const NOTES: Note[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B'
];

/**
 * Ionian (major) and Aeolian (minor) scale intervals (in semitones)
 */
const SCALE_INTERVALS = {
  Ionian: [2,2,1,2,2,2,1],
  Aeolian: [2,1,2,2,1,2,2],
} as const;



/**
 * Get the note at a given interval from a root
 */
function transpose(root: Note, semitones: number): Note {
  const idx = NOTES.indexOf(root);
  return NOTES[(idx + semitones + 12) % 12];
}

/**
 * Build a diatonic scale for a given tonic and mode
 */
export function buildScale(tonic: Note, mode: Mode): Note[] {
  const intervals = SCALE_INTERVALS[mode];
  const scale: Note[] = [tonic];
  let current = tonic;
  for (let i = 0; i < 6; i++) {
    current = transpose(current, intervals[i]);
    scale.push(current);
  }
  return scale;
}

/**
 * Build all diatonic triads for a key
 */
export function buildDiatonicChords(key: Key): Chord[] {
  const scale = buildScale(key.tonic, key.mode);
  const qualities = key.mode === 'Ionian'
    ? ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'] as const
    : ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'] as const;
  return scale.map((note, i) => ({
    root: note,
    mode: key.mode,
    degree: i + 1,
    quality: qualities[i],
  }));
}

/**
 * Generate all 24 keys (12 Ionian, 12 Aeolian)
 */
export function getAllKeys(): Key[] {
  return [
    ...NOTES.map(tonic => ({ tonic, mode: 'Ionian' as Mode })),
    ...NOTES.map(tonic => ({ tonic, mode: 'Aeolian' as Mode })),
  ];
}

/**
 * Build a list of all possible triads (major, minor, diminished) for every root.
 * This is used in the "free" selection mode where user picks chords freely.
 */
export function buildAllTriads(): Chord[] {
  const triads: Chord[] = [];
  for (const note of NOTES) {
    triads.push({ root: note, mode: 'Ionian', degree: 1, quality: 'major' });
    triads.push({ root: note, mode: 'Aeolian', degree: 1, quality: 'minor' });
    triads.push({ root: note, mode: 'Ionian', degree: 7, quality: 'diminished' });
  }
  return triads;
}

/**
 * Find all keys where all selected chords are diatonic
 */
export function findMatchingKeys(selectedChords: Chord[]): { key: Key, availableChords: Chord[] }[] {
  return getAllKeys()
    .map(key => {
      const diatonic = buildDiatonicChords(key);
      // A selected chord should be considered present in a key if a diatonic chord
      // in that key has the same root note and the same triad quality.
      const matches = selectedChords.every(sel =>
        diatonic.some(chord => chord.root === sel.root && chord.quality === sel.quality)
      );
      if (!matches) return null;
      const availableChords = diatonic.filter(chord =>
        !selectedChords.some(sel => chord.root === sel.root && chord.quality === sel.quality)
      );
      return { key, availableChords };
    })
    .filter(Boolean) as { key: Key, availableChords: Chord[] }[];
}
