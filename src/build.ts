import { useReducer, useState } from "react";
import { Board, Dot, History } from "./App";

export type Used = { [key: string]: number };
export type State = {
  used: Used;
  board: Board;
};
export enum ActionType {
  LOAD = "load",
  PLACE = "place",
  REMOVE = "remove",
}
type Action =
  | { type: ActionType.LOAD; payload: Board }
  | { type: ActionType.PLACE; payload: [Dot, number] }
  | { type: ActionType.REMOVE; payload: number };
function reducer(state: State, action: Action) {
  let board: Board = {},
    used: Used = {},
    dot: Dot,
    place: number,
    key: string;
  switch (action.type) {
    case ActionType.LOAD:
      used = {};
      Object.values(action.payload).forEach(([shape, color]) => {
        const key = shape + "." + color;
        if (key in used) {
          used[key] += 1;
        } else {
          used[key] = 1;
        }
      });
      return { used, board: action.payload };
    case ActionType.PLACE:
      [dot, place] = action.payload;
      key = dot[0] + "." + dot[1];
      return {
        used: {
          ...state.used,
          [key]: key in state.used ? state.used[key] + 1 : 1,
        },
        board: { ...state.board, [place]: dot },
      };
    case ActionType.REMOVE:
      place = action.payload;
      dot = state.board[action.payload];
      key = dot[0] + "." + dot[1];
      used = { ...state.used };
      if (key in used) {
        used[key] -= 1;
        if (used[key] === 0) {
          Object.entries(used).forEach(([k, v]) => {
            if (k !== key && v < 1) {
              used[k] -= 1;
              if (used[k] === -4) {
                delete used[k];
              }
            }
          });
        }
      }
      const { [place]: _, ...rest } = state.board;
      return { used, board: rest };
    default:
      return state;
  }
}

export default function useBuild(): [State, (action: Action) => void] {
  return useReducer(reducer, { used: {}, board: {} });
}
