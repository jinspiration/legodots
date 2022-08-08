import React, { useState } from "react";
import { GRID, DOTS, COLORS } from "./meta";
import useStore from "./store";
import { TiDelete } from "react-icons/ti";
import {
  MdOutlineCancel,
  MdOutlineCheck,
  MdOutlineDeleteSweep,
} from "react-icons/md";
const _DOTS = Object.keys(DOTS);
const _COLORS = Object.keys(COLORS);

const Settings: React.FC = () => {
  const patterns = useStore((state) => state.patterns);
  const setState = useStore((state) => state.setState);
  const shapes = useStore((state) => state.shapes);
  const colors = useStore((state) => state.colors);
  const boardColors = useStore((state) => state.boardColors);
  const [modal, setModal] = useState(false);
  const [isDot, setIsDot] = useState(true);
  return (
    <div className="flex flex-col [&>div]:rounded-lg gap-1 [&>div]:bg-zinc-700 overflow-y-auto scrollbar relative">
      <div>
        <h1 className="text-center text-white select-none">Shapes</h1>
        <div className="flex flex-wrap gap-1 p-2">
          {_DOTS.map((shape) => (
            <div
              key={shape}
              className={
                "p-1 rounded-md border-2" +
                (shapes.includes(shape)
                  ? " border-sky-500"
                  : " border-transparent")
              }
              onClick={() =>
                setState((state) => {
                  const s = state.shapes.includes(shape)
                    ? state.shapes.filter((s) => s !== shape)
                    : [...state.shapes, shape];
                  s.sort((a, b) => _DOTS.indexOf(a) - _DOTS.indexOf(b));
                  return { shapes: s };
                })
              }
            >
              <svg
                className="w-10 h-10"
                viewBox={`0 0 ${DOTS[shape].size * GRID} ${
                  DOTS[shape].size * GRID
                }`}
              >
                <use href={"#" + shape} className={"fill-sky-500"}></use>
              </svg>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h1 className="text-center text-white select-none">Colors</h1>
        <div className="flex justify-evenly">
          <div
            className="text-center text-white bg-sky-500 px-2 rounded-md"
            onClick={() => setIsDot(true)}
          >
            Dot
          </div>
          <div
            className="text-center text-white bg-red-500 px-2 rounded-md"
            onClick={() => setIsDot(false)}
          >
            Board
          </div>
        </div>
        <div className="flex flex-wrap gap-1 p-2">
          {_COLORS.map((color) => {
            return (
              <div
                key={color}
                className={
                  "p-1 rounded-md border-2" +
                  (isDot
                    ? colors.includes(color)
                      ? " border-sky-500"
                      : " border-transparent"
                    : boardColors.includes(color)
                    ? " border-red-500"
                    : " border-transparent")
                }
                onClick={() =>
                  setState((state) => {
                    if (isDot) {
                      const c = state.colors.includes(color)
                        ? state.colors.filter((_c) => _c !== color)
                        : [...state.colors, color];
                      c.sort((a, b) => _COLORS.indexOf(a) - _COLORS.indexOf(b));
                      return { colors: c };
                    } else {
                      const bc = state.boardColors.includes(color)
                        ? state.boardColors.filter((_bc) => _bc !== color)
                        : [...state.boardColors, color];
                      bc.sort(
                        (a, b) => _COLORS.indexOf(a) - _COLORS.indexOf(b)
                      );
                      return { boardColors: bc };
                    }
                  })
                }
              >
                <svg viewBox={`0 0 ${GRID} ${GRID}`} className="w-10 h-10">
                  <use href={"#circle"} className={`fill-lego-${color}`}></use>
                </svg>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <h1 className="text-center text-white select-none">Patterns</h1>
        <div className="flex flex-wrap place-content-start gap-1 p-2">
          {patterns.map(({ width, height, placing }, i) => {
            return (
              <div className="w-24 h-24 rounded-lg relative">
                <div
                  className="absolute top-0 right-0"
                  onClick={() =>
                    setState((state) => {
                      return {
                        patterns: state.patterns.filter((_, ii) => ii !== i),
                        selectedPattern:
                          state.selectedPattern === i
                            ? -1
                            : state.selectedPattern,
                      };
                    })
                  }
                >
                  <TiDelete className="fill-red-500" size={20} />
                </div>
                <svg
                  key={i}
                  className={`w-full h-full p-1`}
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
                          (r === 0
                            ? ""
                            : `rotate(${r} ${GRID / 2} ${GRID / 2})`)
                        }
                      />
                    );
                  })}
                </svg>
              </div>
            );
          })}
        </div>
      </div>
      <div
        className="flex justify-center items-center"
        onClick={() => setModal(true)}
      >
        <div className="button-sm">
          <MdOutlineDeleteSweep className="fill-red-500" />
        </div>
        <span className="text-red-500 pl-2">CLEAR STORAGE</span>
      </div>
      {modal && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10 !bg-transparent"
          onClick={() => setModal(false)}
        >
          <div
            className="w-56 p-4 bg-zinc-700 rounded-lg shadow-sm shadow-gray-400 flex flex-col gap-2 items-center z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-red-500">DANGEOURS!!!</span>
            <h1 className="text-white text-center">
              Are you sure you want to clear all your storage, including all
              boards, patterns, and settings?
            </h1>
            <div className="w-full flex justify-around">
              <div className="button-sm" onClick={() => setModal(false)}>
                <MdOutlineCancel className="fill-green-400" />
              </div>
              <div
                className="button-sm"
                onClick={() => {
                  console.log("REMOVE STORAGE");
                  localStorage.removeItem("legodots-store");
                  useStore.persist.clearStorage();
                  location.reload();
                  // setModal(false);
                }}
              >
                <MdOutlineCheck className="fill-rose-500" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Settings);
