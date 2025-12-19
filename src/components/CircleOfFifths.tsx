import React, { useState } from "react";
import { Box, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Note, Mode } from "../music/types";
import {
  MAJOR_TONICS_ORDER,
  MINOR_TONICS_ORDER,
  getTonicDisplayLabel,
} from "../music/keys";
import { buildScale } from "../music/logic";
import PianoPlayer from "../music/PianoPlayer";

/**
 * Interactive SVG Circle of Fifths with two rings: major (outer), minor (inner).
 * @param onSelect (tonic, mode) => void - called when a sector is clicked
 * @param selectedTonic - currently selected tonic
 * @param selectedMode - currently selected mode
 */
export interface CircleOfFifthsProps {
  onSelect: (tonic: Note, mode: Mode) => void;
  selectedTonic: Note;
  selectedMode: Mode;
}

const SVG_SIZE = 520;
const CENTER = SVG_SIZE / 2;
// Compute radii relative to the SVG size so the circle fills the available viewport.
// Use a very small inset (0.5px) to account for stroke thickness so the outer
// sectors visually reach the SVG edges.
const OUTER_RADIUS = Math.max(Math.floor(CENTER - 0.5), 0);
const INNER_RADIUS = Math.max(Math.round(OUTER_RADIUS * 0.6), 16);
const SECTORS = 12;

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const a = ((angle - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  };
}

