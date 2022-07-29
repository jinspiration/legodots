import React, { useEffect, useState } from "react";
import useStore, { ModeType } from "./store";
import DotButton from "./DotButton";
import { SHAPES } from "./meta";

const Used: React.FC<{}> = () => {
  const board = useStore((state) => state.board);
  const used = useStore((state) => state.used);
  const setState = useStore((state) => state.setState);
  return (
    <div className="grow rounded-md bg-neutral overflow-y-auto px-2 md:px-0 md:py-2">
      {used.map(([name, occ]) => {
        const [shape, color] = name.split(".");
        return (
          <div key={name} className="indicator w-12 h-12 p-1">
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
