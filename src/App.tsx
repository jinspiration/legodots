import React from "react";
import { DotProp, Dot } from "./Dot";

function App() {
  const dots: Array<DotProp> = [
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
      <h1 className="bg-lego-purple">title</h1>
      <div className="md:container md:mx-auto">
        <svg>
          {dots.map((dotProp, index) => (
            <React.Fragment key={index.toString()}>
              <Dot dotProp={dotProp} index={index}></Dot>
            </React.Fragment>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default App;
