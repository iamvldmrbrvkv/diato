/**
 * Enum representing all 12 chromatic notes (C, C#, D, ... B)
 */

/**
 * All 12 chromatic notes as string literal union
 */
export type Note =
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'
  | 'A'
  | 'A#'
  | 'B';

/**
 * Enum for musical modes: Ionian (major) and Aeolian (natural minor)
 */

/**
 * Musical mode: Ionian (major) or Aeolian (minor)
 */
export type Mode = 'Ionian' | 'Aeolian';

/**
 * Represents a diatonic triad chord (root note, mode, degree)
 */

/**
 * Represents a diatonic triad chord (root note, mode, degree)
 */
export interface Chord {
  root: Note;
  mode: Mode;
  degree: number; // 1-7 (scale degree)
  quality: 'major' | 'minor' | 'diminished';
}

/**
 * Represents a musical key (tonality)
 */

/**
 * Represents a musical key (tonality)
 */
export interface Key {
  tonic: Note;
  mode: Mode;
}
