import { useMemo, useState, useEffect, type MouseEvent } from "react";
import {
  ThemeProvider,
  CssBaseline,
  createTheme,
  useMediaQuery,
  Container,
  Typography,
  Box,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ComputerIcon from "@mui/icons-material/Computer";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { Note, Mode, Chord } from "./music/types";
import {
  buildDiatonicChords,
  buildAllTriads,
  findMatchingKeys,
} from "./music/logic";
import CircleOfFifths from "./components/CircleOfFifths";
import ChordTable from "./components/ChordTable";
import KeyResults from "./components/KeyResults";

/**
 * Main application component: chord selection, analysis, and results display
 */
export function App() {
  /** Theme preference: one of 'system' | 'light' | 'dark'. Stored in localStorage. */
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [themePref, setThemePref] = useState<"system" | "light" | "dark">(
    () => {
      try {
        const v = localStorage.getItem("diato.theme");
        return (v as "system" | "light" | "dark") || "system";
      } catch {
        return "system";
      }
    }
  );
  const effectiveMode =
    themePref === "system" ? (prefersDark ? "dark" : "light") : themePref;
  const theme = useMemo(
    () => createTheme({ palette: { mode: effectiveMode } }),
    [effectiveMode]
  );

  useEffect(() => {
    try {
      localStorage.setItem("diato.theme", themePref);
    } catch {
      /* ignore */
    }
  }, [themePref]);

  /** State: currently selected chords. */
  const [selectedChords, setSelectedChords] = useState<Chord[]>([]);

  /** View mode: 'byKey' shows the circle; 'free' shows all triads. */
  const [viewMode, setViewMode] = useState<"byKey" | "free">("byKey");

  /** Selected tonic and mode for the key selector. */
  const [selectorMode, setSelectorMode] = useState<Mode>("Ionian");
  const [selectorTonic, setSelectorTonic] = useState<Note>("C");
  /** Diatonic chords for the selected tonic/mode. */
  const diatonicChords = useMemo(
    () => buildDiatonicChords({ tonic: selectorTonic, mode: selectorMode }),
    [selectorTonic, selectorMode]
  );

  /** Analyze currently selected chords and compute matching keys. */
  const results = useMemo(
    () => findMatchingKeys(selectedChords),
    [selectedChords]
  );

  /** Reset chord selection to an empty array. */
  const handleReset = () => setSelectedChords([]);

  /** Cycle theme preference: system -> light -> dark -> system. */
  const handleCycleClick = () => {
    setThemePref((p) => {
      if (p === "system") return "light";
      if (p === "light") return "dark";
      return "system";
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ minHeight: "100vh", py: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          sx={{ position: "relative" }}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
          >
            Diato
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Box display="flex" alignItems="center">
            <Tooltip
              title={
                <Box sx={{ maxWidth: 420 }}>
                  <Typography variant="body2">
                    This app helps you discover keys and diatonic chords from a
                    small set of chosen triads — useful when you're starting to
                    write music and want harmony suggestions.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    The circle has two rings: the outer ring shows Ionian
                    (Major) tonics, the inner ring shows Aeolian (Natural Minor)
                    tonics. Pick a tonic on the circle to view that key's
                    diatonic triads, then choose chords from that key.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected triads (from the circle or the triad table) are
                    analyzed below: the app lists all major/minor keys that
                    contain those chords diatonically and shows which other
                    diatonic chords remain available in each matching key.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Supported modes: Ionian (Major) and Aeolian (Natural Minor)
                    only. No borrowed chords, secondary dominants, or altered
                    minor scales are considered.
                  </Typography>
                </Box>
              }
            >
              <IconButton
                aria-label="Help"
                sx={{
                  color: "text.secondary",
                  mr: 1,
                  p: 0,
                  minWidth: "auto",
                  fontSize: 28,
                  lineHeight: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HelpOutlineIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                themePref === "system"
                  ? effectiveMode === "dark"
                    ? `System theme: dark (click to choose light)`
                    : `System theme: light (click to choose dark)`
                  : themePref === "light"
                  ? "Light theme (click to switch to dark)"
                  : "Dark theme (click to switch to system)"
              }
              arrow
            >
              <IconButton
                aria-label={
                  themePref === "system"
                    ? "System theme"
                    : themePref === "light"
                    ? "Light theme"
                    : "Dark theme"
                }
                onClick={handleCycleClick}
                sx={{
                  color: "inherit",
                  p: 0,
                  minWidth: "auto",
                  fontSize: 28,
                  lineHeight: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {themePref === "system" ? (
                  <ComputerIcon fontSize="inherit" />
                ) : themePref === "light" ? (
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
            onChange={(
              _: MouseEvent<HTMLElement>,
              v: "byKey" | "free" | null
            ) => {
              if (v) setViewMode(v);
            }}
            size="small"
            fullWidth
            sx={{
              mb: 1,
              width: "100%",
              "& .MuiToggleButton-root": {
                border: "1px solid",
                borderColor: "divider",
                transition: "border-color 150ms, box-shadow 150ms",
              },
              "& .MuiToggleButton-root:hover, & .MuiToggleButton-root.Mui-selected":
                {
                  borderColor: "primary.light",
                  zIndex: 1,
                },
            }}
          >
            <ToggleButton value="byKey" sx={{ flex: 1, minWidth: 0 }}>
              <Tooltip
                title={
                  "By Key (circle of fifths) - outer ring shows Ionian (Major), inner ring shows Aeolian (Natural Minor). Click a tonic to view triads, then click triads to select. Results show matching keys and remaining diatonic chords."
                }
                arrow
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  By Key
                </span>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="free" sx={{ flex: 1, minWidth: 0 }}>
              <Tooltip
                title={
                  "Free — browse all triads and select any combination to analyze."
                }
                arrow
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  Free
                </span>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {viewMode === "byKey" ? (
            <>
              <CircleOfFifths
                selectedTonic={selectorTonic}
                selectedMode={selectorMode}
                onSelect={(tonic, mode) => {
                  setSelectorTonic(tonic);
                  setSelectorMode(mode);
                  setSelectedChords([]);
                }}
              />

              {/* List of diatonic chords for the selected key (buttons) */}
              <Box mb={2} sx={{ position: "relative", pt: 2 }}>
                <Stack
                  direction="row"
                  spacing={0.5}
                  flexWrap="wrap"
                  alignItems="center"
                  sx={{ columnGap: 1, rowGap: 1, justifyContent: "center" }}
                >
                  {diatonicChords.map((chord, idx) => {
                    const isSelected = selectedChords.some(
                      (sel) =>
                        sel.root === chord.root &&
                        sel.quality === chord.quality &&
                        sel.degree === chord.degree
                    );
                    const label = `${chord.root}${
                      chord.quality === "major"
                        ? ""
                        : chord.quality === "minor"
                        ? "m"
                        : "dim"
                    }`;
                    return (
                      <Chip
                        key={idx}
                        label={label}
                        onClick={() => {
                          setSelectedChords((selected) =>
                            selected.some(
                              (s) =>
                                s.root === chord.root &&
                                s.quality === chord.quality &&
                                s.degree === chord.degree
                            )
                              ? selected.filter(
                                  (s) =>
                                    !(
                                      s.root === chord.root &&
                                      s.quality === chord.quality &&
                                      s.degree === chord.degree
                                    )
                                )
                              : [...selected, chord]
                          );
                        }}
                        color={isSelected ? "primary" : "default"}
                        size="medium"
                        sx={{ cursor: "pointer", m: 0.25 }}
                      />
                    );
                  })}
                  <IconButton
                    aria-label="Reset selection"
                    onClick={handleReset}
                    size="medium"
                  >
                    <RefreshIcon fontSize="inherit" />
                  </IconButton>
                </Stack>
              </Box>
            </>
          ) : (
            <ChordTable
              triads={buildAllTriads()}
              selectedChords={selectedChords}
              onToggle={(chord) => {
                setSelectedChords((selected) =>
                  selected.some(
                    (s) =>
                      s.root === chord.root &&
                      s.quality === chord.quality &&
                      s.degree === chord.degree
                  )
                    ? selected.filter(
                        (s) =>
                          !(
                            s.root === chord.root &&
                            s.quality === chord.quality &&
                            s.degree === chord.degree
                          )
                      )
                    : [...selected, chord]
                );
              }}
              onReset={handleReset}
            />
          )}
        </Box>
        <KeyResults results={results} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
