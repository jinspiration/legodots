import React from "react";
const GRID = 50;
const DOT = 49;
const MARGIN = 0.5;
export type DotProp = [string, string?, number?];
export const Dot: React.FC<{ dotProp: DotProp; x: number; y: number }> = ({
  dotProp: [shape, color, rotate],
  x,
  y,
}) => {
  switch (shape) {
    case "rect":
      return (
        <rect
          className={`fill-lego-${color}`}
          stroke="black"
          strokeWidth="0.15"
          x={MARGIN}
          y={MARGIN}
          width={DOT}
          height={DOT}
          rx="3"
          filter="url(#shadow)"
          transform={`translate(${x * GRID},${y * GRID})`}
        ></rect>
      );
    case "circle":
      return (
        <circle
          className={`fill-lego-${color}`}
          cx={DOT / 2}
          cy={DOT / 2}
          r={DOT / 2}
          stroke="black"
          strokeWidth="0.15"
          filter="url(#shadow)"
          transform={`translate(${x * GRID},${y * GRID})`}
        ></circle>
      );
    case "arc": {
      return (
        <path
          className={`fill-lego-${color}`}
          d={`M${MARGIN},${MARGIN} l${DOT},0 a${DOT},${DOT} 0 0,1 -${DOT},${DOT} l0,-${DOT}`}
          stroke="black"
          strokeWidth="0.15"
          filter="url(#shadow)"
          transform={`translate(${x * GRID},${y * GRID}) rotate(${
            (rotate ?? 0) * 90
          } ${GRID / 2} ${GRID / 2}) `}
        ></path>
      );
    }
    default:
      return null;
  }
};