/** Return an SVG path string for a ring sector (area between r1 and r2). */
function describeArc(
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  startAngle: number,
  endAngle: number
) {
  const p1 = polarToCartesian(cx, cy, r2, endAngle);
  const p2 = polarToCartesian(cx, cy, r2, startAngle);
  const p3 = polarToCartesian(cx, cy, r1, startAngle);
  const p4 = polarToCartesian(cx, cy, r1, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${r2} ${r2} 0 ${largeArc} 0 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${r1} ${r1} 0 ${largeArc} 1 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({
  onSelect,
  selectedTonic,
  selectedMode,
}) => {
  const theme = useTheme();
  const [hoverMajor, setHoverMajor] = useState<number | null>(null);
  const [hoverMinor, setHoverMinor] = useState<number | null>(null);

  const selectedFill = theme.palette.primary.main;
  const selectedText = theme.palette.primary.contrastText;
  const sectorDefault = theme.palette.background.paper;
  const sectorInnerDefault =
    theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.grey[100];
  const hoverFill = alpha(
    theme.palette.primary.light,
    theme.palette.mode === "dark" ? 0.28 : 0.18
  );
  const sectorStroke = theme.palette.divider;
  const centerFill = theme.palette.background.default;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ width: "100%", aspectRatio: "1/1", mx: "auto", my: 2 }}
    >
      <svg
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
      >
        <g transform={`rotate(-15 ${CENTER} ${CENTER})`}>
          {/* Outer ring: major (paths only) */}
          {MAJOR_TONICS_ORDER.map((tonic, i) => {
            const start = (i * 360) / SECTORS;
            const end = ((i + 1) * 360) / SECTORS;
            const isSelected =
              selectedTonic === tonic && selectedMode === "Ionian";
              return (
              <g
                key={tonic}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const scale = buildScale(tonic, "Ionian");
                    if (scale && scale.length === 7) {
                    const chords = Array.from({ length: 7 }).map((_, idx) => {
                      const rootIdx = idx;
                      const thirdIdx = (rootIdx + 2) % 7;
                      const fifthIdx = (rootIdx + 4) % 7;
                      return [scale[rootIdx], scale[thirdIdx], scale[fifthIdx]] as string[];
                    });
                    try {
                      // stop any previous playback immediately before scheduling a new sequence
                      PianoPlayer.stopAll(100);
                    } catch {
                      /* ignore */
                    }
                    PianoPlayer.playSequence(chords, 900, 60);
                  }
                  onSelect(tonic, "Ionian");
                }}
                onMouseEnter={() => setHoverMajor(i)}
                onMouseLeave={() => setHoverMajor(null)}
              >
                <path
                  d={describeArc(
                    CENTER,
                    CENTER,
                    INNER_RADIUS,
                    OUTER_RADIUS,
                    start,
                    end
                  )}
                  fill={
                    isSelected
                      ? selectedFill
                      : hoverMajor === i
                      ? hoverFill
                      : sectorDefault
                  }
                  stroke={sectorStroke}
                  strokeWidth={hoverMajor === i || isSelected ? 2 : 1.5}
                />
              </g>
            );
          })}
          {/* Inner ring: minor (paths only) */}
          {MINOR_TONICS_ORDER.map((tonic, i) => {
            const start = (i * 360) / SECTORS;
            const end = ((i + 1) * 360) / SECTORS;
            const isSelected =
              selectedTonic === tonic && selectedMode === "Aeolian";
              return (
              <g
                key={tonic}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const scale = buildScale(tonic, "Aeolian");
                    if (scale && scale.length === 7) {
                    const chords = Array.from({ length: 7 }).map((_, idx) => {
                      const rootIdx = idx;
                      const thirdIdx = (rootIdx + 2) % 7;
                      const fifthIdx = (rootIdx + 4) % 7;
                      return [scale[rootIdx], scale[thirdIdx], scale[fifthIdx]] as string[];
                    });
                    try {
                      // stop any previous playback immediately before scheduling a new sequence
                      PianoPlayer.stopAll(100);
                    } catch {
                      /* ignore */
                    }
                    PianoPlayer.playSequence(chords, 900, 60);
                  }
                  onSelect(tonic, "Aeolian");
                }}
                onMouseEnter={() => setHoverMinor(i)}
                onMouseLeave={() => setHoverMinor(null)}
              >
                <path
                  d={describeArc(CENTER, CENTER, 40, INNER_RADIUS, start, end)}
                  fill={
                    isSelected
                      ? selectedFill
                      : hoverMinor === i
                      ? hoverFill
                      : sectorInnerDefault
                  }
                  stroke={sectorStroke}
                  strokeWidth={hoverMinor === i || isSelected ? 2 : 1.5}
                />
              </g>
            );
          })}
          {/* Center circle for spacing */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={48}
            fill={centerFill}
            stroke={sectorStroke}
            strokeWidth={1.5}
          />
        </g>

        {/* Labels: render outside the rotated group so they stay upright */}
        <g>
          {MAJOR_TONICS_ORDER.map((tonic, i) => {
            const start = (i * 360) / SECTORS;
            const end = ((i + 1) * 360) / SECTORS;
            const mid = (start + end) / 2;
            /** Adjust label angle to counter the -15deg rotation applied to the sector paths. */
            const angleForLabel = mid - 15;
            const pos = polarToCartesian(
              CENTER,
              CENTER,
              (OUTER_RADIUS + INNER_RADIUS) / 2,
              angleForLabel
            );
            const isSelected =
              selectedTonic === tonic && selectedMode === "Ionian";
            return (
              <text
                key={tonic + "-label"}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.round(OUTER_RADIUS * 0.12)}
                fontWeight={isSelected ? 700 : 500}
                fill={isSelected ? selectedText : theme.palette.text.primary}
                pointerEvents="none"
              >
                {getTonicDisplayLabel(tonic, "Ionian")}
              </text>
            );
          })}

          {MINOR_TONICS_ORDER.map((tonic, i) => {
            const start = (i * 360) / SECTORS;
            const end = ((i + 1) * 360) / SECTORS;
            const mid = (start + end) / 2;
            const angleForLabel = mid - 15;
            const pos = polarToCartesian(
              CENTER,
              CENTER,
              (INNER_RADIUS + 40) / 2,
              angleForLabel
            );
            const isSelected =
              selectedTonic === tonic && selectedMode === "Aeolian";
            return (
              <text
                key={tonic + "-label-minor"}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.round(OUTER_RADIUS * 0.065)}
                fontWeight={isSelected ? 700 : 500}
                fill={isSelected ? selectedText : theme.palette.text.secondary}
                pointerEvents="none"
              >
                {getTonicDisplayLabel(tonic, "Aeolian") + "m"}
              </text>
            );
          })}
        </g>
      </svg>
    </Box>
  );
};

export default CircleOfFifths;
