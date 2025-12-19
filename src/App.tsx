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
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import type { Note, Mode, Chord } from "./music/types";
import {
  buildDiatonicChords,
  buildAllTriads,
  findMatchingKeys,
} from "./music/logic";
import CircleOfFifths from "./components/CircleOfFifths";
import ChordTable from "./components/ChordTable";
import KeyResults from "./components/KeyResults";
import PianoPlayer from "./music/PianoPlayer";

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

  const [muted, setMuted] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem("diato.muted");
      return v === "1" ? true : v === "0" ? false : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    PianoPlayer.setMuted(muted);
    try {
      localStorage.setItem("diato.muted", muted ? "1" : "0");
    } catch (err) {
      console.warn("App: save muted failed", err);
    }
  }, [muted]);

  useEffect(() => {
    try {
      localStorage.setItem("diato.theme", themePref);
    } catch (err) {
      console.warn("App: save theme failed", err);
    }
  }, [themePref]);

  /** State: selections are independent for each mode. */
  const [selectedByKey, setSelectedByKey] = useState<Chord[]>([]);
  const [selectedFree, setSelectedFree] = useState<Chord[]>([]);

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

  /** Use the active selection according to the current view mode. */
  const activeSelected = viewMode === "byKey" ? selectedByKey : selectedFree;

  /** Analyze the active selected chords and compute matching keys. */
  const results = useMemo(
    () => findMatchingKeys(activeSelected),
    [activeSelected]
  );

  /** Reset chord selection for the active mode only. */
  const handleReset = () => {
    if (viewMode === "byKey") setSelectedByKey([]);
    else setSelectedFree([]);
  };

  /**
   * Toggle a chord in the By-Key selection set and return whether it became selected.
   * This mirrors the `onToggle` contract used by `ChordTable` so callers can
   * decide to play audio only when a chord was newly selected.
   */
  const handleToggleByKey = (chord: Chord) => {
    let becameSelected = false;
    setSelectedByKey((selected) => {
      const exists = selected.some(
        (s) => s.root === chord.root && s.quality === chord.quality
      );
      if (exists) {
        becameSelected = false;
        return selected.filter(
          (s) => !(s.root === chord.root && s.quality === chord.quality)
        );
      }
      becameSelected = true;
      return [...selected, chord];
    });
    return becameSelected;
  };

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
            <Tooltip title={muted ? "Unmute audio" : "Mute audio"}>
              <IconButton
                aria-label={muted ? "Unmute" : "Mute"}
                onClick={() => setMuted((m) => !m)}
                sx={{
                  color: "inherit",
                  p: 0,
                  minWidth: "auto",
                  fontSize: 28,
                  lineHeight: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1,
                }}
              >
                {muted ? (
                  <VolumeOffIcon fontSize="inherit" />
                ) : (
                  <VolumeUpIcon fontSize="inherit" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                <Box sx={{ maxWidth: 420 }}>
                  <Typography variant="body2">
                    Discover keys and diatonic triads from a small set of
                    chosen triads. Select a tonic on the circle to hear that
                    key's diatonic triads, or click any triad to play it.
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                    By Key
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Outer ring: Ionian (Major). Inner ring: Aeolian (Natural
                    Minor). Pick a tonic to view and play its diatonic triads;
                    selected triads are analyzed for matching keys and remaining
                    diatonic chords.
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                    Free
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Browse all triads and select any combination to find keys
                    where those triads are diatonic.
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Supported modes: Ionian and Aeolian only.
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
              if (v) {
                try {
                  PianoPlayer.stopSequence(40);
                } catch (err) {
                  console.warn(
                    "App: stopSequence failed when switching view",
                    err
                  );
                }
                setViewMode(v);
              }
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
                  "By Key (circle of fifths): outer ring shows Ionian (Major), inner ring shows Aeolian (Natural Minor). Click a tonic to view triads, then click triads to select. Results show matching keys and remaining diatonic chords."
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
                  "Free - browse all triads and select any combination to analyze."
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
                  setSelectedByKey([]);
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
                    const isSelected = selectedByKey.some(
                      (sel) =>
                        sel.root === chord.root && sel.quality === chord.quality
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
                          const becameSelected = handleToggleByKey(chord);
                          if (becameSelected) {
                            try {
                              PianoPlayer.stopSequence(40);
                            } catch (err) {
                              console.warn("App: stopSequence failed", err);
                            }
                            try {
                              const rootIdx = idx;
                              const thirdIdx =
                                (rootIdx + 2) % diatonicChords.length;
                              const fifthIdx =
                                (rootIdx + 4) % diatonicChords.length;
                              const triad = [
                                diatonicChords[rootIdx].root,
                                diatonicChords[thirdIdx].root,
                                diatonicChords[fifthIdx].root,
                              ];
                              PianoPlayer.playChord(triad);
                            } catch (err) {
                              console.warn(
                                "App: diatonic playback failed",
                                err
                              );
                            }
                          }
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
                    sx={{
                      position: { xs: "absolute", sm: "relative" },
                      top: { xs: -28, sm: "auto" },
                      right: { xs: 0, sm: "auto" },
                    }}
                  >
                    <RefreshIcon fontSize="inherit" />
                  </IconButton>
                </Stack>
              </Box>
            </>
          ) : (
            <ChordTable
              triads={buildAllTriads()}
              selectedChords={selectedFree}
              onToggle={(chord) => {
                let becameSelected = false;
                setSelectedFree((selected) => {
                  const exists = selected.some(
                    (s) => s.root === chord.root && s.quality === chord.quality
                  );
                  if (exists) {
                    becameSelected = false;
                    return selected.filter(
                      (s) =>
                        !(s.root === chord.root && s.quality === chord.quality)
                    );
                  }
                  becameSelected = true;
                  return [...selected, chord];
                });
                return becameSelected;
              }}
              onReset={handleReset}
            />
          )}
        </Box>
        <KeyResults
          results={results}
          selectedCount={activeSelected.length}
          selectedChords={activeSelected}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;
