import React from "react";
export const GRID = 50;
const DOT = 49;
const MARGIN = 0.5;
const Defs: React.FC = () => {
  return (
    <>
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0.5" dy="0.5" stdDeviation="1" floodOpacity="0.8" />
          <feDropShadow
            dx="-0.5"
            dy="-0.5"
            stdDeviation="1"
            floodOpacity="0.8"
          />
        </filter>
        <rect
          id="rect"
          stroke="black"
          strokeWidth="0.15"
          x={MARGIN}
          y={MARGIN}
          width={DOT}
          height={DOT}
          rx="3"
          filter="url(#shadow)"
        ></rect>
        <circle
          id="circle"
          cx={DOT / 2}
          cy={DOT / 2}
          r={DOT / 2}
          stroke="black"
          strokeWidth="0.15"
          filter="url(#shadow)"
        ></circle>
        <path
          id="arc"
          d={`M${MARGIN},${MARGIN} l${DOT},0 a${DOT},${DOT} 0 0,1 -${DOT},${DOT} l0,-${DOT}`}
          stroke="black"
          strokeWidth="0.15"
          filter="url(#shadow)"
        ></path>
      </defs>
    </>
  );
};

export default React.memo(Defs);
