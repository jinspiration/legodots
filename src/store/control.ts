import create from "zustand";
import { Dot } from "~/App";
import { devtools, persist } from "zustand/middleware";

export enum ModeType {
  LANDING = "LANDING",
  EDIT = "edit",
  DELETE = "delete",
  SELECT = "select",
  DROP = "drop",
  FILL = "fill",
}

interface ControlStore {
  curBoard: [number, number, string];
  current: Dot;
  selected: number[];
  mode: ModeType;
  setBoard: (cb: [number, number, string]) => void;
  setMode: (m: ModeType) => void;
  setCurrent: (c: Dot) => void;
}

const useControl = create<ControlStore>()(
  devtools((set) => ({
    curBoard: [0, 0, ""],
    current: ["rect", "blue-light", 0],
    selected: [],
    mode: ModeType.LANDING,
    setMode: (m: ModeType) => set((state) => ({ mode: m })),
    setCurrent: (c: Dot) => set((state) => ({ current: c })),
    setBoard: (cb: [number, number, string]) =>
      set((state) => ({ curBoard: cb, mode: ModeType.EDIT })),
  }))
);
export default useControl;
