/**
 * Note names and musical types used across the app.
 * - `Note` is a string (implementation enforces valid spellings elsewhere).
 * - `Mode` is either 'Ionian' (major) or 'Aeolian' (natural minor).
 */
export type Note = string;

/** Musical mode: Ionian (major) or Aeolian (minor) */
export type Mode = "Ionian" | "Aeolian";

/**
 * Represents a diatonic triad chord (root note, mode, degree)
 */
export interface Chord {
  root: Note;
  mode: Mode;
  /** Scale degree within the diatonic scale (1-7). */
  degree: number;
  quality: "major" | "minor" | "diminished";
}

/**
 * Represents a musical key (tonality)
 */
export interface Key {
  tonic: Note;
  mode: Mode;
  /** Optional explicit scale (7 notes) for this key. Implementation provides these. */
  scale?: Note[];
}
