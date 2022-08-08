import create, { SetState } from "zustand";
import { DOTS } from "./meta";
import { devtools, persist } from "zustand/middleware";
import immerProduce, {
  produceWithPatches,
  Draft,
  enablePatches,
  Patch,
  applyPatches,
} from "immer";

const MAX_UNDO = 100,
  DEFAULT_SHAPES = ["rect", "circle", "arc", "bigarc", "tooth"],
  DEFAULT_COLORS = [
    "blue",
    "blue-azur",
    "green",
    "yellow",
    "lilac-lavender",
    "orange-coral",
    "white",
    "black",
  ],
  DEFAULT_BOARD_COLROS = [
    "blue",
    "black",
    "blue-bright",
    "yellow-cool",
    "purple-light",
    "white",
  ];

enablePatches();
export type Dot = [string, number, string];
export type DotOnBoard = [number, number, string, number, string];
export type BoardData = Array<Dot>[][];
export type Board = {
  name: string;
  color: string;
  data: BoardData;
};
export type Recorded = { board: Board; selected: string[] };
export type Placing = Array<DotOnBoard>;
export type Gallery = Board[];
export type Pattern = { width: number; height: number; placing: Placing };
export enum EditorMode {
  PLACE = "place",
  DELETE = "delete",
  FILL = "fill",
  SELECT = "select",
}
export enum AppMode {
  EDITOR = "editor",
  GALLERY = "gallery",
  NEW = "new",
  SETTINGS = "settings",
  HELP = "help",
}

interface Store {
  editorMode: EditorMode;
  current: Dot;
  selected: string[];
  copy: boolean;
  selectedPattern: number;
  curRedo: number;
  redoStack: Patch[][];
  undoStack: Patch[][];
  board: Board;
  // menu
  gallery: Gallery;
  patterns: Pattern[];
  appMode: AppMode;
  shapes: string[];
  colors: string[];
  boardColors: string[];
  //method
  setState: SetState<Store>;
  rotateCurrent: () => void;
  undo: (u: boolean) => void;
  press: (i: number, j: number) => void;
  drop: (di: number, dj: number) => void;
  dropPattern: (i: number, j: number) => void;
  savePattern: () => void;
  //gallery metthod
  switchBoard: (i: number, board?: Board) => void;
  duplicateBoard: (i: number) => void;
  changeBoardName: (i: number, name: string) => void;
  deleteBoard: (i: number) => void;
}

