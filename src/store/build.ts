import create from "zustand/vanilla";

type Dot = [string, string, number];
type Board = { [key: number]: Dot };
interface BuildStore {
  m: number;
  n: number;
  board: Board;
  pickedup: Board;
  load: (m: number, n: number, board: Board) => void;
}

export {};
