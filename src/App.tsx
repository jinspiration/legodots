import React, { useCallback, useEffect } from "react";
import { ReactComponent as Defs } from "./assets/defs.svg";
import { GRID, SHAPES, COLORS, HASROTATE } from "./meta.js";
import useBuild, { ActionType } from "./build";

export type Dot = [string, string, number?];
export type Board = { [key: number]: Dot };
export type History = [Dot, number, number?];
const initBuild: Board = {
  123: ["circle", "yellow"],
  227: ["circle", "purple"],
  207: ["circle", "purple"],
  217: ["circle", "purple"],
  27: ["circle", "green"],
  28: ["circle", "green"],
  3: ["arc", "blue-light", 2],
  4: ["arc", "blue-light", 3],
  19: ["arc", "blue-light", 1],
  20: ["arc", "blue-light", 4],
  44: ["rect", "green"],
  45: ["rect", "green"],
  60: ["rect", "green", 1],
  61: ["rect", "green", 1],
  76: ["rect", "green", 1],
  77: ["rect", "green", 1],
};

function App() {
  const [[m, n], setDimensions] = React.useState([16, 16]);
  const [current, setCurrent] = React.useState<Dot>(["rect", "blue-light"]);
  const [{ used, board }, dispatch] = useBuild();
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
      return i * n + j;
    },
    [m, n]
  );
  useEffect(() => {
    console.log(current);
  }, [current]);
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
    <div className="App">
      <Defs />

      <div className="container h-screen p-4 lg:mx-auto grid grid-cols-2 md-layout">
        <svg
          className="p-0.5"
          viewBox={`0 0 ${GRID} ${GRID}`}
          onClick={() => {
            if (HASROTATE.includes(current[0])) {
              console.log("rotate");
              setCurrent([current[0], current[1], ((current[2] ?? 0) + 1) % 4]);
            }
          }}
        >
          <use
            href={"#" + current[0]}
            className={`fill-lego-${current[1]} w-full h-full`}
            transform={`rotate(${current.length > 2 ? current[2]! * 90 : 0} ${
              GRID / 2
            } ${GRID / 2}) `}
          />
        </svg>
        <div className="flex flex-col items-start bg-yellow-300 p-1">
          <div className="flex basis-1/2">
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
          <div className="flex basis-1/2">
            {Object.keys(COLORS).map((color) => (
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
        <div className="w-full">
          <div className="bg-gray-300 flex flex-col h-80 justify-around">
            <button
              onClick={() => {
                dispatch({ type: ActionType.LOAD, payload: [m, n, initBuild] });
              }}
            >
              Load
            </button>
            <button onClick={() => setDimensions([32, 32])}>32</button>
            <button onClick={() => setDimensions([16, 16])}>16</button>
          </div>
          <div className="flex flex-wrap bg-green-200 grow p-1">
            {usedCount.map(([shape, color, occ], index) => (
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
                >
                  <use href={"#" + shape} className={`fill-lego-${color}`} />
                </svg>
              </div>
            ))}
          </div>
          {/* <SidePanel used={used} current={current} setCurrent={setCurrent} /> */}
        </div>
        <svg
          id="board"
          viewBox={`0 0 ${m * GRID} ${n * GRID}`}
          color={"blue"}
          className={`bg-lego-blue max-h-full max-w-full`}
        >
          <rect
            onClick={(e) => {
              console.log("place", getPlace(e.clientX, e.clientY));
            }}
            className="bg-lego-blue"
            fill="url(#pattern)"
            width={m * GRID}
            height={n * GRID}
          />
          {Object.entries(board).map(([_place, [shape, color, rotate]]) => {
            const place = parseInt(_place);
            if (place < 0) return null;
            const x = place % m,
              y = Math.floor(place / m);
            return (
              <use
                key={_place}
                onClick={(e) => {
                  console.log("onShape", getPlace(e.clientX, e.clientY));
                }}
                href={"#" + shape}
                className={`fill-lego-${color} hover:fill-white`}
                transform={`translate(${x * GRID},${y * GRID}) rotate(${
                  (rotate ?? 0) * 90
                } ${GRID / 2} ${GRID / 2}) `}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default App;
