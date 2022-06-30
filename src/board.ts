import { useReducer } from "React";
import { Dot } from "./App";

export type State = {
  current: Dot | null;
  selected: number | null;
  board: Array<Dot>;
};
function reducer(state: State, action: any) {
  switch (action.type) {
    case "SET_BOARD":
      return action.payload;
    default:
      return state;
  }
}

export default function useBoard(initState: State) {
  return useReducer(reducer, initState);
}
