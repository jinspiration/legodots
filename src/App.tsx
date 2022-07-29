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
import { DOTS, DOTCOLORS } from "./meta";
// import useBuild, { ActionType } from "./build";
import { ModeType } from "./store";
import Board from "./Board";
import Landing from "./Landing";
// import useStore from "./store/control";
import DotButton from "./DotButton";
import StatusButton from "./StatusButton";
// import { useBuild as useStore } from "./store/build";
import useStore from "./store";
import Used from "./Used";

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
                        DOTS[shape].rotate.indexOf(state.current[1]) !== -1
                          ? state.current[1]
                          : 0,
                        state.current[2],
                      ],
                      mode: ModeType.EDIT,
                    };
                  })
                }
              >
                <DotButton shape={shape} rotate={0} color={current[2]} />
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
                        current: [state.current[0], state.current[1], color],
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
                        current: [state.current[0], state.current[1], color],
                        mode: ModeType.EDIT,
                      };
                    })
                  }
                >
                  <DotButton
                    shape={current[0]}
                    rotate={current[1]}
                    color={color}
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
              onClick={() => setState({ mode: ModeType.DELETE })}
            >
              <MdOutlineEditOff />
            </div>
            <div
              className={mode === ModeType.EDIT ? "menu-div-selected" : ""}
              onClick={() => setState({ mode: ModeType.EDIT })}
            >
              <MdModeEdit />
            </div>

            <div
              className={mode === ModeType.FILL ? "menu-div-selected" : ""}
              onClick={() => setState({ mode: ModeType.FILL })}
            >
              <MdOutlineFormatColorFill />
            </div>
            <div
              className={mode === ModeType.SELECT ? "menu-div-selected" : ""}
            >
              <BsHandIndexThumb
                onClick={() => setState({ mode: ModeType.SELECT })}
              />
            </div>

            <div>
              <MdOutlineUndo />
            </div>
            <div>
              <MdOutlineRedo />
            </div>
            <div onClick={() => setState({ mode: ModeType.LANDING })}>
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
          <Used />
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
