import React from "react";
import { ReactComponent as Defs } from "./assets/defs.svg";

export type Dot = [string?, string?, number?];
const GRID = 50;
function App() {
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
  const [[x, y], setDimensions] = React.useState([16, 16]);
  return (
    <div className="App">
      <Defs />
      <h1 className="bg-lego-purple">title</h1>
      <div className="md:container md:mx-auto flex">
        <svg
          width={600}
          height={600}
          color={"blue"}
          className="border-2 bg-lego-blue"
        >
          <g transform={"scale(1) translate(10,10)"}>
            <rect
              className="bg-lego-blue"
              fill="url(#pattern)"
              // mask="url(#mask)"
              width={x * GRID}
              height={y * GRID}
            />

            {dots.map((dot, index) => {
              const x = index % 4,
                y = Math.floor(index / 4);
              return !!dot[0] ? (
                <use
                  href={"#" + dot[0]}
                  className={`fill-lego-${dot[1]}`}
                  transform={`translate(${x * 50},${y * 50}) rotate(${
                    (dot[2] ?? 0) * 90
                  } ${50 / 2} ${50 / 2}) `}
                />
              ) : null;
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

export default App;
