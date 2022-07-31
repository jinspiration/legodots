/// <reference path="./svg.d.ts" />

import React, { createRef, RefObject, useCallback, useEffect } from "react";
import { ReactComponent as Defs } from "./assets/defs.svg";
import { ModeType } from "./store";
import Board from "./Board";
import Select from "./Select";
import Menu from "./Menu";
import { StatusButton, DotButton } from "./Buttons";
import useStore from "./store";
import Used from "./Used";
import Edit from "./Edit";

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
  const mode = useStore((state) => state.mode);

  return (
    <div className="App bg-neutral-200 ">
      <Defs />
      <div className="container p-2 h-screen mx-auto grid grid-flow-row-dense grid-rows-[6rem_minmax(0,_1fr)_6rem] md:grid-rows-[6rem_minmax(0,1fr)] md:grid-cols-[6rem_minmax(0,_1fr)] [&>div>div]:rounded-lg gap-1 [&>div>div]:bg-zinc-700">
        {/* status button */}
        {/* <StatusButton /> */}
        {/* Edit area */}
        <Edit />
        {mode === ModeType.LANDING ? (
          <Menu />
        ) : (
          <>
            <Board />
            <div className="flex md:flex-col gap-1">
              <Used />
              <Select />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
