/// <reference path="./svg.d.ts" />

import React, { createRef, RefObject, useCallback, useEffect } from "react";
import {
  MdModeEdit,
  MdOutlineEditOff,
  MdOutlineFileCopy,
  MdOutlineFileDownload,
  MdOutlineFormatColorFill,
  MdOutlinePanTool,
  MdOutlinePrint,
  MdOutlineRedo,
  MdOutlineUndo,
  MdOutlineWaterDrop,
  MdOutlineWindow,
  MdSettingsInputAntenna,
  MdWaterDrop,
} from "react-icons/md";
import { BsHandIndexThumb, BsArrowsMove } from "react-icons/bs";
import { ReactComponent as Defs } from "./assets/defs.svg";
import meta, { GRID, DOTCOLORS } from "./meta.json";
// import useBuild, { ActionType } from "./build";
import { ModeType, Dot } from "./store";
import Board from "./Board";
import Landing from "./Landing";
// import useStore from "./store/control";
import DotButton from "./DotButton";
import StatusButton from "./StatusButton";
// import { useBuild as useStore } from "./store/build";
import useStore from "./store";

export const DOTS: { [key: string]: { size: number; rotate: number[] } } =
  meta.DOTS;
// export const GRID = 50;
// export const SHAPES = ["rect", "circle", "arc"];
// export const HASROTATE = ["arc"];
// export const BOARDCOLORS = {
//   "lego-blue": "#006CB7",
//   "lego-black": "#151515",
//   "lego-blue-bright": "#189E9F",
//   "lego-yellow-cool": "#FFF579",
//   "lego-orange-bright": "#F57D20",
//   "lego-purple-light": "#F6ADCD",
// };
// export const DOTCOLORS = {
//   "lego-blue": "#006CB7",
//   "lego-blue-light": "#00BED3",
//   "lego-green": "#00A850",
//   "lego-yellow": "#FFCD03",
//   "lego-lilac": "#BCA6D0",
//   "lego-coral": "#F96C62",
//   "lego-white": "#F3F1EF",
//   "lego-black": "#151515",
// };

export type BoardData = { [key: number]: Dot };
export type History = [Dot, number, number?];

const initBuild: BoardData = {
  // 123: ["circle", "yellow"],
  // 227: ["circle", "lilac"],
  // 207: ["circle", "lilac"],
  // 217: ["circle", "lilac"],
  // 27: ["circle", "green"],
  // 28: ["circle", "green"],
  // 3: ["arc", "blue-light", 2],
  // 4: ["arc", "blue-light", 3],
  // 19: ["arc", "blue-light", 1],
  // 20: ["arc", "blue-light", 0],
  // 44: ["rect", "green"],
  // 45: ["rect", "green"],
  // 60: ["rect", "green"],
  // 61: ["rect", "green"],
  // 76: ["rect", "green"],
  // 77: ["rect", "green"],
};

