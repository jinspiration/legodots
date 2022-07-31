import create, { SetState } from "zustand";
import { DOTS } from "./meta";
import { devtools, persist } from "zustand/middleware";
import {
  produceWithPatches,
  Draft,
  enablePatches,
  Patch,
  applyPatches,
} from "immer";

enablePatches();
export type Dot = [string, number, string];
type DotOnBoard = Dot[];
type Board = DotOnBoard[][];
export type Placing = Array<[number, number, string, number, string]>;
export enum ModeType {
  LANDING = "landing",
  EDIT = "edit",
  DELETE = "delete",
  FILL = "fill",
  SELECT = "select",
  DROP = "drop",
}
interface Store {
  mode: ModeType;
  current: Dot;
  selected: string[];
  selectedPlacing: { width: number; height: number; placing: Placing };
  boardColor: string;
  board: Board;
  curRedo: number;
  redoStack: Patch[][];
  undoStack: Patch[][];
  setState: SetState<Store>;
  undo: (u: boolean) => void;
  press: (i: number, j: number) => void;
  rotateCurrent: () => void;
  pickupSelected: () => void;
  duplicateSelected: () => void;
}

const useStore = create<Store>()(
  persist(
    (set) => ({
      // state
      mode: ModeType.LANDING,
      current: ["rect", 0, "blue-light"],
      selected: [],
      selectedPlacing: { width: 0, height: 0, placing: [] },
      boardColor: "",
      board: [],
      curRedo: 0,
      redoStack: [],
      undoStack: [],
      // methods
      setState: set,
      press: (i: number, j: number) => {
        set((state) => {
          // SELECT
          if (state.mode === ModeType.SELECT) {
            if (state.board[i][j].length === 0) return {};
            const _selected = placingFromKey(i, j, state.board).map(
              ([i, j, s, r, c]) => [i, j, s, r, c].join(".")
            );
            if (
              _selected.every((str) => {
                return state.selected.includes(str);
              })
            ) {
              return {
                selected: state.selected.filter(
                  (str) => !_selected.includes(str)
                ),
              };
            } else {
              return {
                selected: [...new Set([..._selected, ...state.selected])],
              };
            }
          }
          // mutate board EDIT DELETE FILL DROP
          let deselected: string[] = [],
            multiselected: string[] = [];
          const result =
            state.mode === ModeType.EDIT
              ? recordMutate(state, (draft: Draft<Board>) => {
                  if (state.current[0] === "bigarc") {
                    const placing = bigarcPlacing(
                      state.current[1],
                      state.current[2]
                    );
                    if (placable(placing, draft, i, j)) {
                      place(placing, draft, i, j);
                    } else {
                    }
                  } else if (draft[i][j].length === 0) {
                    draft[i][j] = [state.current];
                  } else if (draft[i][j]!.length === 1) {
                    // DELETE
                    if (equal(draft[i][j][0], state.current) === 2) {
                      deselected.push(draft[i][j][0].join("."));
                      draft[i][j] = [];
                    } else if (
                      draft[i][j][0][0] === "bigarc" &&
                      state.current[0] === "arc" &&
                      state.current[1] === draft[i][j][0][1]
                    ) {
                      draft[i][j].push(state.current);
                    }
                  }
                })
              : state.mode === ModeType.DELETE
              ? recordMutate(state, (draft: Draft<Board>) => {
                  if (draft[i][j].length === 0) return;
                  const placing = placingFromKey(i, j, draft);
                  placing.forEach((p) => {
                    deselected.push(p.join("."));
                  });
                  remove(placing, draft);
                })
              : state.mode === ModeType.FILL
              ? recordMutate(state, (draft: Draft<Board>) => {
                  if (draft[i][j].length === 0) return;
                  let placing = placingFromKey(i, j, draft);
                  if (
                    placing.every((p) => state.selected.includes(p.join(".")))
                  ) {
                    placing = state.selected.map((key) => {
                      const [i, j, s, r, c] = key.split(".");
                      return [+i, +j, s, +r, c];
                    });
                    placing.forEach((p) => {
                      deselected.push(p.join("."));
                      multiselected.push(
                        [...p.slice(0, 4), state.current[2]].join(".")
                      );
                    });
                  }

                  paint(placing, draft, state.current[2]);
                })
              : // DROP
                recordMutate(state, (draft: Draft<Board>) => {
                  if (
                    placable(state.selectedPlacing.placing, state.board, i, j)
                  ) {
                    multiselected = state.selectedPlacing.placing.map(
                      ([di, dj, s, r, c]) => [i + di, j + dj, s, r, c].join(".")
                    );
                    deselected = [...state.selected];
                    place(state.selectedPlacing.placing, draft, i, j);
                  }
                });
          if (!result) return {};
          if (deselected.length !== 0 || multiselected.length !== 0) {
            let selected = state.selected.filter(
              (str) => !deselected.includes(str)
            );
            selected = [...new Set([...selected, ...multiselected])];
            return { ...result, selected };
          }
          return result;
        });
      },
      undo: (u: boolean) => {
        set((state) => {
          if (u) {
            if (state.curRedo === 0) return {};
            const board = applyPatches(
              state.board,
              state.undoStack[state.curRedo - 1]
            );
            // const { used, selected } = onUpdate(board, state.selected);
            return { curRedo: state.curRedo - 1, board };
          } else {
            if (state.curRedo === state.redoStack.length) return {};
            const board = applyPatches(
              state.board,
              state.redoStack[state.curRedo]
            );
            // const { used, selected } = onUpdate(board, state.selected);
            return { curRedo: state.curRedo + 1, board };
          }
        });
      },
      rotateCurrent: () => {
        set((state) => {
          if (state.mode !== ModeType.EDIT) return {};
          const rotate = DOTS[state.current[0]].rotate;
          const ir = rotate.indexOf(state.current[1]);
          return {
            current: [
              state.current[0],
              rotate[(ir + 1) % rotate.length],
              state.current[2],
            ],
          };
        });
      },
      pickupSelected: () => {
        set((state) => {
          if (state.selected.length === 0) return {};
          const { originPlacing, ...selectedPlacing } = placingFromSelected(
            state.selected
          );
          const result = recordMutate(state, (draft: Draft<Board>) => {
            remove(
              state.selected.map((key) => {
                const [i, j, s, r, c] = key.split(".");
                return [+i, +j, s, +r, c];
              }),
              draft
            );
          });
          return {
            ...result,
            selectedPlacing,
            selected: [],
            mode: ModeType.DROP,
          };
        });
      },
      duplicateSelected: () => {
        set((state) => {
          if (state.selected.length === 0) return {};
          const { originPlacing, ...selectedPlacing } = placingFromSelected(
            state.selected
          );
          return { selectedPlacing, selected: [], mode: ModeType.DROP };
        });
      },
    }),
    {
      name: "legodots-store",
      partialize: (state) => ({
        mode: state.mode,
        current: state.current,
        selected: state.selected,
        selectedPlacing: state.selectedPlacing,
        boardColor: state.boardColor,
        board: state.board,
      }),
    }
  )
);

