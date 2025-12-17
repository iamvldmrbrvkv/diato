
import { useMemo, useState, type MouseEvent } from 'react';
import { ThemeProvider, CssBaseline, createTheme, useMediaQuery, Container, Typography, Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import type { Note, Mode, Chord } from './music/types';
import { buildDiatonicChords, buildAllTriads, findMatchingKeys } from './music/logic';
import { ChordSelectorCircle } from './components/ChordSelectorCircle';
import { ChordTable } from './components/ChordTable';
import { KeyResults } from './components/KeyResults';

/**
 * Main application component: chord selection, analysis, and results display
 */
export function App() {
  // Dark theme by default, supports system preference
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'dark' | 'light'>(prefersDark ? 'dark' : 'light');
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  // Selected chords state
  const [selectedChords, setSelectedChords] = useState<Chord[]>([]);

  // For the circle: show only chords of one key (Ionian or Aeolian)
  const [selectorMode, setSelectorMode] = useState<Mode>('Ionian');
  const [selectorTonic, setSelectorTonic] = useState<Note>('C');
  // View mode: 'key' - choose tonic+mode and show that key's diatonic chords;
  // 'free' - show an overall circle of all possible triads to pick from.
  const [viewMode, setViewMode] = useState<'key' | 'free'>('key');
  const diatonicChords = useMemo(() =>
    viewMode === 'key' ? buildDiatonicChords({ tonic: selectorTonic, mode: selectorMode }) : buildAllTriads()
  , [selectorTonic, selectorMode, viewMode]);

  // Analyze selected chords
  const results = useMemo(() => findMatchingKeys(selectedChords), [selectedChords]);

  // Reset selection
  const handleReset = () => setSelectedChords([]);

  // Toggle theme
  const handleThemeToggle = () => setMode(m => (m === 'dark' ? 'light' : 'dark'));

  // Change mode/tonic for the circle
  const handleSelectorMode = (_: MouseEvent<HTMLElement>, value: Mode | null) => {
    if (value) setSelectorMode(value);
  };
  const handleSelectorTonic = (_: MouseEvent<HTMLElement>, value: Note | null) => {
    if (value) setSelectorTonic(value);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ minHeight: '100vh', py: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight={700}>
            Diatonic Harmony
          </Typography>
          <Tooltip
            title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            arrow
          >
            <span
              style={{ fontSize: 28, display: 'inline-block', lineHeight: 1, cursor: 'pointer' }}
              tabIndex={0}
              role="button"
              aria-label={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              onClick={handleThemeToggle}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') handleThemeToggle();
              }}
            >
              {mode === 'dark' ? '☀️' : '🌙'}
            </span>
          </Tooltip>
        </Box>
        <Box mb={2}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_: React.MouseEvent<HTMLElement>, v: 'key' | 'free' | null) => v && setViewMode(v)}
            size="small"
            fullWidth
            sx={{ mb: 1, width: '100%' }}
          >
            <ToggleButton value="key" sx={{ flex: 1, minWidth: 0 }}>By Key</ToggleButton>
            <ToggleButton value="free" sx={{ flex: 1, minWidth: 0 }}>Free</ToggleButton>
          </ToggleButtonGroup>
          {viewMode === 'key' && (
            <ToggleButtonGroup
              value={selectorMode}
              exclusive
              onChange={handleSelectorMode}
              size="small"
              fullWidth
              sx={{ mb: 1, width: '100%' }}
            >
              <ToggleButton value="Ionian" sx={{ flex: 1, minWidth: 0 }}>Major</ToggleButton>
              <ToggleButton value="Aeolian" sx={{ flex: 1, minWidth: 0 }}>Minor</ToggleButton>
            </ToggleButtonGroup>
          )}
          {viewMode === 'key' && (
            <ToggleButtonGroup
              value={selectorTonic}
              exclusive
              onChange={handleSelectorTonic}
              size="small"
              fullWidth
              sx={{ flexWrap: 'wrap', width: '100%' }}
            >
              {(['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as Note[]).map(note => (
                <ToggleButton key={note} value={note} sx={{ flex: 1, minWidth: 0 }}>{note}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        </Box>
        {viewMode === 'key' ? (
          <ChordSelectorCircle
            diatonicChords={diatonicChords}
            selectedChords={selectedChords}
            onSelect={chord => {
              setSelectedChords(selected =>
                selected.some(
                  sel => sel.root === chord.root && sel.mode === chord.mode && sel.degree === chord.degree
                )
                  ? selected.filter(
                      sel => !(sel.root === chord.root && sel.mode === chord.mode && sel.degree === chord.degree)
                    )
                  : [...selected, chord]
              );
            }}
            onReset={handleReset}
          />
        ) : (
          <ChordTable
            triads={diatonicChords}
            selectedChords={selectedChords}
            onToggle={chord => {
              setSelectedChords(selected =>
                selected.some(s => s.root === chord.root && s.quality === chord.quality && s.degree === chord.degree)
                  ? selected.filter(s => !(s.root === chord.root && s.quality === chord.quality && s.degree === chord.degree))
                  : [...selected, chord]
              );
            }}
            onReset={handleReset}
          />
        )}
        <KeyResults results={results} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