function App() {
  const current = useStore((state) => state.current);
  const mode = useStore((state) => state.mode);
  const setState = useStore((state) => state.setState);
  const [usedCount, setUsedCount] = React.useState<
    Array<[string, string, number]>
  >([]);

  useEffect(() => {
    console.log("current", current);
  }, [current]);
  return (
    <div className="App bg-base-100">
      <Defs />
      <div className="container h-screen p-4 lg:mx-auto grid grid-cols-[6rem_minmax(0,_1fr)] grid-rows-[6rem_minmax(0,_1fr)] [&>div]:rounded-lg gap-1">
        {/* status button */}
        <StatusButton />
        <div className="grid grid-cols-3 gap-x-1">
          <div className="bg-neutral col-span-2 grid grid-rows-[3rem_3rem] auto-cols-[3rem] [&>*]:h-full [&>*]:w-full [&>*]:p-1 rounded-md overflow-x-auto">
            {Object.keys(DOTS).map((shape) => (
              <div
                key={shape}
                className="row-start-1"
                onClick={() =>
                  setState((state) => {
                    if (state.mode === ModeType.LANDING) return {};
                    return {
                      current: [
                        shape,
                        state.current[1],
                        DOTS[shape].rotate.indexOf(state.current[2]) !== -1
                          ? state.current[2]
                          : 0,
                      ],
                      mode: ModeType.EDIT,
                    };
                  })
                }
              >
                <DotButton shape={shape} color={current[1]} rotate={0} />
              </div>
            ))}
            {Object.keys(DOTCOLORS).map((_color) => {
              const color = _color.slice(5);
              return mode === ModeType.FILL ? (
                <div
                  key={color}
                  className="row-start-2"
                  onClick={() =>
                    setState((state) => {
                      return {
                        current: [state.current[0], color, state.current[2]],
                      };
                    })
                  }
                >
                  <MdWaterDrop
                    key={color}
                    size={30}
                    className={`fill-lego-${color} w-full h-full`}
                  />
                </div>
              ) : (
                <div
                  key={color}
                  className="row-start-2"
                  onClick={() =>
                    setState((state) => {
                      if (state.mode === ModeType.LANDING) return {};
                      return {
                        current: [state.current[0], color, state.current[2]],
                        mode: ModeType.EDIT,
                      };
                    })
                  }
                >
                  <DotButton
                    shape={current[0]}
                    color={color}
                    rotate={current[2]}
                  />
                </div>
              );
            })}
          </div>
          <div className="row-span-2 bg-neutral h-full rounded-md"></div>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="rounded-lg grid grid-cols-2  justify-center items-center [&>div]:menu-div [&>div>svg]:menu-icon">
            <div
              className={mode === ModeType.DELETE ? "menu-div-selected" : ""}
              onClick={() => setState({ mode: ModeType.DELETE, selected: [] })}
            >
              <MdOutlineEditOff />
            </div>
            <div
              className={mode === ModeType.EDIT ? "menu-div-selected" : ""}
              onClick={() => setState({ mode: ModeType.EDIT, selected: [] })}
            >
              <MdModeEdit />
            </div>

            <div
              className={mode === ModeType.FILL ? "menu-div-selected" : ""}
              onClick={() => setState({ mode: ModeType.FILL, selected: [] })}
            >
              <MdOutlineFormatColorFill />
            </div>
            <div
              className={mode === ModeType.SELECT ? "menu-div-selected" : ""}
            >
              <BsHandIndexThumb
                onClick={() =>
                  setState({ mode: ModeType.SELECT, selected: [] })
                }
              />
            </div>

            <div>
              <MdOutlineUndo />
            </div>
            <div>
              <MdOutlineRedo />
            </div>
            <div
              onClick={() => setState({ mode: ModeType.LANDING, selected: [] })}
            >
              <MdOutlineWindow />
            </div>

            <div>
              <MdOutlineFileCopy />
            </div>
            <div>
              <MdOutlineFileDownload />
            </div>
            <div>
              <MdOutlinePrint />
            </div>
          </div>
          <div className="grid grid-cols-2 rounded-md">
            {usedCount
              .filter((d) => d[2] > 0)
              .map(([shape, color, occ], index) => (
                <div
                  key={[shape, color, occ, index].join(".")}
                  className="indicator p-0.5 w-full h-full"
                >
                  <span className="indicator-item indicator-center indicator-middle badge badge-xs badge-info text-info-content">
                    {occ}
                  </span>
                  <div
                    onClick={() => {
                      // setMode(ModeType.EDIT);
                      // setCurrent([shape, color, 0]);
                    }}
                  >
                    <DotButton shape={shape} color={color} rotate={0} />
                  </div>
                </div>
              ))}
          </div>
          {/* </div> */}
        </div>
        {mode === ModeType.LANDING ? (
          <Landing />
        ) : (
          <div className=" relative">
            <Board />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