const useStore = create<Store>()(
  persist(
    (set) => ({
      // persist state
      board: { data: [], name: "", color: "" },
      gallery: [],
      patterns: [],
      shapes: DEFAULT_SHAPES,
      colors: DEFAULT_COLORS,
      boardColors: DEFAULT_BOARD_COLROS,
      // editor state
      editorMode: EditorMode.PLACE,
      current: ["rect", 0, "blue"],
      copy: true,
      selected: [],
      selectedPattern: 0,
      curRedo: 0,
      redoStack: [],
      undoStack: [],
      //menu
      appMode: AppMode.EDITOR,
      // methods
      setState: set,
      rotateCurrent: () => {
        set((state) => {
          if (state.editorMode !== EditorMode.PLACE) return {};
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
      press: (i: number, j: number) => {
        set((state) => {
          const result =
            state.editorMode === EditorMode.SELECT
              ? record(state, (draft) => {
                  if (draft.board.data[i][j].length !== 0) {
                    const _selected = placingFromKey(
                      i,
                      j,
                      draft.board.data
                    ).map(([i, j, s, r, c]) => [i, j, s, r, c].join("."));
                    if (
                      _selected.every((str) => draft.selected.includes(str))
                    ) {
                      draft.selected = draft.selected.filter(
                        (str) => !_selected.includes(str)
                      );
                    } else {
                      draft.selected = [
                        ...new Set([..._selected, ...draft.selected]),
                      ];
                    }
                  }
                })
              : state.editorMode === EditorMode.PLACE
              ? record(state, (draft: Draft<Recorded>) => {
                  if (state.current[0] === "bigarc") {
                    const placing = bigarcPlacing(
                      state.current[1],
                      state.current[2]
                    );
                    if (placable(placing, draft.board.data, i, j)) {
                      place(placing, draft.board.data, i, j);
                    } else {
                    }
                  } else if (draft.board.data[i][j].length === 0) {
                    draft.board.data[i][j] = [state.current];
                  } else if (draft.board.data[i][j]!.length === 1) {
                    // DELETE
                    if (equal(draft.board.data[i][j][0], state.current) === 2) {
                      const idx = draft.selected.indexOf(
                        draft.board.data[i][j].join(".")
                      );
                      if (idx !== -1) {
                        draft.selected.splice(idx, 1);
                      }
                      // deselected.push(draft.board.data[i][j][0].join("."));
                      draft.board.data[i][j] = [];
                    } else if (
                      draft.board.data[i][j][0][0] === "bigarc" &&
                      state.current[0] === "arc" &&
                      state.current[1] === draft.board.data[i][j][0][1]
                    ) {
                      draft.board.data[i][j].push(state.current);
                    }
                  }
                })
              : state.editorMode === EditorMode.DELETE
              ? record(state, (draft: Draft<Recorded>) => {
                  if (draft.board.data[i][j].length === 0) return;
                  const placing = placingFromKey(i, j, draft.board.data);
                  placing.forEach((p) => {
                    const idx = draft.selected.indexOf(p.join("."));
                    if (idx !== -1) {
                      draft.selected.splice(idx, 1);
                    }
                  });
                  remove(placing, draft.board.data);
                })
              : record(state, (draft: Draft<Recorded>) => {
                  if (draft.board.data[i][j].length === 0) return;
                  let placing = placingFromKey(i, j, draft.board.data);
                  if (
                    placing.every((p) => state.selected.includes(p.join(".")))
                  ) {
                    placing = state.selected.map((key) => {
                      const [i, j, s, r, c] = key.split(".");
                      return [+i, +j, s, +r, c];
                    });
                  }
                  placing.forEach((p) => {
                    const idx = draft.selected.indexOf(p.join("."));
                    if (idx !== -1) {
                      draft.selected.splice(
                        idx,
                        1,
                        [...p.slice(0, 4), state.current[2]].join(".")
                      );
                    }
                  });
                  paint(placing, draft.board.data, state.current[2]);
                });

          return result ? result : {};
        });
      },
      drop: (di, dj) => {
        set((state) => {
          if (di === 0 && dj === 0) return {};
          const placing: Placing = state.selected.map((p) => {
            const [i, j, s, r, c] = p.split(".");
            return [+i, +j, s, +r, c];
          });
          if (state.copy) {
            const result = record(state, (draft) => {
              if (placable(placing, draft.board.data, di, dj)) {
                // console.log("placable");
                place(placing, draft.board.data, di, dj);
                draft.selected = draft.selected.map((p) => {
                  const [i, j, s, r, c] = p.split(".");
                  return [+i + di, +j + dj, s, +r, c].join(".");
                });
              }
            });
            return result ? result : {};
          } else {
            const tempBoard = immerProduce(
              state.board.data,
              (draft: Draft<BoardData>) => remove(placing, draft)
            );
            if (placable(placing, tempBoard, di, dj)) {
              const result = record(state, (draft: Draft<Recorded>) => {
                remove(placing, draft.board.data);
                place(placing, draft.board.data, di, dj);
                draft.selected = draft.selected.map((p) => {
                  const [i, j, s, r, c] = p.split(".");
                  return [+i + di, +j + dj, s, +r, c].join(".");
                });
              });
              return result ? result : {};
            }
            return {};
          }
        });
      },
      dropPattern: (i, j) => {
        set((state) => {
          const result = record(state, (draft) => {
            const placing = state.patterns[state.selectedPattern].placing;
            if (placable(placing, draft.board.data, i, j)) {
              place(placing, draft.board.data, i, j);
            }
          });
          return result ? result : {};
        });
      },
      savePattern: () => {
        set((state) => {
          let mini = Number.MAX_SAFE_INTEGER,
            maxi = -1,
            minj = Number.MAX_SAFE_INTEGER,
            maxj = -1;
          const originPlacing: Placing = state.selected.map((str) => {
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
          const pattern = {
            placing,
            height: maxi - mini + 1,
            width: maxj - minj + 1,
          };
          return { selectedPattern: 0, patterns: [pattern, ...state.patterns] };
        });
      },
      undo: (u: boolean) => {
        set((state) => {
          if (u) {
            if (state.curRedo === 0) return {};
            const { board, selected } = applyPatches(
              { board: state.board, selected: state.selected },
              state.undoStack[state.curRedo - 1]
            );
            return { curRedo: state.curRedo - 1, board, selected };
          } else {
            if (state.curRedo === state.redoStack.length) return {};
            const { board, selected } = applyPatches(
              { board: state.board, selected: state.selected },
              state.redoStack[state.curRedo]
            );
            return { curRedo: state.curRedo + 1, board, selected };
          }
        });
      },
      switchBoard: (i, board) => {
        set((state) => {
          if (i === 0) return { appMode: AppMode.EDITOR };
          const newEditor = {
            editorMode: EditorMode.PLACE,
            current: ["rect", 0, "blue"] as [string, number, string],
            selected: [],
            // selectedPlacing: { width: 0, height: 0, placing: [] },
            curRedo: 0,
            undoStack: [],
            redoStack: [],
          };
          if (i === -1) {
            return {
              board: board!,
              gallery: state.board.name
                ? [state.board, ...state.gallery]
                : state.gallery,
              ...newEditor,
              appMode: AppMode.EDITOR,
            };
          } else {
            const board = state.gallery[i - 1];
            const gallery = state.gallery.filter((_, j) => j !== i - 1);
            if (state.board.name) gallery.unshift(state.board);
            return {
              board,
              gallery,
              appMode: AppMode.EDITOR,
            };
          }
        });
      },
      duplicateBoard: (i) => {
        set((state) => {
          let name =
            i === 0
              ? state.board.name + " copy"
              : state.gallery[i - 1].name + " copy";
          while (
            name === "" ||
            state.board.name === name ||
            name.length > 18 ||
            state.gallery.some((b) => b.name === name)
          ) {
            name = (Math.random() + 1).toString(36).substring(7);
          }
          return i === 0
            ? {
                gallery: [{ ...state.board, name }, ...state.gallery],
              }
            : {
                gallery: [
                  ...state.gallery.slice(0, i),
                  {
                    ...state.gallery[i - 1],
                    name,
                  },
                  ...state.gallery.slice(i),
                ],
              };
        });
      },
      changeBoardName: (i, name) => {
        set((state) =>
          i === 0
            ? { board: { ...state.board, name } }
            : {
                gallery: state.gallery.map((_, j) =>
                  j === i - 1 ? { ..._, name } : _
                ),
              }
        );
      },
      deleteBoard: (i) => {
        set((state) => {
          return i === 0
            ? { board: { name: "", color: "", data: [] } }
            : { gallery: state.gallery.filter((_, j) => j !== i - 1) };
        });
      },
    }),
    {
      name: "legodots-store",
      version: 1,
      partialize: (state) => ({
        gallery: state.gallery,
        shapes: state.shapes,
        colors: state.colors,
        boardColors: state.boardColors,
        patterns: state.patterns,
        board: state.board,
      }),
      migrate: (persistedState, version) => {
        return {
          gallery: [],
          shapes: DEFAULT_SHAPES,
          colors: DEFAULT_COLORS,
          boardColors: DEFAULT_BOARD_COLORS,
          patterns: [],
          board: { name: "", color: "", data: [] },
        };
      },
    }
  )
);

const record = (state: Store, recipe: (draft: Draft<Recorded>) => void) => {
  const [{ board, selected }, patches, inversePatches] = produceWithPatches(
    { board: state.board, selected: state.selected },
    recipe
  );
  if (patches.length === 0) return null;
  const redoStack = [...state.redoStack.slice(0, state.curRedo), patches];
  const undoStack = [
    ...state.undoStack.slice(0, state.curRedo),
    inversePatches,
  ];
  let curRedo = state.curRedo + 1;
  if (curRedo > MAX_UNDO) {
    undoStack.shift();
    redoStack.shift();
    curRedo--;
  }
  return { board, selected, redoStack, undoStack, curRedo };
};

const placingFromKey = (
  i: number,
  j: number,
  board: Draft<BoardData> | BoardData
) => {
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

const placable = (
  placing: Placing,
  board: BoardData | Draft<BoardData>,
  oi = 0,
  oj = 0
) => {
  const m = board.length,
    n = board[0].length;
  return placing.every(([di, dj, s, r]) => {
    const i = oi + di,
      j = oj + dj;
    // console.log(di, dj, oi, oj, i, j);
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

const place = (placing: Placing, draft: Draft<BoardData>, oi = 0, oj = 0) => {
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

const remove = (removing: Placing, draft: Draft<BoardData>, oi = 0, oj = 0) => {
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
  draft: Draft<BoardData>,
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
