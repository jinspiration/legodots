import React, { useCallback, useEffect } from "react";
import {
  MdModeEdit,
  MdOutlineDeleteForever,
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
  MdOutlineWindow,
} from "react-icons/md";
import { BsHandIndexThumb, BsArrowsMove } from "react-icons/bs";
import { ReactComponent as Defs } from "./assets/defs.svg";
import { GRID, SHAPES, BOARDCOLORS, DOTCOLORS, HASROTATE } from "./meta.js";
import useBuild, { ActionType } from "./build";
import { smartSelect } from "./helpers";

export type Dot = [string, string, number?];
export type Board = { [key: number]: Dot };
export type History = [Dot, number, number?];
export type Selected = Array<[number, Dot]>;
export enum ModeType {
  EDIT = "edit",
  SELECT = "select",
  DROP = "drop",
  MULTISELECT = "multiselect",
  MULTIDROP = "multidrop",
  PAN = "pan",
}
const initBuild: Board = {
  123: ["circle", "yellow"],
  227: ["circle", "lilac"],
  207: ["circle", "lilac"],
  217: ["circle", "lilac"],
  27: ["circle", "green"],
  28: ["circle", "green"],
  3: ["arc", "blue-light", 2],
  4: ["arc", "blue-light", 3],
  19: ["arc", "blue-light", 1],
  20: ["arc", "blue-light", 0],
  44: ["rect", "green"],
  45: ["rect", "green"],
  60: ["rect", "green"],
  61: ["rect", "green"],
  76: ["rect", "green"],
  77: ["rect", "green"],
};

