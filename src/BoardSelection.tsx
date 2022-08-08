import React, { useState } from "react";
import { GRID } from "./meta";
import useStore, { BoardData, EditorMode } from "./store";

const BoardSelection: React.FC = () => {
  const [m, setM] = useState(8);
  const [n, setN] = useState(8);
  const [name, setName] = useState("new board");
  const [color, setColor] = useState("blue");
  const switchBoard = useStore((state) => state.switchBoard);
  const boardColors = useStore((state) => state.boardColors);
  const names = useStore((state) => {
    return [state.board, ...state.gallery].map(({ name }) => name);
  });
  return (
    <div className="grid grid-rows-[16rem_minmax(0,1fr)] gap-y-2">
      <div className="flex justify-center items-center bg-zinc-700 rounded-lg">
        <svg
          className="h-full w-full p-6"
          viewBox={`0 0 ${n * GRID} ${m * GRID}`}
        >
          <rect
            x="0"
            y="0"
            className={`fill-lego-${color}`}
            width={n * GRID}
            height={m * GRID}
          />
          <rect
            x="0"
            y="0"
            fill="url(#pattern)"
            width={n * GRID}
            height={m * GRID}
          />
        </svg>
      </div>
      <div className="flex flex-col justify-around items-center bg-zinc-700 rounded-lg ">
        <div className="relative w-56">
          <input
            type="text"
            value={name}
            className={`w-full rounded-md text-center text-white border-2 focus:outline-none ${
              names.includes(name) || name === "" || name.length > 18
                ? "focus:border-red-500 bg-rose-500"
                : "focus:border-green-500 bg-indigo-500"
            }`}
            onChange={(e) => setName(e.target.value)}
          />
          <span className="absolute -left-12 text-gray-300">Name</span>
          {names.includes(name) && (
            <span className="absolute w-full -bottom-6 h-6 left-0 text-center text-red-500">
              Name already exisits
            </span>
          )}
          {name === "" && (
            <span className="absolute w-full -bottom-6 h-6 left-0 text-center text-red-500">
              Name required
            </span>
          )}
          {name.length > 18 && (
            <span className="absolute w-full -bottom-6 h-6 left-0 text-center text-red-500">
              Name too long
            </span>
          )}
        </div>
        <div className="relative w-56">
          <input
            className="range rounded-md"
            type="range"
            value={n}
            min={0}
            max={64}
            step={8}
            onChange={(e) => setN(Number(Math.max(8, Number(e.target.value))))}
          />
          <span className="absolute -left-8 text-gray-300 select-none">
            {n}
          </span>
        </div>
        <div className="relative w-56">
          <input
            className="range rounded-md"
            type="range"
            value={m}
            min={0}
            max={64}
            step={8}
            onChange={(e) => setM(Number(Math.max(8, Number(e.target.value))))}
          />
          <span className="absolute -left-8 text-gray-300 select-none">
            {m}
          </span>
        </div>

        <div className="max-w-xs md:max-w-md flex place-content-start gap-2 overflow-x-auto scrollbar">
          {boardColors.map((c) => {
            return (
              <div key={c} className="w-12 h-12">
                <svg
                  key={c}
                  className="w-12 h-12"
                  viewBox={`0 0 ${GRID} ${GRID}`}
                  onClick={() => setColor(c)}
                >
                  <rect
                    x="0"
                    y="0"
                    rx="5"
                    className={`fill-lego-${c}`}
                    width={GRID}
                    height={GRID}
                  />
                  <rect
                    x="0"
                    y="0"
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
          className={`h-12 text-sm px-3 rounded-lg text-zinc-300 ${
            names.includes(name) || name === "" || name.length > 18
              ? "bg-gray-500"
              : "bg-green-500"
          }`}
          onClick={() => {
            if (names.includes(name) || name === "" || name.length > 18) return;
            const data: BoardData = new Array(m)
              .fill(0)
              .map(() => new Array(n).fill([]));
            switchBoard(-1, { name: name, color: color, data });
          }}
        >
          Start Building
        </button>
      </div>
    </div>
  );
};

export default React.memo(BoardSelection);
