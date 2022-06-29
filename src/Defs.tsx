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
        <pattern
          id="Pattern"
          x="0"
          y="0"
          width={DOT}
          height={DOT}
          patternUnits="userSpaceOnUse"
        >
          <rect x="0" y="0" width={DOT} height={DOT} fill="blue" />
          <circle
            cx={DOT / 2}
            cy={DOT / 2}
            r={DOT * 0.3}
            fill="blue"
            filter="url(#shadow)"
          />
        </pattern>
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
