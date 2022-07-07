import { useReducer, useState } from "react";
import { BoardData, Dot, History } from "./App";
import { HASROTATE } from "./meta";

export type Used = { [key: string]: number };
export type State = {
  used: Used;
  board: BoardData;
  picked?: Array<Dot>;
};
export enum ActionType {
  LOAD = "load",
  EDIT = "edit",
  DELETE = "delete",
  FILL = "fill",
  REMOVE = "remove",
}
type Action =
  | { type: ActionType.LOAD; payload: BoardData }
  | { type: ActionType.EDIT; payload: [Dot, number] }
  | { type: ActionType.DELETE; payload: number }
  | { type: ActionType.FILL; payload: [number, string] }
  | { type: ActionType.REMOVE; payload: number };
function reducer(state: State, action: Action) {
  let board: BoardData = {},
    used: Used = {},
    current: Dot,
    place: number,
    curColor: string,
    key: string,
    _key: string;
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
    case ActionType.EDIT:
      [current, place] = action.payload;
      console.log("EDIT", place, current, place in state.board);
      key = current[0] + "." + current[1];
      used = { ...state.used };
      _key =
        place in state.board
          ? state.board[place][0] + "." + state.board[place][1]
          : "";
      if (
        key === _key &&
        HASROTATE.includes(current[0]) &&
        state.board[place][2] !== 3
      ) {
        console.log("rotating", place, state.board[place]);
        const replaceRotate: Dot = [
          current[0],
          current[1],
          state.board[place][2]! + 1,
        ];
        current[2]! += 1;
        return {
          used,
          board: { ...state.board, [place]: replaceRotate },
        };
      }
      //update _key in used record
      if (_key in used) used[_key] -= 1;

      if (key === _key) {
        //remove dot
        const { [place]: _, ...rest } = state.board;
        return {
          used,
          board: rest,
        };
      }
      // console.log("placing", current);
      // place current
      return {
        used: {
          ...used,
          [key]: key in used ? used[key] + 1 : 1,
        },
        board: { ...state.board, [place]: current },
      };
    case ActionType.DELETE:
      place = action.payload;
      if (place in state.board) {
        key = state.board[place][0] + "." + state.board[place][1];
        // used = { ...state.used, [key]: state.used[key] - 1 };
        const { [place]: _, ...rest } = state.board;
        return {
          used: { ...state.used, [key]: state.used[key] - 1 },
          board: rest,
        };
      }
      return state;

    case ActionType.FILL:
      [place, curColor] = action.payload;
      if (place in state.board && state.board[place][0] !== curColor) {
        key = state.board[place][0] + "." + curColor;
        _key = state.board[place][0] + "." + state.board[place][1];
        return {
          board: {
            ...state.board,
            [place]: [
              state.board[place][0],
              curColor,
              state.board[place][2],
            ] as Dot,
          },
          used: {
            ...state.used,
            [key]: key in state.used ? state.used[key] + 1 : 1,
            [_key]: state.used[_key] - 1,
          },
        };
      } else return state;
    // [place, curColor] = action.payload;
    // key = state.board[place][0] + "." + curColor;
    // _key = state.board[place][0] + "." + state.board[place][1];
    // if (place in state.board && key !== _key) {
    //   return {
    //     board: {
    //       ...state.board,
    //       [place]: [
    //         state.board[place][0],
    //         curColor,
    //         state.board[place][2],
    //       ] as Dot,
    //     },
    //     used: {
    //       ...state.used,
    //       [key]: key in state.used ? state.used[key] + 1 : 1,
    //       [_key]: state.used[_key] - 1,
    //     },
    //   };
    // } else return state;
    default:
      return state;
  }
}

function removeUsed(used: Used, key: string) {
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
  return used;
}
export default function useBuild(): [State, (action: Action) => void] {
  return useReducer(reducer, { used: {}, board: {} });
}
