import React, { useState } from "react";
import { BOARDCOLORS, GRID } from "./meta";
// import { useBuild } from "./store/build";
import useStore, { ModeType } from "./store";
const Menu: React.FC<{
  // chooseBoard: (m: number, n: number, color: string) => void;
}> = ({}) => {
  const [m, setM] = useState(8);
  const [n, setN] = useState(8);
  const [boardColor, setColor] = useState("lego-blue");
  // const start = useStore((state) => state.start);
  const setState = useStore((state) => state.setState);
  return (
    <div className="md:col-span-2 w-full h-full grid grid-rows-[50%_50%] sm:grid-rows-1 sm:grid-cols-[50%_50%]">
      <div className="flex">
        <svg className="h-fit" viewBox={`0 0 ${m * GRID} ${n * GRID}`}>
          <rect
            x="0"
            y="0"
            className={`fill-${boardColor}`}
            width={m * GRID}
            height={n * GRID}
          />
          <rect
            x="0"
            y="0"
            className={`bg-${boardColor}`}
            fill="url(#pattern)"
            width={m * GRID}
            height={n * GRID}
          />
        </svg>
      </div>
      <div className="mt-10 flex flex-col gap-10 px-5">
        <div className="w-full relative">
          <input
            className="range range-accent pr-10"
            type="range"
            value={m}
            min={0}
            max={64}
            step={8}
            onChange={(e) => {
              setM(Number(Math.max(8, Number(e.target.value))));
            }}
          />
          <span className="absolute right-0 top-0 text-info">{m}</span>
        </div>
        <div className="w-full relative">
          <input
            className=" range range-accent pr-10"
            type="range"
            value={n}
            min={0}
            max={64}
            step={8}
            onChange={(e) => {
              setN(Number(Math.max(8, Number(e.target.value))));
            }}
          />
          <span className="absolute right-0 top-0 text-info">{n}</span>
        </div>
        <div className="grid grid-flow-col w-full justify-start">
          {Object.keys(BOARDCOLORS).map((c) => {
            return (
              <div key={c} className="w-12 h-12">
                <svg
                  key={c}
                  className="w-full h-full p-1 rounded-lg overflow-hidden"
                  viewBox={`0 0 ${GRID} ${GRID}`}
                  onClick={() => {
                    setColor(c);
                  }}
                >
                  <rect
                    x="0"
                    y="0"
                    className={`fill-${c}`}
                    width={GRID}
                    height={GRID}
                  />
                  <rect
                    x="0"
                    y="0"
                    className={`bg-${c}`}
                    fill="url(#pattern)"
                    width={GRID}
                    height={GRID}
                  />
                </svg>
              </div>
            );
          })}
        </div>
        <button
          className="btn-success btn-md rounded-lg text-success-content"
          onClick={() =>
            setState({
              board: new Array(n).fill(0).map(() => new Array(m).fill("")),
              boardColor,
              mode: ModeType.EDIT,
              selected: [],
              current: ["rect", 0, "blue-light"],
            })
          }
        >
          Start Building
        </button>
      </div>
    </div>
  );
};
export default Menu;
