import { useReducer, useState } from "react";
import { Dot, History } from "./App";
export type Used = { [key: string]: number };
export type State = {
  current: [Dot, number?] | null;
  selected: number | null;
  used: Used;
  build: Array<History>;
};

type Action = { type: string; payload: any };
function reducer(state: State, action: Action) {
  switch (action.type) {
    case "SET_BOARD":
      return action.payload;
    default:
      return state;
  }
}

export default function useBuild(
  initBuild: Array<History>
): [State, (action: Action) => void] {
  const [current, setCurrent] = useState<[Dot, number?] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [used, setUsed] = useState<Used>({});
  const [build, setBuild] = useState(initBuild || []);
  build.forEach((history) => {
    const key = history[0].join(".");
    if (key in used) {
      used[key]++;
    } else {
      used[key] = 1;
    }
  });
  return useReducer(reducer, { current, selected, used, build });
}
