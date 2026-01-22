import { Box, IconButton, Typography, useTheme } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { Chord } from "../music/types";
import PianoPlayer from "../music/PianoPlayer";

/**
 * Props for ChordSelectorCircle component
 */
export interface ChordSelectorCircleProps {
  diatonicChords: Chord[];
  selectedChords: Chord[];
  onSelect: (chord: Chord) => void;
  onReset: () => void;
}

/**
 * Renders a circle of fifths for chord selection.
 * Displays diatonic chords as interactive buttons arranged in a circular pattern.
 * Supports multiple rings for keys with more than 12 diatonic chords.
 * @param diatonicChords Array of diatonic chords for the selected key
 * @param selectedChords Array of currently selected chords
 * @param onSelect Callback when a chord is selected/deselected
 * @param onReset Callback to reset selection
 * @returns React component displaying the chord selector circle
 */
function ChordSelectorCircle({
  diatonicChords,
  selectedChords,
  onSelect,
  onReset,
}: ChordSelectorCircleProps) {
  const theme = useTheme();
  const size = 320;
  const center = size / 2;
  const radius = size / 2 - 48;
  const chordCount = diatonicChords.length;
  const maxPerRing = 12;
  const rings = Math.max(1, Math.ceil(chordCount / maxPerRing));
  const perRing = Math.ceil(chordCount / rings);
  const baseButtonSize = rings === 1 ? 56 : Math.max(36, 56 - (rings - 1) * 8);

  return (
    <Box position="relative" width={size} height={size} mx="auto" my={2}>
      {/* Reset button */}
      <IconButton
        aria-label="Reset selection"
        onClick={onReset}
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}
        size="large"
      >
        <RefreshIcon fontSize="inherit" />
      </IconButton>
      {/* Chord circle */}
      {diatonicChords.map((chord, i) => {
        const ringIndex = Math.floor(i / perRing);
        const indexInRing = i - ringIndex * perRing;
        const itemsInThisRing = Math.min(
          perRing,
          chordCount - ringIndex * perRing
        );
        const angle =
          (2 * Math.PI * indexInRing) / itemsInThisRing - Math.PI / 2;
        /** Spread rings evenly from outer `radius` inward to avoid collapsing to center. */
        const ringRadiusRaw = Math.round(
          radius * (1 - ringIndex / (rings + 1))
        );
        const ringRadius = Math.max(48, ringRadiusRaw);
        /** Decrease button size progressively for inner rings to avoid overlap. */
        const btnSize = Math.max(
          20,
          Math.round(baseButtonSize * Math.pow(0.85, ringIndex))
        );
        const x = center + ringRadius * Math.cos(angle);
        const y = center + ringRadius * Math.sin(angle);
        /** On mobile, remove focus/hover delay so selection updates immediately on tap. */
        const selected = selectedChords.some(
          (sel) => sel.root === chord.root && sel.quality === chord.quality
        );
        return (
          <IconButton
              key={i}
              onClick={() => {
                // compute triad notes from the diatonicChords array using degree
                const rootIdx = chord.degree - 1;
                const thirdIdx = (rootIdx + 2) % diatonicChords.length;
                const fifthIdx = (rootIdx + 4) % diatonicChords.length;
                const triad = [
                  diatonicChords[rootIdx].root,
                  diatonicChords[thirdIdx].root,
                  diatonicChords[fifthIdx].root,
                ];
                PianoPlayer.playChord(triad);
                onSelect(chord);
              }}
            sx={{
              position: "absolute",
              left: x - btnSize / 2,
              top: y - btnSize / 2,
              width: btnSize,
              height: btnSize,
              bgcolor: selected
                ? theme.palette.primary.main
                : theme.palette.background.paper,
              color: selected
                ? theme.palette.primary.contrastText
                : theme.palette.text.primary,
              border: selected
                ? `2px solid ${theme.palette.primary.light}`
                : "1px solid",
              borderColor: selected
                ? theme.palette.primary.light
                : theme.palette.divider,
              boxShadow: selected ? 4 : 1,
              transition: "all 0.2s",
              zIndex: rings - ringIndex,
              /** Remove default MUI hover/focus highlight on mobile for immediate feedback. */
              "&:hover, &:focus, &:active": {
                bgcolor: selected
                  ? theme.palette.primary.main
                  : theme.palette.background.paper,
                color: selected
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
                borderColor: theme.palette.primary.light,
                boxShadow: 3,
                zIndex: rings - ringIndex + 1,
              },
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
            size={btnSize >= 48 ? "large" : btnSize >= 36 ? "medium" : "small"}
          >
            <Typography
              variant={btnSize >= 40 ? "subtitle2" : "caption"}
              fontWeight={selected ? 700 : 400}
              sx={{ lineHeight: 1 }}
            >
              {chord.root}
              {chord.quality === "major"
                ? ""
                : chord.quality === "minor"
                ? "m"
                : "dim"}
            </Typography>
          </IconButton>
        );
      })}
    </Box>
  );
}

export default ChordSelectorCircle;
