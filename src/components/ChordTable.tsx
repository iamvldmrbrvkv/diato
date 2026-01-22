import { Box, IconButton, Chip, Typography, Stack } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { Chord } from "../music/types";
import PianoPlayer from "../music/PianoPlayer";
import { getAllAllowedKeys } from "../music/keys";
import { buildDiatonicChords } from "../music/logic";

export interface ChordTableProps {
  triads: Chord[];
  selectedChords: Chord[];
  /** Toggle callback: should return true if chord is selected after toggle. */
  onToggle: (chord: Chord) => boolean;
  onReset: () => void;
}

/**
 * Simple responsive table/grid for selecting chords in Free mode.
 * Shows triads as tappable chips with root+quality and a reset button.
 * Plays audio feedback when a chord is selected.
 * @param triads Array of all available triads to display
 * @param selectedChords Array of currently selected chords
 * @param onToggle Toggle callback: should return true if chord is selected after toggle
 * @param onReset Callback to reset all selections
 * @returns React component displaying the chord table
 */
export function ChordTable({
  triads,
  selectedChords,
  onToggle,
  onReset,
}: ChordTableProps) {
  return (
    <Box my={0.5}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={0.5}
      >
        <Typography variant="subtitle1" sx={{ lineHeight: 1 }}>
          All available triads
        </Typography>
        <IconButton
          aria-label="Reset selection"
          onClick={onReset}
          size="medium"
        >
          <RefreshIcon fontSize="inherit" />
        </IconButton>
      </Box>
      <Stack
        direction="row"
        spacing={0.5}
        flexWrap="wrap"
        sx={{ columnGap: 1, rowGap: 1 }}
      >
        {triads.map((t, i) => {
          const selected = selectedChords.some(
            (s) => s.root === t.root && s.quality === t.quality
          );
          const label = `${t.root}${
            t.quality === "major" ? "" : t.quality === "minor" ? "m" : "dim"
          }`;
          return (
            <Chip
              key={i}
              label={label}
              onClick={() => {
                try {
                  const keys = getAllAllowedKeys();
                  for (const k of keys) {
                    const diat = buildDiatonicChords(k);
                    const match = diat.find(
                      (ch) => ch.root === t.root && ch.quality === t.quality
                    );
                    if (match) {
                      const rootIdx = match.degree - 1;
                      const thirdIdx = (rootIdx + 2) % diat.length;
                      const fifthIdx = (rootIdx + 4) % diat.length;
                      const triad = [
                        diat[rootIdx].root,
                        diat[thirdIdx].root,
                        diat[fifthIdx].root,
                      ];
                      let becameSelected = true;
                      try {
                        becameSelected = onToggle ? onToggle(t) : true;
                      } catch (err) {
                        console.warn("ChordTable: onToggle failed", err);
                      }
                      if (!becameSelected) break;
                      try {
                        PianoPlayer.stopSequence(40);
                      } catch (err) {
                        console.warn("ChordTable: stopSequence failed", err);
                      }
                      PianoPlayer.playChord(triad);
                      break;
                    }
                  }
                } catch (err) {
                  console.warn("ChordTable: playback failed", err);
                }
              }}
              color={selected ? "primary" : "default"}
              size="medium"
              sx={{ cursor: "pointer", m: 0.25 }}
            />
          );
        })}
      </Stack>
    </Box>
  );
}

export default ChordTable;
