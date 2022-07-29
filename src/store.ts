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
type Dot = [string, number, string];
// export type DotOnBoard = [number, string, string, number];
type Board = string[][];
type Placing = Array<[number, number, string, number, string]>;
export enum ModeType {
  LANDING = "landing",
  EDIT = "edit",
  DELETE = "delete",
  FILL = "fill",
  SELECT = "select",
  DROP = "drop",
}
type UsedCount = [string, number][];
type Delta = { [key: string]: number };
interface Store {
  current: Dot;
  selected: Set<string>;
  mode: ModeType;
  color: string;
  m: number;
  n: number;
  board: Board;
  used: UsedCount;
  setState: SetState<Store>;
  press: (i: number, j: number) => void;
}

const redoStack: Patch[][] = [];
const undoStack: Patch[][] = [];

type mutator = (draft: Draft<Board>, ...args: any) => void;

const useStore = create<Store>()(
  devtools((set) => ({
    // state
    current: ["rect", 0, "blue-light"],
    selected: new Set(),
    mode: ModeType.LANDING,
    color: "blue-light",
    m: 0,
    n: 0,
    board: [],
    used: [],
    // methods
    setState: set,
    press: (i: number, j: number) => {
      set((state) => {
        const key = i * state.m + j;
        const name = state.current[0] + "." + state.current[2];
        console.log("press", i, j, key);

        // SELECT
        if (state.mode === ModeType.SELECT) {
          if (state.board[i][j] === "") return {};
          const _selected = new Set<string>(
            placingFromKey(i, j, state.board).map(([di, dj, s, r, c]) =>
              [i + di, j + dj, s, r, c].join(".")
            )
          );
          console.log(state.selected, _selected);
          if (
            [..._selected].every((str) => {
              console.log(str, state.selected.has(str));
              return state.selected.has(str);
            })
          ) {
            console.log("deselect", i, j);
            return {
              selected: new Set(
                [...state.selected].filter((str) => !_selected.has(str))
              ),
            };
          } else {
            console.log("select", i, j);
            return {
              selected: new Set([..._selected, ...state.selected]),
            };
          }
        }
        // mutate board EDIT DELETE FILL DROP
        let delta: Delta = {};
        const deselected = new Set<string>();
        const [board, patches, inversePatches] =
          state.mode === ModeType.EDIT
            ? produceWithPatches(state.board, (draft: Draft<Board>) => {
                if (state.current[0] === "bigarc") {
                  const placing = bigarcPlacing(
                    state.current[1],
                    state.current[2]
                  );
                  if (placable(i, j, placing, draft)) {
                    console.log("placable");
                    place(i, j, placing, draft);
                    delta[name] = (delta[name] ?? 0) + 1;
                  } else {
                    console.log("not placable");
                  }
                } else if (draft[i][j] === "") {
                  draft[i][j] = state.current.join(".");
                  delta[name] = (delta[name] ?? 0) + 1;
                } else if (!draft[i][i].includes("|")) {
                  // delete
                  if (draft[i][j] === state.current.join(".")) {
                    deselected.add(key + "|" + 0);
                    delta[name] = (delta[name] ?? 0) - 1;
                    draft[i][j] = "";
                  }
                  if (
                    draft[i][j].split(".")[0] === "bigarc" &&
                    state.current[0] === "arc" &&
                    state.current[1] === +draft[i][j].split(".")[1]
                  ) {
                    draft[i][j] = draft[i][j] + "|" + state.current.join(".");
                    delta[name] = (delta[name] ?? 0) + 1;
                  }
                }
              })
            : state.mode === ModeType.DELETE
            ? produceWithPatches(state.board, (draft: Draft<Board>) => {
                if (draft[i][j] === "") return;
                delta = remove(i, j, placingFromKey(i, j, draft), draft);
              })
            : state.mode === ModeType.FILL
            ? produceWithPatches(state.board, (draft: Draft<Board>) => {
                if (!draft[i][j]) return;
                paint(
                  i,
                  j,
                  placingFromKey(i, j, draft),
                  state.current[2],
                  draft
                );
              })
            : // DROP
              produceWithPatches(state.board, (draft: Draft<Board>) => {
                console.log("DROP not implemented yet");
              });
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
        const selected = new Set(
          [...state.selected].filter((x) => !deselected.has(x))
        );
        console.log("selected", selected);
        console.log("patch", patches);
        return { board, used, selected };
      });
    },
  }))
);

