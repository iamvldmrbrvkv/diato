import { Box, Card, CardContent, Typography, Chip, Stack } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import type { Chord, Key } from '../music/types';

/**
 * Props for KeyResults component
 */
export interface KeyResultsProps {
  results: { key: Key; availableChords: Chord[] }[];
}

/**
 * Formats the key name as "C major" or "A minor"
 * @param key The key object
 * @returns Formatted key name
 */
function formatKeyName(key: Key): string {
  return `${key.tonic} ${key.mode === 'Ionian' ? 'major' : 'minor'}`;
}

/**
 * Displays a list of matching keys and available diatonic chords
 * @param results Array of matching keys and their available chords
 */
export function KeyResults({ results }: KeyResultsProps) {
  return (
    <Box mt={2}>
      {results.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center">
          No matching keys found
        </Typography>
      ) : (
        <Stack spacing={2}>
          {results.map(({ key, availableChords }, idx) => (
            <Card key={idx} variant="outlined" sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MusicNoteIcon fontSize="small" />
                  {formatKeyName(key)}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Available chords:
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ columnGap: 1, rowGap: 1 }}>
                  {availableChords.map((chord, i) => (
                    <Chip
                      key={i}
                      label={`${chord.root}${chord.quality === 'major' ? '' : chord.quality === 'minor' ? 'm' : 'dim'} (${chord.degree})`}
                      color="default"
                      size="small"
                      sx={{ cursor: 'default', m: 0.25 }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
