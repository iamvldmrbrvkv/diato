import { Box, Card, CardContent, Typography, Chip, Stack } from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import type { Chord, Key } from "../music/types";
import { getTonicDisplayLabel } from "../music/keys";
import PianoPlayer from "../music/PianoPlayer";

/**
 * Props for KeyResults component
 */
export interface KeyResultsProps {
  results: { key: Key; availableChords: Chord[] }[];
  selectedCount?: number;
  selectedChords?: Chord[];
}

/**
 * Formats the key name as "C major" or "A minor"
 * @param key The key object
 * @returns Formatted key name
 */
function formatKeyName(key: Key): string {
  const label = getTonicDisplayLabel(key.tonic, key.mode);
  return `${label} ${key.mode === "Ionian" ? "major" : "minor"}`;
}

/**
 * Displays a list of matching keys and available diatonic chords
 * @param results Array of matching keys and their available chords
 */
function KeyResults({
  results,
  selectedCount = 0,
  selectedChords = [],
}: KeyResultsProps) {
  return (
    <Box mt={2}>
      <Typography variant="subtitle1" sx={{ lineHeight: 1, mb: 1 }}>
        {selectedCount > 0 ? "Keys containing selected triads" : "All keys"}
      </Typography>
      {selectedCount === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          No triads selected - displaying all keys and their diatonic chords.
        </Typography>
      ) : null}

      {results.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center">
          No matching keys found
        </Typography>
      ) : (
        <Stack spacing={2}>
          {results.map(({ key, availableChords }, idx) => (
            <Card
              key={idx}
              variant="outlined"
              sx={{ bgcolor: "background.paper" }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <MusicNoteIcon fontSize="small" />
                  {formatKeyName(key)}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Available chords:
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.5}
                  flexWrap="wrap"
                  sx={{ columnGap: 1, rowGap: 1 }}
                  alignItems="center"
                >
                  {availableChords.map((chord, i) => {
                    const isSelected = selectedChords.some(
                      (s) => s.root === chord.root && s.quality === chord.quality
                    );
                    return (
                      <Chip
                        key={i}
                        label={`${chord.root}${
                          chord.quality === "major"
                            ? ""
                            : chord.quality === "minor"
                            ? "m"
                            : "dim"
                        } (${chord.degree})`}
                        color={isSelected ? "primary" : "default"}
                        size="medium"
                        onClick={() => {
                          // Compute the triad notes from this key's diatonic chords
                          const rootIdx = chord.degree - 1;
                          const thirdIdx = (rootIdx + 2) % availableChords.length;
                          const fifthIdx = (rootIdx + 4) % availableChords.length;
                          const triad = [
                            availableChords[rootIdx].root,
                            availableChords[thirdIdx].root,
                            availableChords[fifthIdx].root,
                          ];
                          PianoPlayer.playChord(triad);
                        }}
                        sx={{ cursor: "pointer", m: 0.25 }}
                      />
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default KeyResults;
