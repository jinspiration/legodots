import create, { SetState } from "zustand";
// import { SetState } from "zustand";
import { SHAPES } from "./meta";
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
  LANDING = "landing",
  EDIT = "edit",
  DELETE = "delete",
  FILL = "fill",
  SELECT = "select",
  DROP = "drop",
}
type UsedCount = [string, number][];

interface Store {
  current: Dot;
  selected: number[];
  mode: ModeType;
  color: string;
  m: number;
  n: number;
  board: Board;
  used: UsedCount;
  // start: (color: string, m: number, n: number, board?: Board) => void;
  // setState: (
  //   partial: Store | Partial<Store> | ((state: Store) => Store | Partial<Store>)
  // ) => void;
  setState: SetState<Store>;
  // setMode: (m: ModeType) => void;
  // setCurrent: (c: Dot) => void;
  press: (i: number, j: number) => void;
}

const redoStack: Patch[][] = [];
const undoStack: Patch[][] = [];

type mutator = (draft: Draft<Board>, ...args: any) => void;

const recordBoard = (
  state: Store,
  recipe: (draft: Draft<Board>) => void
): Board => {
  const [nextBoard, patches, inversePatches] = produceWithPatches(
    state.board,
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
    color: "blue-light",
    m: 0,
    n: 0,
    board: {},
    used: [],
    setState: set,
    press: (i: number, j: number) => {
      set((state) => {
        const key = i * state.m + j;
        const name = state.current[0] + "|" + state.current[1];
        console.log("press", i, j, key);
        const delta: { [key: string]: number } = {};
        const board =
          state.mode === ModeType.EDIT
            ? recordBoard(state, (draft: Draft<Board>) => {
                if (state.current[0] === "bigarc") {
                  // if (state.board[key] || state.board[mkey]) return;
                  const success = editBigArc(
                    draft,
                    state.m,
                    state.n,
                    key,
                    i,
                    j,
                    state.current[1],
                    state.current[2]
                  );
                  if (success) {
                    delta[name] = (delta[name] ?? 0) + 1;
                  }
                  return;
                }
                if (!state.board[key]) {
                  draft[key] = [[key, ...state.current]];
                  delta[name] = (delta[name] ?? 0) + 1;
                  return;
                }
                if (state.board[key].length === 1) {
                  if (
                    state.board[key][0].slice(1).join("") ===
                    state.current.join("")
                  ) {
                    delta[name] = (delta[name] ?? 0) - 1;
                    delete draft[key];
                  }
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
                    delta[name] = (delta[name] ?? 0) + 1;
                  }
                }
              })
            : state.mode === ModeType.DELETE
            ? recordBoard(state, (draft: Draft<Board>) => {
                if (!draft[key]) return;
                mutateKey(state.board, key, (k, idx) => {
                  idx.forEach((i) => {
                    if (SHAPES.includes(state.board[k][i][1])) {
                      const _name =
                        state.board[k][i][1] + "|" + state.board[k][i][2];
                      delta[_name] = (delta[_name] ?? 0) - 1;
                    }
                  });
                  draft[k] = state.board[k].filter(
                    (_, i) => idx.indexOf(i) < 0
                  );
                  if (draft[k].length === 0) delete draft[k];
                });
              })
            : state.mode === ModeType.FILL
            ? recordBoard(state, (draft: Draft<Board>) => {
                if (!draft[key]) return;
                mutateKey(state.board, key, (k, idx) => {
                  idx.forEach((i) => {
                    if (SHAPES.includes(state.board[k][i][1])) {
                      const _name =
                        state.board[k][i][1] + "|" + state.board[k][i][2];
                      const _newName =
                        state.board[k][i][1] + "|" + state.current[1];
                      delta[_name] = (delta[_name] ?? 0) - 1;
                      delta[_newName] = (delta[_newName] ?? 0) + 1;
                      draft[k][i][2] = state.current[1];
                    }
                  });
                });
              })
            : state.mode === ModeType.SELECT
            ? recordBoard(state, (draft: Draft<Board>) => {
                console.log("SELECT not implemented yet");
              })
            : state.mode === ModeType.DROP
            ? recordBoard(state, (draft: Draft<Board>) => {
                console.log("DROP not implemented yet");
              })
            : {};
        let used: UsedCount = state.used.map(([name, count]) => {
          if (delta[name]) {
            const deltaCnt = delta[name];
            delete delta[name];
            return [name, count + deltaCnt];
          }
          return [name, count];
        });
        Object.entries(delta).forEach(([name, count]) => {
          used.push([name, count]);
        });
        used = used.filter(([name, count]) => count > 0);
        used.sort((a, b) => b[1] - a[1]);
        console.log("delta", delta);
        console.log("used", used);
        return { board, used };
      });
    },
  }))
);

const mutateKey = (
  board: Board,
  key: number,
  mutate: (key: string, idx: number[]) => void
) => {
  const toMutate: { [key: string]: number[] } = {};
  board[key].forEach(([root, s, color, rotate]) => {
    const shape = s === "curve" || s === "hold" ? "bigarc" : s;
    Object.entries(board).forEach(([key, dots]) => {
      dots.forEach(([_root, _shape, _, _rotate], i) => {
        const match =
          _shape === shape ||
          (shape === "bigarc" && (_shape === "hold" || _shape === "curve"));
        if (match && _root === root && _rotate === rotate) {
          toMutate[key] ? toMutate[key].push(i) : (toMutate[key] = [i]);
        }
      });
    });
  });
  Object.entries(toMutate).forEach(([key, idx]) => {
    console.log("mutate called", key, idx);
    mutate(key, idx);
  });
};
const editBigArc = (
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
    return false;
  } else {
    console.log("placing", key, i, j, color, rotate);
    bigarcRotateMap[rotate].forEach(([dx, dy, shape]) => {
      const ii: number = i + dx,
        jj: number = j + dy;
      const kk = ii * m + jj;
      draft[kk] = (draft[kk] ?? []).concat([[key, shape, color, rotate]]);
    });
    return true;
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