const placingFromKey = (i: number, j: number, board: Draft<Board> | Board) => {
  const placing: Placing = [];
  const todo = board[i][j].includes("|")
    ? board[i][j].split("|")
    : [board[i][j]];
  todo.forEach((d) => {
    const [s, r, c] = d.split(".");
    if (s === "bigarc") {
      placing.push(...bigarcPlacing(+r, c));
    } else if (s.startsWith("tip") || s.startsWith("curve")) {
      const [_, _i, _j] = s.split("/");
      placing.push(...bigarcPlacing(+r, c, -_i, -_j));
    } else {
      placing.push([0, 0, s, +r, c]);
    }
  });
  return placing;
};
const placable = (
  pi: number,
  pj: number,
  placing: Placing,
  board: Board | Draft<Board>
) => {
  const m = board.length,
    n = board[0].length;
  return placing.every(([di, dj, s, r]) => {
    const i = pi + di,
      j = pj + dj;
    if (i < 0 || i >= m || j < 0 || j >= n) return false;
    if (board[i][j].includes("|")) return false;
    if (board[i][j] === "") return true;
    const bdot = board[i][j].split(".");
    const bs = bdot[0],
      br = +bdot[1];
    if (s === "bigarc" && bs === "arc" && r === br) return true;
    if (s === "arc" && bs === "bigarc" && r === br) return true;
    if (s === "bigarc" && bs === "bigarc" && r == (br + 180) % 360) return true;
    if (s === "bigarc" && bs.startsWith("curve") && r == br) return true;
    if (s.startsWith("curve") && bs === "bigarc" && r == br) return true;
    if (
      s.startsWith("curve") &&
      bs.startsWith("curve") &&
      r == (br + 180) % 360
    )
      return true;
    return false;
  });
};

const place = (
  pi: number,
  pj: number,
  placing: Placing,
  draft: Draft<Board>
) => {
  const delta: Delta = {};
  placing.forEach(([di, dj, s, r, c]) => {
    const i = pi + di,
      j = pj + dj;
    if (SHAPES.includes(s)) {
      const name = s + "." + c;
      delta[name] = (delta[name] ?? 0) + 1;
    }
    const str = [s, r, c].join(".");
    if (draft[i][j] === "") {
      draft[i][j] = str;
    } else {
      draft[i][j] = draft[i][j] + "|" + str;
    }
  });
  return delta;
};

const remove = (
  pi: number,
  pj: number,
  removing: Placing,
  draft: Draft<Board>
) => {
  const delta: Delta = {};
  removing.forEach(([di, dj, s, r, c]) => {
    console.log(di, dj);
    const i = pi + di,
      j = pj + dj;
    if (draft[i][j].includes("|")) {
      const [bd1, bd2] = draft[i][j].split("|");
      const d = [s, r, c].join(".");
      draft[i][j] = bd1 === d ? bd2 : bd1;
      if (bd1 === d) {
        const [s1, r1, c1] = bd1.split(".");
        const name = s1 + "." + c1;
        delta[name] = (delta[name] ?? 0) - 1;
      } else {
        const [s2, r2, c2] = bd2.split(".");
        const name = s2 + "." + c2;
        delta[name] = (delta[name] ?? 0) - 1;
      }
      console.log("remove", i, j, draft[i][j]);
    } else {
      draft[i][j] = "";
      const name = s + "." + c;
      delta[name] = (delta[name] ?? 0) - 1;
    }
  });
  return delta;
};

const paint = (
  pi: number,
  pj: number,
  placing: Placing,
  color: string,
  draft: Draft<Board>
) => {
  placing.forEach(([di, dj, s, r, c]) => {
    const i = pi + di,
      j = pj + dj;
    if (draft[i][j].includes("|")) {
      const [bd1, bd2] = draft[i][j].split("|");
      const d = [s, r, c].join(".");
      if (bd1 === d) {
        const [s1, r1, c1] = bd1.split(".");
        draft[i][j] = [s1, r1, color].join(".") + "|" + bd2;
      } else {
        const [s2, r2, c2] = bd2.split(".");
        draft[i][j] = bd1 + "|" + [s2, r2, color].join(".");
      }
    } else {
      draft[i][j] = [s, r, color].join(".");
    }
  });
};

const bigarcPlacing = (
  r: number,
  c: string,
  i: number = 0,
  j: number = 0
): Placing => {
  return r === 0
    ? [
        [i + 0, j + 0, "bigarc", 0, c],
        [i + 0, j + 1, "tip/0/1", 0, c],
        [i + 1, j + 0, "tip/1/0", 0, c],
        [i + 1, j + 1, "curve/1/1", 0, c],
      ]
    : r === 90
    ? [
        [i + 0, j + 0, "bigarc", 90, c],
        [i + 0, j - 1, "tip/0/-1", 90, c],
        [i + 1, j - 1, "curve/1/-1", 90, c],
        [i + 1, j + 0, "tip/1/0", 90, c],
      ]
    : r === 180
    ? [
        [i + 0, j + 0, "bigarc", 180, c],
        [i + 0, j - 1, "tip/0/-1", 180, c],
        [i - 1, j + 0, "tip/-1/0", 180, c],
        [i - 1, j - 1, "curve/-1/-1", 180, c],
      ]
    : [
        [i + 0, j + 0, "bigarc", 270, c],
        [i - 1, j + 0, "tip/-1/0", 270, c],
        [i + 0, j + 1, "curve/0/1", 270, c],
        [i - 1, j + 1, "tip/-1/1", 270, c],
      ];
};
export default useStore;
