# Copilot Instructions

- All code must have English jsdoc comments for every function and component.
- For debugging and result verification, always open MCP Chrome DevTools and check the result visually.

## Application Logic

This is a React + TypeScript + MUI web application for diatonic harmony analysis without modulations.

### Core Functionality

- **Chord Selection**: User visually selects triads from Ionian (major) and Aeolian (natural minor) modes using a circle of fifths interface.
- **Key Analysis**: Application analyzes selected chords and finds all possible intersecting keys (major and minor) where these chords are diatonic.
- **Results Display**: For each matching key, shows the key name (e.g., "C major", "A minor") and the list of remaining available diatonic chords.

### Musical Constraints

- Only 12 chromatic notes (no microchromatics).
- Only diatonic triads.
- No modulations, borrowed chords, secondary dominants, harmonic/melodic minor.
- Ionian and Aeolian modes are treated as equal and can intersect (relative keys: C major ↔ A minor).

### Analysis Logic

1. **Key Generation**: Generate all 24 keys (12 major, 12 minor).
2. **Chord Building**: For each key, build 7 diatonic triads.
3. **Matching**: A key matches if ALL selected chords are present in its diatonic set.
4. **Available Chords**: Remaining chords = diatonic chords of the key - selected chords.
5. **Ambiguity**: Show both major and minor keys if they have identical chord sets (no automatic "correct" choice).

### Technical Requirements

- React + TypeScript + MUI (latest version).
- Strong typing for musical entities: Note, Chord, Mode, Key.
- Music logic separated from UI (pure functions).
- Mobile-responsive design with dark theme support.
- Clean architecture, extensible for future modes (Dorian, Mixolydian, etc.).