const recordMutate = (state: Store, recipe: (draft: Draft<Board>) => void) => {
  const [board, patches, inversePatches] = produceWithPatches(
    state.board,
    recipe
  );
  if (patches.length === 0) return null;
  const redoStack = [...state.redoStack.slice(0, state.curRedo), patches];
  const undoStack = [
    ...state.undoStack.slice(0, state.curRedo),
    inversePatches,
  ];
  const curRedo = state.curRedo + 1;
  return { board, redoStack, undoStack, curRedo };
};

const placingFromKey = (i: number, j: number, board: Draft<Board> | Board) => {
  const placing: Placing = [];
  board[i][j].forEach(([s, r, c]) => {
    if (s === "bigarc") {
      bigarcPlacing(r, c).forEach(([di, dj, s, r, c]) => {
        placing.push([i + di, j + dj, s, r, c]);
      });
    } else if (s.startsWith("tip") || s.startsWith("curve")) {
      const [_, _i, _j] = s.split("/");
      bigarcPlacing(r, c).forEach(([di, dj, s, r, c]) => {
        placing.push([i - +_i + di, j - +_j + dj, s, r, c]);
      });
    } else {
      placing.push([i, j, s, r, c]);
    }
  });
  return placing;
};

const placingFromSelected = (selected: string[]) => {
  let mini = Number.MAX_SAFE_INTEGER,
    maxi = -1,
    minj = Number.MAX_SAFE_INTEGER,
    maxj = -1;
  const originPlacing: Placing = selected.map((str) => {
    const [i, j, s, r, c] = str.split(".");
    mini = Math.min(mini, +i);
    minj = Math.min(minj, +j);
    maxi = Math.max(maxi, +i);
    maxj = Math.max(maxj, +j);
    return [+i, +j, s, +r, c];
  });
  const placing: Placing = originPlacing.map(([i, j, s, r, c]) => [
    i - mini,
    j - minj,
    s,
    r,
    c,
  ]);
  return {
    originPlacing,
    placing,
    height: maxi - mini + 1,
    width: maxj - minj + 1,
  };
};

const placable = (
  placing: Placing,
  board: Board | Draft<Board>,
  oi = 0,
  oj = 0
) => {
  const m = board.length,
    n = board[0].length;
  return placing.every(([di, dj, s, r]) => {
    const i = oi + di,
      j = oj + dj;
    if (i < 0 || i >= m || j < 0 || j >= n) return false;
    if (board[i][j].length === 2) return false;
    if (board[i][j].length === 0) return true;
    const [bs, br] = board[i][j][0];
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

const place = (placing: Placing, draft: Draft<Board>, oi = 0, oj = 0) => {
  placing.forEach(([di, dj, s, r, c]) => {
    const i = oi + di,
      j = oj + dj;
    if (draft[i][j].length === 0) {
      draft[i][j] = [[s, r, c]];
    } else {
      draft[i][j].push([s, r, c]);
    }
  });
};

const remove = (removing: Placing, draft: Draft<Board>, oi = 0, oj = 0) => {
  removing.forEach(([di, dj, s, r, c]) => {
    const i = oi + di,
      j = oj + dj;
    if (draft[i][j].length === 2) {
      if (equal(draft[i][j][0], [s, r, c]) === 2) {
        draft[i][j] = [draft[i][j][1]];
      } else {
        draft[i][j] = [draft[i][j][0]];
      }
    } else {
      draft[i][j] = [];
    }
  });
};

const paint = (
  placing: Placing,
  draft: Draft<Board>,
  color: string,
  oi = 0,
  oj = 0
) => {
  placing.forEach(([di, dj, s, r, c]) => {
    const i = oi + di,
      j = oj + dj;
    if (draft[i][j].length === 2 && equal(draft[i][j][1], [s, r, c]) === 2) {
      draft[i][j][1][2] = color;
    } else {
      draft[i][j][0][2] = color;
    }
  });
};

const equal = (a: Dot, b: Dot) => {
  if (a[0] !== b[0]) return 0;
  if (a[1] !== b[1]) return 0;
  if (a[2] !== b[2]) return 1;
  return 2;
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
