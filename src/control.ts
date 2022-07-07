import { useReducer } from "react";
import { Dot } from "./App";
import { HASROTATE } from "./meta";

export type Selected = Array<[number, Dot]>;

export enum ModeType {
  LANDING = "LANDING",
  EDIT = "edit",
  DELETE = "delete",
  SELECT = "select",
  DROP = "drop",
  MULTISELECT = "multiselect",
  MULTIDROP = "multidrop",
  FILL = "fill",
  MULTIFILL = "multifill",
  PAN = "pan",
}

export type ControlState = {
  mode: ModeType;
  current: Dot;
  selected: [number];
};

export enum ControlActionType {
  BUTTON = "button",
  SHAPE = "shape",
  COLOR = "color",
  ROTATE = "rotate",
}
type ControlAction =
  | { type: ControlActionType.BUTTON; payload: string }
  | { type: ControlActionType.SHAPE; payload: string }
  | { type: ControlActionType.COLOR; payload: string }
  | { type: ControlActionType.ROTATE };

function reducer(state: ControlState, action: ControlAction) {
  switch (action.type) {
    case ControlActionType.BUTTON:
      return { ...state, mode: action.payload };
    case ControlActionType.SHAPE:
      // rotate or mute
      if (state.current[0] === action.payload)
        return HASROTATE.includes(action.payload)
          ? {
              ...state,
              current: [
                state.current[0],
                state.current[1],
                (state.current[2] = 1) % 4,
              ] as Dot,
            }
          : state;

      // switch
      return HASROTATE.includes(action.payload)
        ? { ...state, current: [action.payload, state.current[1], 0] as Dot }
        : {
            ...state,
            current: [
              action.payload,
              state.current[1],
              state.current[2],
            ] as Dot,
          };
    case ControlActionType.COLOR:
      return HASROTATE.includes(action.payload)
        ? { ...state, current: [state.current[0], state.current[1], 0] as Dot }
        : {
            ...state,
            current: [
              action.payload,
              state.current[1],
              state.current[2],
            ] as Dot,
          };
    case ControlActionType.ROTATE:
      return {
        ...state,
        current: [
          state.current[0],
          state.current[1],
          (state.current[2]! + 1) % 4,
        ] as Dot,
      };
    default:
      return state;
  }
}
// export default function useControl(): [
//   ControlState,
//   (action: ControlAction) => void
// ] {
//   const [state, dispatch] = useReducer(reducer, {
//     mode: ModeType.EDIT,
//     current: ["rect", "blue-light"],
//     selected: [],
//   });
//   return [state, dispatch];
// }
