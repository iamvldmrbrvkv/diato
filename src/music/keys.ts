import type { Key, Note } from "./types";

/**
 * Explicit list of 24 valid diatonic keys (12 major / Ionian and 12 minor / Aeolian).
 * Each entry includes tonic, mode and the fixed 7-note diatonic scale spelled
 * to avoid duplicate letter names and double accidentals.
 */
export const ALLOWED_KEYS: Key[] = [
  /** Major (Ionian) keys */
  { tonic: "C", mode: "Ionian", scale: ["C", "D", "E", "F", "G", "A", "B"] },
  { tonic: "G", mode: "Ionian", scale: ["G", "A", "B", "C", "D", "E", "F#"] },
  { tonic: "D", mode: "Ionian", scale: ["D", "E", "F#", "G", "A", "B", "C#"] },
  { tonic: "A", mode: "Ionian", scale: ["A", "B", "C#", "D", "E", "F#", "G#"] },
  {
    tonic: "E",
    mode: "Ionian",
    scale: ["E", "F#", "G#", "A", "B", "C#", "D#"],
  },
  {
    tonic: "B",
    mode: "Ionian",
    scale: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
  },
  {
    tonic: "F#",
    mode: "Ionian",
    scale: ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
  },
  {
    tonic: "C#",
    mode: "Ionian",
    scale: ["C#", "D#", "E#", "F#", "G#", "A#", "B#"],
  },
  { tonic: "F", mode: "Ionian", scale: ["F", "G", "A", "B♭", "C", "D", "E"] },
  { tonic: "B♭", mode: "Ionian", scale: ["B♭", "C", "D", "E♭", "F", "G", "A"] },
  {
    tonic: "E♭",
    mode: "Ionian",
    scale: ["E♭", "F", "G", "A♭", "B♭", "C", "D"],
  },
  {
    tonic: "A♭",
    mode: "Ionian",
    scale: ["A♭", "B♭", "C", "D♭", "E♭", "F", "G"],
  },

  /** Minor (Aeolian) keys */
  { tonic: "A", mode: "Aeolian", scale: ["A", "B", "C", "D", "E", "F", "G"] },
  { tonic: "E", mode: "Aeolian", scale: ["E", "F#", "G", "A", "B", "C", "D"] },
  { tonic: "B", mode: "Aeolian", scale: ["B", "C#", "D", "E", "F#", "G", "A"] },
  {
    tonic: "F#",
    mode: "Aeolian",
    scale: ["F#", "G#", "A", "B", "C#", "D", "E"],
  },
  {
    tonic: "C#",
    mode: "Aeolian",
    scale: ["C#", "D#", "E", "F#", "G#", "A", "B"],
  },
  {
    tonic: "G#",
    mode: "Aeolian",
    scale: ["G#", "A#", "B", "C#", "D#", "E", "F#"],
  },
  {
    tonic: "D#",
    mode: "Aeolian",
    scale: ["D#", "E#", "F#", "G#", "A#", "B", "C#"],
  },
  {
    tonic: "A#",
    mode: "Aeolian",
    scale: ["A#", "B#", "C#", "D#", "E#", "F#", "G#"],
  },
  { tonic: "D", mode: "Aeolian", scale: ["D", "E", "F", "G", "A", "B♭", "C"] },
  { tonic: "G", mode: "Aeolian", scale: ["G", "A", "B♭", "C", "D", "E♭", "F"] },
  {
    tonic: "C",
    mode: "Aeolian",
    scale: ["C", "D", "E♭", "F", "G", "A♭", "B♭"],
  },
  {
    tonic: "F",
    mode: "Aeolian",
    scale: ["F", "G", "A♭", "B♭", "C", "D♭", "E♭"],
  },
];

/**
 * Return all allowed keys (shallow copy).
 * Returns a copy of the 24 allowed diatonic keys (12 major Ionian + 12 minor Aeolian).
 * @returns Array of all 24 allowed keys with their scales
 */
export function getAllAllowedKeys(): Key[] {
  return ALLOWED_KEYS.slice();
}

/** Ordered tonic lists for UI selection following the circle of fifths.
 *
 * The arrays contain the underlying tonic values used for selection (must match
 * `ALLOWED_KEYS` tonics). Display labels can show enharmonic pairs (slash)
 * according to the selected mode.
 */
export const MAJOR_TONICS_ORDER: Note[] = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F#",
  "C#",
  "A♭",
  "E♭",
  "B♭",
  "F",
];

export const MINOR_TONICS_ORDER: Note[] = [
  "A",
  "E",
  "B",
  "F#",
  "C#",
  "G#",
  "D#",
  "A#",
  "F",
  "C",
  "G",
  "D",
];

/**
 * Get the list of major (Ionian) tonics in circle of fifths order.
 * @returns Array of 12 major tonics ordered for UI display
 */
export function getMajorTonics(): Note[] {
  return MAJOR_TONICS_ORDER.slice();
}

/**
 * Get the list of minor (Aeolian) tonics in circle of fifths order.
 * @returns Array of 12 minor tonics ordered for UI display
 */
export function getMinorTonics(): Note[] {
  return MINOR_TONICS_ORDER.slice();
}

/**
 * Display labels for tonics depending on mode (major/minor).
 * These control how a tonic is shown on the UI (e.g. "B/C♭", "G♭/F#").
 */
const TONIC_DISPLAY_MAJOR: Record<string, string> = {
  C: "C",
  G: "G",
  D: "D",
  A: "A",
  E: "E",
  B: "B/C♭",
  "F#": "G♭/F#",
  "C#": "D♭/C#",
  "A♭": "A♭",
  "E♭": "E♭",
  "B♭": "B♭",
  F: "F",
};

const TONIC_DISPLAY_MINOR: Record<string, string> = {
  A: "A",
  E: "E",
  B: "B",
  "F#": "F#",
  "C#": "C#",
  "G#": "G#",
  "D#": "E♭",
  "A#": "B♭",
  F: "F",
  C: "C",
  G: "G",
  D: "D",
};

/**
 * Return the UI label for a tonic in the given mode.
 * For major (Ionian) mode, may show enharmonic equivalents like "G♭/F#".
 * For minor (Aeolian) mode, may show simplified spellings like "E♭" for "D#".
 * @param tonic The note to display
 * @param mode The musical mode (Ionian or Aeolian)
 * @returns The formatted display label for the tonic
 */
export function getTonicDisplayLabel(
  tonic: Note,
  mode: "Ionian" | "Aeolian"
): string {
  return mode === "Ionian"
    ? TONIC_DISPLAY_MAJOR[tonic as string] ?? tonic
    : TONIC_DISPLAY_MINOR[tonic as string] ?? tonic;
}
