import type { Note, Mode, Chord, Key } from "./types";
import { getAllAllowedKeys, getMajorTonics, getMinorTonics } from "./keys";

/**
 * Build a diatonic scale for a given tonic and mode using the explicit
 * allowed key definitions. If the key is not in the allowed list, an empty
 * array is returned.
 */
export function buildScale(tonic: Note, mode: Mode): Note[] {
  const keys = getAllAllowedKeys();
  const found = keys.find((k) => k.tonic === tonic && k.mode === mode);
  return found?.scale ? found.scale.slice() : [];
}

/**
 * Build all diatonic triads for a key
 */
export function buildDiatonicChords(key: Key): Chord[] {
  const scale =
    key.scale && key.scale.length === 7
      ? key.scale
      : buildScale(key.tonic, key.mode);
  const qualities =
    key.mode === "Ionian"
      ? ([
          "major",
          "minor",
          "minor",
          "major",
          "major",
          "minor",
          "diminished",
        ] as const)
      : ([
          "minor",
          "diminished",
          "major",
          "minor",
          "minor",
          "major",
          "major",
        ] as const);
  return scale.map((note, i) => ({
    root: note,
    mode: key.mode,
    degree: i + 1,
    quality: qualities[i],
  }));
}

/**
 * Return the explicit list of allowed keys (24 keys).
 */
export function getAllKeys(): Key[] {
  return getAllAllowedKeys();
}

/**
 * Build a list of all possible triads (major, minor, diminished) for every root.
 * This is used in the "free" selection mode where user picks chords freely.
 */
export function buildAllTriads(): Chord[] {
  /**
   * Build an explicit set of 36 triads required by the app:
   * - 12 major triads: degree I of each allowed major (Ionian) key
   * - 12 minor triads: degree I of each allowed minor (Aeolian) key
   * - 12 diminished triads: degree VII (vii°) of each allowed major key
   * Order: majors (12), minors (12), diminished (12).
   */
  const triads: Chord[] = [];
  const majorTonics = getMajorTonics();
  const minorTonics = getMinorTonics();
  const allowed = getAllAllowedKeys();

  /** Majors: degree I triad of each major (Ionian) key. */
  for (const tonic of majorTonics) {
    const key = allowed.find((k) => k.tonic === tonic && k.mode === "Ionian");
    if (!key || !key.scale) continue;
    triads.push({
      root: key.scale[0],
      mode: "Ionian",
      degree: 1,
      quality: "major",
    });
  }

  /** Minors: degree I triad of each minor (Aeolian) key. */
  for (const tonic of minorTonics) {
    const key = allowed.find((k) => k.tonic === tonic && k.mode === "Aeolian");
    if (!key || !key.scale) continue;
    triads.push({
      root: key.scale[0],
      mode: "Aeolian",
      degree: 1,
      quality: "minor",
    });
  }

  /** Diminished: degree VII (vii°) triad of each major key (degree 7). */
  for (const tonic of majorTonics) {
    const key = allowed.find((k) => k.tonic === tonic && k.mode === "Ionian");
    if (!key || !key.scale) continue;
    triads.push({
      root: key.scale[6],
      mode: "Ionian",
      degree: 7,
      quality: "diminished",
    });
  }

  return triads;
}

/**
 * Find all keys where all selected chords are diatonic
 */
export function findMatchingKeys(
  selectedChords: Chord[]
): { key: Key; availableChords: Chord[] }[] {
  return getAllKeys()
    .map((key) => {
      const diatonic = buildDiatonicChords(key);
      /**
       * A selected chord is considered present in a key when the key's diatonic
       * triads contain a chord with the same root and triad quality.
       */
      const matches = selectedChords.every((sel) =>
        diatonic.some(
          (chord) => chord.root === sel.root && chord.quality === sel.quality
        )
      );
      if (!matches) return null;

      const availableChords = diatonic.slice();
      return { key, availableChords };
    })
    .filter(Boolean) as { key: Key; availableChords: Chord[] }[];
}
