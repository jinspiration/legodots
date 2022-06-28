import React from "react";
const DOT_SIZE = 50;
export type DotProp = [string, string?, number?];
export const Dot: React.FC<{ dotProp: DotProp; index: number }> = ({
  dotProp: [shape, color, rotate],
  index,
}) => {
  const x = (index % 4) * DOT_SIZE,
    y = Math.floor(index / 4) * DOT_SIZE;
  switch (shape) {
    case "rect":
      return (
        <rect
          className={`fill-lego-${color}`}
          width={DOT_SIZE}
          height={DOT_SIZE}
          rx="3"
          transform={`translate(${x},${y})`}
        ></rect>
      );
    case "circle":
      return (
        <circle
          className={`fill-lego-${color}`}
          cx={DOT_SIZE / 2}
          cy={DOT_SIZE / 2}
          r={DOT_SIZE / 2}
          transform={`translate(${x},${y})`}
        ></circle>
      );
    case "arc": {
      return (
        <path
          className={`fill-lego-${color}`}
          d={`M0,0 l${DOT_SIZE},0 a${DOT_SIZE},${DOT_SIZE} 0 0,1 -${DOT_SIZE},${DOT_SIZE} l0,-${DOT_SIZE}`}
          transform={`translate(${x},${y}) rotate(${(rotate ?? 0) * 90} ${
            DOT_SIZE / 2
          } ${DOT_SIZE / 2}) `}
        ></path>
      );
    }
    default:
      return (
        <rect
          className={"fill-lego-white"}
          width={DOT_SIZE}
          height={DOT_SIZE}
          rx="3"
          x={x}
          y={y}
        ></rect>
      );
  }
};
