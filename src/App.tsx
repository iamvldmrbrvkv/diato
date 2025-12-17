
import { useMemo, useState, useEffect, type MouseEvent } from 'react';
import { ThemeProvider, CssBaseline, createTheme, useMediaQuery, Container, Typography, Box, ToggleButton, ToggleButtonGroup, Tooltip, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ComputerIcon from '@mui/icons-material/Computer';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import type { Note, Mode, Chord } from './music/types';
import { buildDiatonicChords, buildAllTriads, findMatchingKeys } from './music/logic';
import { ChordSelectorCircle } from './components/ChordSelectorCircle';
import { ChordTable } from './components/ChordTable';
import { KeyResults } from './components/KeyResults';

/**
 * Main application component: chord selection, analysis, and results display
 */
export function App() {
  // Theme preference: 'system' | 'light' | 'dark'
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [themePref, setThemePref] = useState<'system' | 'light' | 'dark'>(() => {
    try {
      const v = localStorage.getItem('diato.theme');
      return (v as 'system' | 'light' | 'dark') || 'system';
    } catch {
      return 'system';
    }
  });
  const effectiveMode = themePref === 'system' ? (prefersDark ? 'dark' : 'light') : themePref;
  const theme = useMemo(() => createTheme({ palette: { mode: effectiveMode } }), [effectiveMode]);

  useEffect(() => {
    try {
      localStorage.setItem('diato.theme', themePref);
    } catch {
      /* ignore */
    }
  }, [themePref]);

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

  // Cycle theme preference: system -> light -> dark -> system
  const handleCycleClick = () => {
    setThemePref(p => {
      if (p === 'system') return 'light';
      if (p === 'light') return 'dark';
      return 'system';
    });
  };

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
          <Box display="flex" alignItems="center">
            <Tooltip
              title={
                <Box sx={{ maxWidth: 340 }}>
                  <Typography variant="body2">
                    About this app: Select triads (three-note chords) by clicking the circular chord nodes
                    or table entries to discover all major and minor keys where those chords occur diatonically.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Modes:</strong> <em>By Key</em> — choose a tonic and mode to display that key's
                    diatonic triads; <em>Free</em> — browse all triads and select any combination.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Use the toggles to switch views. Click a chord to toggle selection; selected chords appear in
                    the results showing matching keys and remaining available diatonic chords. Use the reset control
                    to clear your selections.
                  </Typography>
                </Box>
              }
              arrow
            >
              <IconButton
                aria-label="Help"
                sx={{
                  color: 'text.secondary',
                  mr: 1,
                  p: 0,
                  minWidth: 'auto',
                  fontSize: 28,
                  lineHeight: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <HelpOutlineIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                themePref === 'system'
                  ? (effectiveMode === 'dark'
                      ? `System theme: dark (click to choose light)`
                      : `System theme: light (click to choose dark)`)
                  : themePref === 'light'
                  ? 'Light theme (click to switch to dark)'
                  : 'Dark theme (click to switch to system)'
              }
              arrow
            >
              <IconButton
                aria-label={
                  themePref === 'system'
                    ? 'System theme'
                    : themePref === 'light'
                    ? 'Light theme'
                    : 'Dark theme'
                }
                onClick={handleCycleClick}
                sx={{
                  color: 'inherit',
                  p: 0,
                  minWidth: 'auto',
                  fontSize: 28,
                  lineHeight: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {themePref === 'system' ? (
                  <ComputerIcon fontSize="inherit" />
                ) : themePref === 'light' ? (
                  <LightModeIcon fontSize="inherit" />
                ) : (
                  <DarkModeIcon fontSize="inherit" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box mb={2}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_: React.MouseEvent<HTMLElement>, v: 'key' | 'free' | null) => v && setViewMode(v)}
                size="small"
                fullWidth
                sx={{
                  mb: 1,
                  width: '100%',
                  '& .MuiToggleButton-root': {
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'border-color 150ms, box-shadow 150ms',
                  },
                  '& .MuiToggleButton-root:hover, & .MuiToggleButton-root.Mui-selected': {
                    borderColor: 'primary.light',
                    zIndex: 1,
                  }
                }}
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
                  sx={{
                    mb: 1,
                    width: '100%',
                    '& .MuiToggleButton-root': {
                      border: '1px solid',
                      borderColor: 'divider'
                    },
                    '& .MuiToggleButton-root:hover, & .MuiToggleButton-root.Mui-selected': {
                      borderColor: 'primary.light',
                      zIndex: 1
                    }
                  }}
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
                  sx={{
                    flexWrap: 'wrap',
                    width: '100%',
                    mb: 1,
                    gap: 0.5,
                    '& .MuiToggleButton-root': {
                      border: '1px solid',
                      borderColor: 'divider'
                    },
                    '& .MuiToggleButton-root:hover, & .MuiToggleButton-root.Mui-selected': {
                      borderColor: 'primary.light',
                      zIndex: 1
                    }
                  }}
                >
                  {(['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as Note[]).map(note => (
                    <ToggleButton key={note} value={note} sx={{ flex: 1, minWidth: 0, mb: 0.5 }}>{note}</ToggleButton>
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
