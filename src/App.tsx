import React from "react";
import { ReactComponent as Defs } from "./assets/defs.svg";
import Sidebar from "./Sidebar";
import { GRID } from "./meta";
export type Dot = [string?, string?, number?];

const dots: Array<Dot> = [
  ["rect", "blue-light"],
  ["arc", "green", 1],
  ["arc", "purple", 2],
  ["arc", "yellow", 3],
  ["arc", "blue-light", 0],
  ["circle", "green", 1],
  ["rect", "purple", 2],
  [],
];

function App() {
  const [[x, y], setXY] = React.useState<[number, number]>([0, 0]);
  const [[m, n], setDimensions] = React.useState([16, 16]);

  return (
    <div className="App">
      <Defs />
      <div className="container h-screen p-4 grid grid-cols-2 md-layout">
        <div className="bg-yellow-300">LEGO</div>
        <div className="bg-gray-300"></div>
        <div className="w-full bg-indigo-300">
          <Sidebar />
        </div>
        <svg
          viewBox={`0 0 ${m * GRID} ${n * GRID}`}
          color={"blue"}
          className={`border-2 bg-lego-blue max-h-full max-w-full`}
        >
          <rect
            className="bg-lego-blue"
            fill="url(#pattern)"
            // mask="url(#mask)"
            width={m * GRID}
            height={n * GRID}
          />

          {dots.map((dot, index) => {
            const x = index % 4,
              y = Math.floor(index / 4);
            return !!dot[0] ? (
              <use
                href={"#" + dot[0]}
                className={`fill-lego-${dot[1]} hover:fill-white border-2 border-black`}
                transform={`translate(${x * 50},${y * 50}) rotate(${
                  (dot[2] ?? 0) * 90
                } ${50 / 2} ${50 / 2}) `}
              />
            ) : (
              <use
                className="opacity-0"
                href="#rect"
                transform={`translate(${x * 50},${y * 50}) `}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default App;
