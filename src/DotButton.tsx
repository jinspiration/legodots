import { DOTS } from "./App";
import { GRID } from "./meta.json";
import React from "react";

interface Prop {
  shape: string;
  color: string;
  rotate: number;
}

const LegoIcon: React.FC<Prop> = ({ shape, color, rotate }) => {
  return (
    <svg
      className="w-full h-full"
      viewBox={`0 0 ${DOTS[shape].size * GRID} ${DOTS[shape].size * GRID}`}
    >
      <use
        href={"#" + shape}
        className={`fill-lego-${color}`}
        transform={`rotate(${rotate} ${(GRID * DOTS[shape].size) / 2} ${
          (GRID * DOTS[shape].size) / 2
        }) `}
      ></use>
    </svg>
  );
};
export default React.memo(LegoIcon);
