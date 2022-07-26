import create from "zustand";
// import { Dot } from "./App";
import { devtools, persist } from "zustand/middleware";
import produce, {
  produceWithPatches,
  Draft,
  enablePatches,
  Patch,
} from "immer";
// import { WritableDraft } from "immer/dist/internal";

enablePatches();
export type Dot = [string, string, number];
export type DotOnBoard = [number, string, string, number];
type Board = { [key: string]: Array<DotOnBoard> };
export enum ModeType {
  LANDING = "LANDING",
  EDIT = "edit",
  DELETE = "delete",
  SELECT = "select",
  DROP = "drop",
  FILL = "fill",
}

interface Store {
  current: Dot;
  selected: number[];
  mode: ModeType;
  board: Board;
  color: string;
  m: number;
  n: number;
  start: (color: string, m: number, n: number, board?: Board) => void;
  setMode: (m: ModeType) => void;
  setCurrent: (c: Dot) => void;
  press: (i: number, j: number) => void;
}

const redoStack: Patch[][] = [];
const undoStack: Patch[][] = [];

type mutator = (draft: Draft<Board>, ...args: any) => void;

const recordBoard = (
  board: Board,
  recipe: (draft: Draft<Board>) => void
): Board => {
  const [nextBoard, patches, inversePatches] = produceWithPatches(
    board,
    recipe
  );
  if (patches.length > 0) redoStack.push(patches);
  if (inversePatches.length > 0) undoStack.push(inversePatches);
  console.log("record", patches);
  return nextBoard;
};

const useStore = create<Store>()(
  devtools((set) => ({
    // state
    current: ["rect", "blue-light", 0],
    selected: [],
    mode: ModeType.LANDING,
    board: {},
    color: "blue-light",
    m: 8,
    n: 8,
    start: (color: string, m: number, n: number, board?: Board) =>
      set((state) => ({
        board: board ?? {},
        color,
        m,
        n,
        mode: ModeType.EDIT,
        selected: [],
        current: ["rect", "blue-light", 0],
      })),
    setMode: (m: ModeType) => set((state) => ({ mode: m })),
    setCurrent: (c: Dot) => set((state) => ({ current: c })),
    press: (i: number, j: number) => {
      set((state) => {
        const key = i * state.m + j;
        console.log("press", i, j, key);
        // const isHold = state.board[key] && state.board[key][0] === "hold";
        // const isBigarc = state.board[key] && state.board[key][0] === "bigarc";
        // const exist = hold || place in state.board || mplace in state.board;
        switch (state.mode) {
          case ModeType.EDIT:
            return {
              board: recordBoard(state.board, (draft: Draft<Board>) => {
                if (state.current[0] === "bigarc") {
                  // if (state.board[key] || state.board[mkey]) return;
                  return editBigArc(
                    draft,
                    state.m,
                    state.n,
                    key,
                    i,
                    j,
                    state.current[1],
                    state.current[2]
                  );
                }
                if (!state.board[key]) {
                  draft[key] = [[key, ...state.current]];
                  // draft[key] = [[key, ...state.current]];
                  return;
                }
                if (state.board[key].length === 1) {
                  if (
                    draft[key][0].slice(1).join("") === state.current.join("")
                  )
                    return clearKey(draft, key);
                  console.log(state.board[key][0], state.current);
                  if (
                    state.board[key][0][1] === "bigarc" &&
                    state.current[0] === "arc" &&
                    state.current[2] === draft[key][0][3]
                  ) {
                    draft[key].push([
                      key,
                      "arc",
                      state.current[1],
                      state.current[2],
                    ]);
                  }
                }
              }),
            };
          case ModeType.DELETE:
            return {
              board: recordBoard(state.board, (draft: Draft<Board>) => {
                clearKey(draft, key);
              }),
            };
          // case ModeType.FILL:
          //   return {
          //     board: recordBoard(state.board, (draft: Draft<Board>) => {
          //       if (draft[key]) {
          //         draft[key][1] = state.current[1];
          //       }
          //     }),
          //   };
          default:
            console.log("default");
            return {};
        }
      });
    },
  }))
);

