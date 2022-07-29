import React, { useEffect, useState } from "react";
import useStore, { ModeType } from "./store";
import DotButton from "./DotButton";
import { SHAPES } from "./meta";

const Used: React.FC<{}> = () => {
  const board = useStore((state) => state.board);
  const used = useStore((state) => state.used);
  const setState = useStore((state) => state.setState);
  return (
    <div className="grid grid-cols-2 rounded-md">
      {used.map(([name, occ]) => {
        const [shape, color] = name.split(".");
        return (
          <div key={name} className="indicator p-0.5 w-full h-full">
            <span className="indicator-item indicator-center indicator-middle badge badge-xs badge-info text-info-content">
              {occ}
            </span>
            <div
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
              <DotButton shape={shape} color={color} rotate={0} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(Used);