function App() {
  const [dimension, setDimensions] = React.useState([16, 16]);
  const [current, setCurrent] = React.useState<Dot>(["rect", "blue-light  "]);
  const [mode, setMode] = React.useState<ModeType>(ModeType.SELECT);
  const [{ used, board }, dispatch] = useBuild();
  const [selected, setSelected] = React.useState<Selected>([]);
  const [droppable, setDroppable] = React.useState(false);
  const [usedCount, setUsedCount] = React.useState<
    Array<[string, string, number]>
  >([]);
  const getPlace = useCallback(
    (x: number, y: number) => {
      const svg = document.getElementById("board");
      let p = new DOMPoint(x, y);
      p = p.matrixTransform((svg as any).getScreenCTM().inverse());
      const j = Math.floor(p.x / GRID),
        i = Math.floor(p.y / GRID);
      console.log("coordinate", i, j);
      return i * dimension[0] + j;
    },
    [dimension]
  );
  function rotateCurrent() {
    setCurrent((current) => {
      if (HASROTATE.includes(current[0])) {
        return [current[0], current[1], ((current[2] ?? 0) + 1) % 4];
      } else {
        return current;
      }
    });
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
    console.log(
      mode,
      selected.map(([i, dot]) => i)
    );
  }, [mode, selected]);
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
    <div className="App bg-cyan-300 ">
      <Defs />
      <div className="container h-screen p-4 lg:mx-auto grid grid-cols-2 md-layout">
        <svg
          className="m-1 p-2 bg-gray-100 rounded-lg "
          viewBox={`0 0 ${GRID} ${GRID}`}
          onClick={rotateCurrent}
        >
          <use
            href={"#" + current[0]}
            className={`fill-lego-${current[1]} w-full h-full`}
            transform={`rotate(${current.length > 2 ? current[2]! * 90 : 0} ${
              GRID / 2
            } ${GRID / 2}) `}
          />
        </svg>
        <div className=" m-1 flex justify-between rounded-lg ">
          <div className="flex flex-col grow rounded-lg items-start bg-white p-1">
            <div className="flex basis-1/2 max-w-full">
              {SHAPES.map((shape) => (
                <svg
                  key={shape}
                  className="h-full p-0.5"
                  viewBox={`0 0 ${GRID} ${GRID}`}
                  onClick={() => {
                    setCurrent([shape, current[1]]);
                  }}
                >
                  <use
                    href={"#" + shape}
                    className={`fill-lego-${current[1]} w-full h-full`}
                  />
                </svg>
              ))}
            </div>
            <div className="flex basis-1/2 max-w-full ">
              {Object.keys(DOTCOLORS).map((color) => (
                <svg
                  key={color}
                  className="h-full p-0.5"
                  viewBox={`0 0 ${GRID} ${GRID}`}
                  onClick={() => {
                    setCurrent([current[0], color.slice(5)]);
                  }}
                >
                  <use
                    href={current ? "#" + current[0] : "#rect"}
                    className={`fill-${color} w-full h-full`}
                    transform={`rotate(${
                      current.length > 2 ? current[2]! * 90 : 0
                    } ${GRID / 2} ${GRID / 2}) `}
                  />
                </svg>
              ))}
            </div>
          </div>
          {mode === ModeType.DROP && (
            <div className="flex mx-1 p-2 justify-center items-center bg-red-500 hover:bg-white rounded-lg">
              <MdOutlineDeleteForever className="w-full h-full hover:fill-red-500" />
            </div>
          )}
        </div>
        <div className="w-full flex flex-col gap-y-1 mt-1">
          <div className="rounded-lg bg-lego-yellow grid  grid-cols-2  justify-center items-center [&>div]:menu-div [&>div>svg]:menu-icon">
            <div>
              <MdOutlineFormatShapes />
            </div>
            <div
              className={
                mode === ModeType.EDIT ? "bg-red-500 ring-red-500" : ""
              }
              onClick={() => {
                setMode(ModeType.EDIT);
                setSelected([]);
              }}
            >
              <MdModeEdit />
            </div>
            <div
              className={
                mode === ModeType.MULTISELECT
                  ? "bg-red-500"
                  : mode === ModeType.MULTIDROP
                  ? "bg-blue-500"
                  : ""
              }
            >
              <MdOutlinePanTool
                onClick={() => {
                  setMode(ModeType.MULTISELECT);
                  setSelected([]);
                }}
              />
            </div>
            <div>
              <BsHandIndexThumb
                className={
                  mode === ModeType.SELECT
                    ? "bg-red-500"
                    : mode === ModeType.DROP
                    ? "bg-blue-500"
                    : ""
                }
                onClick={() => {
                  setMode(ModeType.SELECT);
                  setSelected([]);
                }}
              />
            </div>
            <div>
              <MdOutlineRotate90DegreesCcw />
            </div>
            <div>
              <BsArrowsMove />
            </div>

            <div>
              <MdOutlineUndo />
            </div>
            <div>
              <MdOutlineRedo />
            </div>
          </div>
          <div className="rounded-lg bg-lego-lilac grid grid-cols-2 [&>div]:menu-div [&>div>svg]:menu-icon">
            <div>
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
          <div className="text-center rounded-lg bg-lego-green p-1">
            <span className="w-full mt-2">OnBoard</span>
            <div className="flex flex-wrap rounded-md bg-white ">
              {usedCount
                .filter((d) => d[2] > 0)
                .map(([shape, color, occ], index) => (
                  <div
                    key={[shape, color, occ, index].join(".")}
                    className="basis-1/2 relative"
                  >
                    <span className="absolute bottom-0 right-0 text-sm w-4 text-center bg-white rounded-full font-mono">
                      {occ}
                    </span>
                    <svg
                      className="basis-1/2 p-0.5"
                      viewBox={`0 0 ${GRID} ${GRID}`}
                      onClick={() => {
                        setCurrent([shape, color]);
                      }}
                    >
                      <use
                        href={"#" + shape}
                        className={`fill-lego-${color}`}
                      />
                    </svg>
                  </div>
                ))}
            </div>
          </div>
          <div className="text-center rounded-lg bg-lego-coral p-1">
            <span className="w-full mt-1">Used</span>

            <div className="flex flex-wrap rounded-md bg-white">
              {usedCount
                .filter((d) => d[2] < 1)
                .map(([shape, color, occ], index) => (
                  <div
                    key={[shape, color, occ, index].join(".")}
                    className="basis-1/2 relative"
                  >
                    <svg
                      className="basis-1/2 p-0.5"
                      viewBox={`0 0 ${GRID} ${GRID}`}
                      onClick={() => {
                        setCurrent([shape, color]);
                      }}
                    >
                      <use
                        href={"#" + shape}
                        className={`fill-lego-${color}`}
                      />
                    </svg>
                  </div>
                ))}
            </div>
          </div>
          {/* <SidePanel used={used} current={current} setCurrent={setCurrent} /> */}
        </div>
        <svg
          id="board"
          viewBox={`0 0 ${dimension[0] * GRID} ${dimension[1] * GRID}`}
          className={`bg-lego-blue rounded-md m-1 max-h-full max-w-full`}
        >
          <rect
            onClick={(e) => {
              e.preventDefault();
              if (mode === ModeType.EDIT) {
                const place = getPlace(e.clientX, e.clientY);
                console.log("place", place, current);
                dispatch({
                  type: ActionType.PLACE,
                  payload: [current, place],
                });
              }
            }}
            className="bg-lego-blue"
            fill="url(#pattern)"
            width={dimension[0] * GRID}
            height={dimension[1] * GRID}
          />
          {Object.entries(board).map(([_place, [shape, color, rotate]]) => {
            const place = parseInt(_place);
            if (place < 0) return null;
            const x = place % dimension[0],
              y = Math.floor(place / dimension[0]);
            return (
              // <>
              <use
                key={_place}
                onClick={(e) => {
                  e.preventDefault();
                  if (mode === ModeType.EDIT) {
                    const place = getPlace(e.clientX, e.clientY);
                    console.log("remove", place, [shape, color]);
                    dispatch({
                      type: ActionType.REMOVE,
                      payload: place,
                    });
                  } else if (mode === ModeType.SELECT) {
                    setSelected([[place, board[place]]]);
                    setMode(ModeType.DROP);
                  } else if (mode === ModeType.DROP) {
                    if (selected[0][0] === place) {
                      setMode(ModeType.SELECT);
                      setSelected([]);
                    } else if (selected[0][0] in board) {
                      setSelected([[place, board[place]]]);
                    } else {
                      //dispatch
                      console.log("dispatch");
                    }
                  } else if (mode === ModeType.MULTISELECT) {
                    const _select = smartSelect(board, dimension[0], place);
                    console.log("smartSelect", place, _select);
                    setSelected(_select);
                    setMode(ModeType.MULTIDROP);
                  } else if (mode === ModeType.MULTIDROP) {
                    if (droppable) {
                      //dispatch
                      console.log("dispatch");
                    } else {
                      setMode(ModeType.MULTISELECT);
                      setSelected([]);
                    }
                  }
                }}
                href={"#" + shape}
                className={`fill-lego-${color} hover:fill-white`}
                transform={`translate(${x * GRID},${y * GRID}) rotate(${
                  (rotate ?? 0) * 90
                } ${GRID / 2} ${GRID / 2}) `}
              />
              //   <text
              //     x="25"
              //     y="25"
              //     transform={`translate(${x * GRID},${y * GRID})`}
              //   >
              //     {rotate ?? 0}
              //   </text>
              // </>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default App;