const clearRoot = (draft: Draft<Board>, root: number, rotate: number) => {
  Object.entries(draft).forEach(([key, dots]) => {
    if (dots.some(([rt, ...rest]) => rt === root)) {
      draft[key] = draft[key].filter(
        ([rt, _, __, ro]) => rt !== root || ro !== rotate
      );
      if (draft[key].length === 0) delete draft[key];
    }
  });
};
const clearKey = (draft: Draft<Board>, k: number) => {
  if (!draft[k]) return;
  const toClear: Array<[number, number]> = draft[k].map(
    ([root, _, __, rotate]) => [root, rotate]
  );
  console.log(toClear);
  toClear.forEach(([root, rotate]) => {
    clearRoot(draft, root, rotate);
  });
  // Object.entries(draft).forEach(([key, dots]) => {
  //   if (dots.some(([root, ...rest]) => roots.includes(root))) {
  //     draft[key] = draft[key].filter(
  //       ([root, ...rest]) => !roots.includes(root)
  //     );
  //     if (draft[key].length === 0) delete draft[key];
  //   }
  // });
};

const editBigArc: mutator = (
  draft: Draft<Board>,
  m: number,
  n: number,
  key: number,
  i: number,
  j: number,
  color: string,
  rotate: number
) => {
  console.log("placeBigArc", i, j, rotate);
  const placable = bigarcRotateMap[rotate].every(([dx, dy, shape]) => {
    const ii: number = i + dx,
      jj: number = j + dy;
    const kk = ii * m + jj;
    const inrange = ii >= 0 && ii < m && jj >= 0 && jj < n;
    if (!inrange) return false;
    if (!draft[kk]) return true;
    if (draft[kk].length > 1) return false;
    const s = draft[kk][0][1];
    const r = draft[kk][0][3];
    console.log("test", s, r, shape, rotate);
    // 'arc|bigarc'
    if (shape === "bigarc" && s === "arc" && r === rotate) return true;
    // 'bigarc|bigarc'
    if (shape === "bigarc" && s === "bigarc" && r === (rotate + 180) % 360)
      return true;
    // 'bigarc|curve'
    if (shape === "bigarc" && s === "curve" && r === rotate) return true;
    if (shape === "curve" && s === "bigarc" && r === rotate) return true;
    // 'curve|curve'
    if (shape === "curve" && s === "curve" && r === (rotate + 180) % 360)
      return true;
    return false;
  });
  if (!placable) {
    console.log("not placable");
    return;
  } else {
    console.log("placing", key, i, j, color, rotate);
    // draft[key] = (draft[key] ?? []).concat([[key, "bigarc", color, rotate]]);
    bigarcRotateMap[rotate].forEach(([dx, dy, shape]) => {
      const ii: number = i + dx,
        jj: number = j + dy;
      const kk = ii * m + jj;
      draft[kk] = (draft[kk] ?? []).concat([[key, shape, color, rotate]]);
    });
  }
};

const deleteBigArc: mutator = (
  draft: Draft<Board>,
  root: number,
  i: number,
  j: number,
  rotate: string
) => {
  console.log("removeBigArc", i, j, rotate);
};
const bigarcRotateMap: { [key: string]: Array<[number, number, string]> } = {
  0: [
    [0, 0, "bigarc"],
    [0, 1, "hold"],
    [1, 0, "hold"],
    [1, 1, "curve"],
  ],
  90: [
    [0, 0, "bigarc"],
    [0, -1, "hold"],
    [1, -1, "curve"],
    [1, 0, "hold"],
  ],
  180: [
    [0, 0, "bigarc"],
    [0, -1, "hold"],
    [-1, 0, "hold"],
    [-1, -1, "curve"],
  ],
  270: [
    [-1, 0, "hold"],
    [0, 1, "curve"],
    [-1, 1, "hold"],
  ],
};
export default useStore;
