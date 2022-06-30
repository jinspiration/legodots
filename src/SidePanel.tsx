import React from "react";
import { Dot } from "./App";
import { Used } from "./build";
import { GRID, SHAPES, COLORS } from "./meta.js";

const Sidebar: React.FC<{
  used: Used;
  current: Dot | null;
  setCurrent: React.Dispatch<React.SetStateAction<Dot | null>>;
}> = ({ used, current, setCurrent }) => {
  const usedArray = Object.entries(used).map(([dot, occ]) => {
    const [shape, color] = dot.split(".");
    return [shape, color, occ] as [string, string, number];
  });
  usedArray.sort((a, b) => {
    return b[2] - a[2];
  });
  return (
    <>
      <div className="flex bg-yellow-300 p-1">
        <div className="basis-1/2">
          {SHAPES.map((shape) => (
            <svg
              key={shape}
              className="basis-1/2 p-0.5"
              viewBox={`0 0 ${GRID} ${GRID}`}
              onClick={() => {
                setCurrent([shape, current ? current[1] : "blue-light"]);
              }}
            >
              <use
                href={"#" + shape}
                className={`fill-lego-${
                  current ? current[1] : "blue-light"
                } w-full h-full`}
              />
            </svg>
          ))}
        </div>
        <div className="basis-1/2">
          {current
            ? Object.keys(COLORS).map((color) => (
                <svg
                  key={color}
                  className="basis-1/2 p-0.5"
                  viewBox={`0 0 ${GRID} ${GRID}`}
                  onClick={() => {
                    setCurrent([current ? current[0] : "rect", color.slice(5)]);
                  }}
                >
                  <use
                    href={"#" + current[0]}
                    className={`fill-${color} w-full h-full`}
                  />
                </svg>
              ))
            : null}
        </div>
      </div>
      {/* used */}
      <div className="flex flex-wrap bg-green-200 grow p-1">
        {usedArray.map(([shape, color, occ], index) => (
          <div
            key={[shape, color, occ, index].join(".")}
            className="basis-1/2 relative"
          >
            <span className="absolute bottom-0 right-0 text-sm w-4 text-center bg-white rounded-full font-mono">
              {occ}
            </span>
            <svg className="basis-1/2 p-0.5" viewBox={`0 0 ${GRID} ${GRID}`}>
              <use href={"#" + shape} className={`fill-lego-${color}`} />
            </svg>
          </div>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
