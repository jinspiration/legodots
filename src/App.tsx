import React, { useCallback } from "react";
import { ReactComponent as Defs } from "./assets/defs.svg";
import Sidebar from "./Sidebar";
import { GRID } from "./meta";
import useBuild from "./build";

export type Dot = [string, string];
export type History = [Dot, number, number?];
const initBuild: Array<History> = [
  [["circle", "yellow"], 123],
  [["circle", "purple"], 227],
  [["circle", "purple"], 207],
  [["circle", "purple"], 217],
  [["circle", "green"], 27],
  [["circle", "green"], 28],
  [["arc", "blue-light"], 3, 2],
  [["arc", "blue-light"], 4, 3],
  [["arc", "blue-light"], 19, 1],
  [["arc", "blue-light"], 20, 4],
  [["rect", "green"], 44],
  [["rect", "green"], 45],
  [["rect", "green"], 60, 1],
  [["rect", "green"], 61, 1],
  [["rect", "green"], 76, 1],
  [["rect", "green"], 77, 1],
];

function App() {
  const [[x, y], setXY] = React.useState<[number, number]>([0, 0]);
  const [[m, n], setDimensions] = React.useState([16, 16]);
  const [{ current, selected, used, build }, dispatch] = useBuild(initBuild);
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

  return (
    <div className="App">
      <Defs />
      <div className="container h-screen p-4 lg:mx-auto grid grid-cols-2 md-layout">
        <div className="bg-red-600">LEGO</div>
        <div className="bg-gray-300"></div>
        <div className="w-full">
          <Sidebar used={used} />
        </div>
        <svg
          id="board"
          viewBox={`0 0 ${m * GRID} ${n * GRID}`}
          color={"blue"}
          className={`bg-lego-blue max-h-full max-w-full`}
          // onClick={getSvgPoint}
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
          {build.map(([[shape, color], place, rotate]) => {
            if (place < 0) return null;
            const x = place % m,
              y = Math.floor(place / m);
            return (
              <use
                key={place.toString()}
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

// function clickBoard(e: React.MouseEvent<SVGRectElement, MouseEvent>) {}

export default App;
