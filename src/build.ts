import { useReducer, useState } from "react";
import { Board, Dot, History } from "./App";

export type Used = { [key: string]: number };
export type State = {
  used: Used;
  board: Board;
};
export enum ActionType {
  LOAD = "load",
}
type Action = { type: ActionType.LOAD; payload: [number, number, Board] };
function reducer(state: State, action: Action) {
  let board: Board = {},
    used: Used = {};
  switch (action.type) {
    case ActionType.LOAD:
      used = {};
      Object.values(action.payload[2]).forEach(([shape, color]) => {
        const key = shape + "." + color;
        if (key in used) {
          used[key] += 1;
        } else {
          used[key] = 1;
        }
      });
      return { used, board: action.payload[2] };
    default:
      return state;
  }
}

export default function useBuild(): [State, (action: Action) => void] {
  const [used, setUsed] = useState<Used>({});
  const [board, setBoard] = useState<Board>({});
  return useReducer(reducer, { used, board });
}
