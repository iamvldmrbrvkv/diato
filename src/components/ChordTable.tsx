import { Box, IconButton, Chip, Typography, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { Chord } from '../music/types';

export interface ChordTableProps {
  triads: Chord[];
  selectedChords: Chord[];
  onToggle: (chord: Chord) => void;
  onReset: () => void;
}

/**
 * Simple responsive table/grid for selecting chords in Free mode.
 * Shows triads as tappable chips with root+quality and a reset button.
 */
export function ChordTable({ triads, selectedChords, onToggle, onReset }: ChordTableProps) {
  return (
    <Box my={0.5}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
        <Typography variant="subtitle1" sx={{ lineHeight: 1 }}>
          All available triads
        </Typography>
        <IconButton aria-label="Reset selection" onClick={onReset} size="medium">
          <RefreshIcon fontSize="inherit" />
        </IconButton>
      </Box>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ columnGap: 1, rowGap: 1 }}>
        {triads.map((t, i) => {
          const selected = selectedChords.some(
            s => s.root === t.root && s.quality === t.quality && s.degree === t.degree
          );
          const label = `${t.root}${t.quality === 'major' ? '' : t.quality === 'minor' ? 'm' : 'dim'}`;
          return (
            <Chip
              key={i}
              label={label}
              onClick={() => onToggle(t)}
              color={selected ? 'primary' : 'default'}
              size="small"
              sx={{ cursor: 'pointer', m: 0.25 }}
            />
          );
        })}
      </Stack>
    </Box>
  );
}

export default ChordTable;
