import React from "react";
import { GRID } from "./meta";
import useStore, { ModeType } from "./store";

const Select: React.FC = () => {
  const setState = useStore((state) => state.setState);
  const mode = useStore((state) => state.mode);
  const { placing, width, height } = useStore((state) => state.selectedPlacing);
  const cn =
    "h-24 w-24 flex-none" +
    (mode === ModeType.DROP ? " border-2 border-blue-500" : "");
  return (
    <div
      className={cn}
      onClick={() => {
        setState((state) =>
          state.selectedPlacing.placing.length === 0
            ? {}
            : { selected: [], mode: ModeType.DROP }
        );
      }}
    >
      <svg
        className="w-full h-full p-1"
        viewBox={`0 0 ${width * GRID} ${height * GRID}`}
      >
        {placing.map(([i, j, s, r, c]) => {
          return (
            <use
              key={[i, j, s, r, c].join(".")}
              href={"#" + s}
              className={"fill-lego-" + c}
              transform={
                `translate(${j * GRID},${i * GRID})` +
                (r === 0 ? "" : `rotate(${r} ${GRID / 2} ${GRID / 2})`)
              }
            />
          );
        })}
      </svg>
    </div>
  );
};
export default React.memo(Select);
