import React, { createRef, RefObject, useCallback, useEffect } from "react";
import {
  MdModeEdit,
  MdOutlineDeleteForever,
  MdOutlineEditOff,
  MdOutlineFileCopy,
  MdOutlineFileDownload,
  MdOutlineFormatColorFill,
  MdOutlineFormatShapes,
  MdOutlinePanTool,
  MdOutlinePrint,
  MdOutlineRedo,
  MdOutlineRotate90DegreesCcw,
  MdOutlineSelectAll,
  MdOutlineUndo,
  MdOutlineWaterDrop,
  MdOutlineWindow,
  MdWaterDrop,
} from "react-icons/md";
import { BsHandIndexThumb, BsArrowsMove } from "react-icons/bs";
import { ReactComponent as Defs } from "./assets/defs.svg";
import { GRID, SHAPES, BOARDCOLORS, DOTCOLORS, HASROTATE } from "./meta.js";
import useBuild, { ActionType } from "./build";
import { smartSelect } from "./helpers";
import { ModeType } from "./store/control";
import { Handler, useGesture } from "@use-gesture/react";
import Board from "./Board";
import Landing from "./Landing";
import useControl from "./store/control";

export type Dot = [string, string, number];
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
  const curBoard = useControl((state) => state.curBoard);
  const setBoard = useControl((state) => state.setBoard);
  const current = useControl((state) => state.current);
  const mode = useControl((state) => state.mode);
  const setMode = useControl((state) => state.setMode);
  const setCurrent = useControl((state) => state.setCurrent);
  // const [dimension, setDimensions] = React.useState<[number, number]>([8, 8]);
  // const [boardColor, setBoardColor] = React.useState<string>("");
  // const [current, setCurrent] = React.useState<Dot>(["rect", "blue-light"]);
  // const [curColor, setCurColor] = React.useState<string>("blue-light");
  // const [mode, setMode] = React.useState<ModeType>(ModeType.LANDING);
  const [{ used, board }, dispatch] = useBuild();
  // const [selected, setSelected] = React.useState<Selected>([]);
  const [usedCount, setUsedCount] = React.useState<
    Array<[string, string, number]>
  >([]);
  const chooseBoard = (m: number, n: number, color: string) => {
    dispatch({ type: ActionType.RESET });
    setBoard([m, n, color]);
  };
  const getPlace = useCallback(
    (x: number, y: number) => {
      const board = document.getElementById("board");
      let p = new DOMPoint(x, y);
      p = p.matrixTransform((board as any).getScreenCTM().inverse());
      // console.log(p.x, p.y);
      const j = Math.floor(p.x / GRID),
        i = Math.floor(p.y / GRID);
      // console.log("coordinate", i, j);
      return i * curBoard[1] + j;
    },
    [curBoard]
  );
  function rotateCurrent() {
    if (HASROTATE.includes(current[0])) {
      setCurrent([current[0], current[1], (current[2] + 1) % 4]);
    }
  }
  function handlePress(place: number) {
    switch (mode) {
      case ModeType.EDIT:
        return dispatch({
          type: ActionType.EDIT,
          payload: [[...current], place],
        });
      case ModeType.DELETE:
        return dispatch({ type: ActionType.DELETE, payload: place });
      case ModeType.FILL:
        return dispatch({
          type: ActionType.FILL,
          payload: [place, current[1]],
        });
    }
  }

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
    const usedArray = Object.entries(used).map(([dot, occ]) => {
      const [shape, color] = dot.split(".");
      return [shape, color, occ] as [string, string, number];
    });
    usedArray.sort((a, b) => {
      return b[2] - a[2];
    });
    setUsedCount(usedArray);
  }, [used]);
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
            <svg viewBox={`0 0 ${GRID} ${GRID}`} onClick={rotateCurrent}>
              <use
                href={"#" + current[0]}
                className={`fill-lego-${current[1]} w-full h-full`}
                transform={`rotate(${
                  current.length > 2 ? current[2]! * 90 : 0
                } ${GRID / 2} ${GRID / 2}) `}
              />
            </svg>
          )}
        </div>
        <div className="grid grid-cols-3 gap-x-1">
          {/* <div className="grid grid-cols-3 grid-flow-col gap-x-1 [&>div>svg]:w-full [&>div]:grid [&>div]:grid-flow-col [&>div]:auto-cols-[2.25rem] [&>div]:items-center [&>div]:px-0.5">
          <div className="col-span-2 grid grid-rows-2 grid-flow-col gap-x-1 [&>div>svg]:w-full [&>div]:grid [&>div]:grid-flow-col [&>div]:auto-cols-[2.25rem] [&>div]:items-center [&>div]:px-0.5"> */}
          <div className="bg-neutral col-span-2 grid grid-rows-[3rem_3rem] auto-cols-[3rem] [&>*]:h-full [&>*]:w-full [&>*]:p-1 rounded-md overflow-x-auto">
            {SHAPES.map((shape) => (
              <svg
                key={shape}
                className="row-start-1"
                viewBox={`0 0 ${GRID} ${GRID}`}
                onClick={() => {
                  setCurrent([shape, current[1], 0]);
                }}
              >
                <use href={"#" + shape} className={`fill-lego-${current[1]}`} />
              </svg>
            ))}
            {/* </div>
            <div className="col-span-2 bg-gray-800 h-full rounded-b-md"> */}
            {Object.keys(DOTCOLORS).map((_color) => {
              const color = _color.slice(5);
              return mode === ModeType.FILL ? (
                <div
                  key={color}
                  className="row-start-2 p-"
                  onClick={() => setCurrent([current[0], color, current[2]])}
                >
                  <MdWaterDrop
                    key={color}
                    size={30}
                    className={`fill-lego-${color} w-full h-full`}
                    onClick={() => setCurrent([current[0], color, current[2]])}
                  />
                </div>
              ) : (
                // </div>
                <svg
                  key={color}
                  className="row-start-2"
                  viewBox={`0 0 ${GRID} ${GRID}`}
                  onClick={() => {
                    setCurrent([current[0], color, current[2]]);
                  }}
                >
                  <use
                    href={current ? "#" + current[0] : "#rect"}
                    className={`fill-lego-${color} w-full h-full`}
                    transform={`rotate(${
                      current.length > 2 ? current[2]! * 90 : 0
                    } ${GRID / 2} ${GRID / 2}) `}
                  />
                </svg>
              );
            })}
            {/* </div> */}
          </div>
          <div className="row-span-2 bg-neutral h-full rounded-md"></div>
          {/* {mode === ModeType.DROP && (
            <div className="flex mx-1 p-2 justify-center items-center bg-success hover:bg-white rounded-lg">
              <MdOutlineDeleteForever className="w-full h-full hover:fill-red-500" />
            </div>
          )} */}
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
                dispatch({ type: ActionType.LOAD, payload: initBuild });
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
          {/* <div className="bg-neutral rounded-lg grow"> */}
          {/* <span className="w-full mt-2">OnBoard</span> */}
          <div className="bg-neutral flex flex-wrap rounded-md">
            {usedCount
              .filter((d) => d[2] > 0)
              .map(([shape, color, occ], index) => (
                <div
                  key={[shape, color, occ, index].join(".")}
                  className="basis-1/2 avatar indicator p-0.5"
                >
                  <span className="indicator-item indicator-center indicator-middle badge badge-xs badge-info text-info-content">
                    {occ}
                  </span>
                  <svg
                    className="w-full h-full"
                    viewBox={`0 0 ${GRID} ${GRID}`}
                    onClick={() => {
                      setMode(ModeType.EDIT);
                      setCurrent([shape, color, 0]);
                    }}
                  >
                    <use href={"#" + shape} className={`fill-lego-${color}`} />
                  </svg>
                </div>
              ))}
          </div>
          {/* </div> */}
        </div>
        {mode === ModeType.LANDING ? (
          <Landing chooseBoard={chooseBoard} />
        ) : (
          <div className=" relative">
            <Board
              boardColor={curBoard[2]}
              board={board}
              dimension={[curBoard[0], curBoard[1]]}
              handlePress={handlePress}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
