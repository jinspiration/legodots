import React from "react";
import { ReactComponent as Defs } from "./assets/defs.svg";
export type Dot = [string, string?, number?];
function App() {
  const dots: Array<Dot> = [
    ["rect", "blue"],
    ["arc", "green", 1],
    ["arc", "purple", 2],
    ["arc", "yellow", 3],
    ["arc", "blue", 0],
    ["circle", "green", 1],
    ["rect", "purple", 2],
    [""],
  ];
  return (
    <div className="App">
      <Defs />
      <h1 className="bg-lego-purple">title</h1>
      <div className="md:container md:mx-auto flex">
        <svg width={600} height={600}>
          <g transform={"scale(2) translate(10,10)"}>
            {dots.map((dot, index) => {
              const x = index % 4,
                y = Math.floor(index / 4);
              return (
                <use
                  href={"#" + dot[0]}
                  className={`fill-lego-${dot[1]}`}
                  transform={`translate(${x * 50},${y * 50}) rotate(${
                    (dot[2] ?? 0) * 90
                  } ${50 / 2} ${50 / 2}) `}
                />
                // <React.Fragment key={index.toString()}>
                //   <Dot dotProp={dotProp} x={x} y={y}></Dot>
                // </React.Fragment>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

export default App;
