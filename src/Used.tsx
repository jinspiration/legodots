import React, { useEffect, useState } from "react";
import useStore, { ModeType } from "./store";
import { DotButton } from "./Buttons";
import { SHAPES } from "./meta";

type UsedCount = [string, number][];
const Used: React.FC<{}> = () => {
  const used = useStore(({ board }) => {
    const usedObj: { [key: string]: number } = {};
    board.forEach((row, i) => {
      row.forEach((dots, j) => {
        dots.forEach(([s, r, c]) => {
          if (SHAPES.includes(s))
            usedObj[s + "." + c] = (usedObj[s + "." + c] ?? 0) + 1;
        });
      });
    });
    const used: UsedCount = Object.entries(usedObj).map(([key, count]) => [
      key,
      count,
    ]);
    used.sort(([, a], [, b]) => b - a);
    return used;
  });
  const setState = useStore((state) => state.setState);
  return (
    <div className="grow overflow-y-auto scrollbar flex flex-wrap place-content-start">
      {used.map(([name, occ]) => {
        const [shape, color] = name.split(".");

        return (
          <div
            key={name}
            className="relative button-sm"
            onClick={() => {
              setState((state) => {
                if (state.mode === ModeType.LANDING) return {};
                return {
                  current: [shape, 0, color],
                  mode: ModeType.EDIT,
                };
              });
            }}
          >
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-zinc-800">
              {occ}
            </span>
            <DotButton shape={shape} color={color} rotate={0} />
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(Used);
