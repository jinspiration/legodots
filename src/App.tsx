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
import LegoIcon from "./LegoIcon";
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
  // const curBoard = useStore((state) => state.curBoard);
  // const setBoard = useStore((state) => state.setBoard);
  const current = useStore((state) => state.current);
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);
  const setCurrent = useStore((state) => state.setCurrent);
  // const [dimension, setDimensions] = React.useState<[number, number]>([8, 8]);
  // const [boardColor, setBoardColor] = React.useState<string>("");
  // const [current, setCurrent] = React.useState<Dot>(["rect", "blue-light"]);
  // const [curColor, setCurColor] = React.useState<string>("blue-light");
  // const [mode, setMode] = React.useState<ModeType>(ModeType.LANDING);
  // const [{ used, board }, dispatch] = useBuild();
  // const edit = useStore((state) => state.edit);
  // const start = useStore((state) => state.start);
  // const [selected, setSelected] = React.useState<Selected>([]);
  const [usedCount, setUsedCount] = React.useState<
    Array<[string, string, number]>
  >([]);
  // const chooseBoard = (m: number, n: number, color: string) => {
  //   reset();
  //   // dispatch({ type: ActionType.RESET });
  //   setBoard([m, n, color]);
  // };
  // const getPlace = useCallback(
  //   (x: number, y: number) => {
  //     const board = document.getElementById("board");
  //     let p = new DOMPoint(x, y);
  //     p = p.matrixTransform((board as any).getScreenCTM().inverse());
  //     // console.log(p.x, p.y);
  //     const j = Math.floor(p.x / GRID),
  //       i = Math.floor(p.y / GRID);
  //     // console.log("coordinate", i, j);
  //     return i * curBoard[1] + j;
  //   },
  //   [curBoard]
  // );
  function rotateCurrent() {
    const rotate = DOTS[current[0]].rotate;
    const ir = rotate.indexOf(current[2]);
    setCurrent([current[0], current[1], rotate[(ir + 1) % rotate.length]]);
  }
  // function handlePress(i: number, j: number) {
  //   switch (mode) {
  //     case ModeType.EDIT:
  //       return edit(i, j, current);
  //     // return dispatch({
  //     //   type: ActionType.EDIT,
  //     //   payload: [current, place],
  //     // });
  //     // case ModeType.DELETE:
  //     //   return dispatch({ type: ActionType.DELETE, payload: place });
  //     // case ModeType.FILL:
  //     //   return dispatch({
  //     //     type: ActionType.FILL,
  //     //     payload: [place, current[1]],
  //     //   });
  //   }
  // }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case "r":
          rotateCurrent();
          break;
      }
    };
    document.body.addEventListener("keydown", handleKey);
    return () => {
      document.body.removeEventListener("keydown", handleKey);
    };
  }, []);
  useEffect(() => {
    console.log("current", current);
  }, [current]);
  // useEffect(() => {
  //   const usedArray = Object.entries(used).map(([dot, occ]) => {
  //     const [shape, color] = dot.split(".");
  //     return [shape, color, occ] as [string, string, number];
  //   });
  //   usedArray.sort((a, b) => {
  //     return b[2] - a[2];
  //   });
  //   setUsedCount(usedArray);
  // }, [used]);
  return (
    <div className="App bg-base-100">
      <Defs />
      <div className="container h-screen p-4 lg:mx-auto grid grid-cols-[6rem_minmax(0,_1fr)] grid-rows-[6rem_minmax(0,_1fr)] [&>div]:rounded-lg gap-1">
        <div className="p-2">
          {mode === ModeType.FILL ? (
            <div>
              <MdWaterDrop
                size={30}
                className={`fill-lego-${current[1]} w-full h-full`}
              />
            </div>
          ) : (
            <div onClick={rotateCurrent}>
              <LegoIcon
                shape={current[0]}
                color={current[1]}
                rotate={current[2]}
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-x-1">
          <div className="bg-neutral col-span-2 grid grid-rows-[3rem_3rem] auto-cols-[3rem] [&>*]:h-full [&>*]:w-full [&>*]:p-1 rounded-md overflow-x-auto">
            {Object.keys(DOTS).map((shape) => (
              <div
                key={shape}
                className="row-start-1"
                onClick={() =>
                  setCurrent([
                    shape,
                    current[1],
                    DOTS[shape].rotate.indexOf(current[2]) !== -1
                      ? current[2]
                      : 0,
                  ])
                }
              >
                <LegoIcon shape={shape} color={current[1]} rotate={0} />
              </div>
            ))}
            {Object.keys(DOTCOLORS).map((_color) => {
              const color = _color.slice(5);
              return mode === ModeType.FILL ? (
                <div
                  key={color}
                  className="row-start-2"
                  onClick={() => setCurrent([current[0], color, current[2]])}
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
                  onClick={() => {
                    setCurrent([current[0], color, current[2]]);
                  }}
                >
                  <LegoIcon
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
              onClick={() => {
                setMode(ModeType.DELETE);
                // setSelected([]);
              }}
            >
              <MdOutlineEditOff />
            </div>
            <div
              className={mode === ModeType.EDIT ? "menu-div-selected" : ""}
              onClick={() => {
                setMode(ModeType.EDIT);
                // setSelected([]);
              }}
            >
              <MdModeEdit />
            </div>

            <div
              className={mode === ModeType.FILL ? "menu-div-selected" : ""}
              onClick={() => {
                setMode(ModeType.FILL);
                // setSelected([]);
              }}
            >
              <MdOutlineFormatColorFill />
            </div>
            <div
              className={mode === ModeType.SELECT ? "menu-div-selected" : ""}
            >
              <MdOutlinePanTool
                onClick={() => {
                  setMode(ModeType.SELECT);
                  // setSelected([]);
                }}
              />
            </div>

            <div>
              <MdOutlineUndo />
            </div>
            <div>
              <MdOutlineRedo />
            </div>
            <div
              onClick={() => {
                setMode(ModeType.LANDING);
              }}
            >
              <MdOutlineWindow />
            </div>

            <div
              onClick={() => {
                // dispatch({ type: ActionType.LOAD, payload: initBuild });
              }}
            >
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
            {/* <div className="bg-neutral flex flex-wrap rounded-md"> */}
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
                      setMode(ModeType.EDIT);
                      setCurrent([shape, color, 0]);
                    }}
                  >
                    <LegoIcon shape={shape} color={color} rotate={0} />
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
            <Board
            // boardColor={curBoard[2]}
            // board={{}}
            // dimension={[curBoard[0], curBoard[1]]}
            // handlePress={handlePress}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
