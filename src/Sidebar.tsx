import React from "react";
import { Used } from "./build";
import { GRID, Shape } from "./meta";

const Sidebar: React.FC<{ used: Used }> = ({ used }) => {
  const usedArray = Object.entries(used).map(([dot, occ]) => {
    const [shape, color] = dot.split(".");
    return [shape, color, occ] as [string, string, number];
  });
  usedArray.sort((a, b) => {
    return b[2] - a[2];
  });
  return (
    <>
      {/* current */}
      <div className="p-0.5 bg-gray-200">
        <Dot shape={"rect"} />
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
      {/* all shapes */}
      <div className="flex flex-wrap bg-yellow-300 p-1">
        <Dot shape={"rect"} />
        <Dot shape={"arc"} />
        <Dot shape={"circle"} />
      </div>
    </>
  );
};

const Dot: React.FC<{ shape: Shape; used?: number }> = ({ shape, used }) => {
  return (
    <svg className="basis-1/2 p-0.5" viewBox={`0 0 ${GRID} ${GRID}`}>
      <use
        href={"#" + shape}
        className={`fill-lego-blue-light w-full h-full`}
      />
    </svg>
  );
};
export default Sidebar;
