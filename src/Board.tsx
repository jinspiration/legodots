import { useGesture } from "@use-gesture/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MdExpandLess,
  MdExpandMore,
  MdMyLocation,
  MdOutlineGrid4X4,
  MdOutlineMenu,
  MdOutlineRedo,
  MdOutlineUndo,
} from "react-icons/md";
import { GRID, SHAPES } from "./meta";
import useStore, { AppMode, EditorMode } from "./store";
import Control from "./Control";
import { DotButton } from "./Buttons";
type UsedCount = [string, number][];
let lastDrag = 0;
let lastPan = [0, 0];
const Board: React.FC<{}> = ({}) => {
  const {
    used,
    data,
    color: boardColor,
    name,
  } = useStore(({ board }) => {
    const usedObj: { [key: string]: number } = {};
    (board.data ?? []).forEach((row, i) => {
      row.forEach((dots, j) => {
        dots.forEach(([s, r, c]) => {
          if (SHAPES.includes(s))
            usedObj[s + "." + c] = (usedObj[s + "." + c] ?? 0) + 1;
        });
      });
    });
    const used: UsedCount = Object.entries(usedObj).map(([key, count]) => [
      key,
      count,
    ]);
    used.sort(([, a], [, b]) => b - a);
    return { used, ...board };
  });
  const patterns = useStore((state) => state.patterns);
  const { selectedPattern, pattern } = useStore((state) => {
    const pattern =
      state.selectedPattern === -1
        ? null
        : state.patterns[state.selectedPattern];
    return { pattern, selectedPattern: state.selectedPattern };
  });
  const setState = useStore((state) => state.setState);
  const undo = useStore((state) => state.undo);
  const selected = useStore((state) => state.selected);
  const drop = useStore((state) => state.drop);
  const dropPattern = useStore((state) => state.dropPattern);
  const press = useStore((state) => state.press);
  const { hasRedo, hasUndo } = useStore((state) => {
    return {
      hasRedo:
        state.redoStack.length > 0 && state.curRedo < state.redoStack.length,
      hasUndo: state.undo.length > 0 && state.curRedo > 0,
    };
  });
  const [m, n, isWhite] = useMemo(
    () => [data.length, (data[0] ?? []).length, boardColor === "white"],
    [boardColor]
  );

  const svgRef = useRef<SVGSVGElement>(null);
  const boardRef = useRef<SVGSVGElement>(null);
  const selectedRef = useRef<SVGSVGElement>(null);
  const patternRef = useRef<SVGSVGElement>(null);
  const dropRef = useRef<SVGAElement>(null);
  const gridRef = useRef<SVGAElement>(null);
  const [log, setLog] = useState<string[]>([]);
  const [expand, setExpand] = useState(false);
  function zoom(delta: number): void {
    if (svgRef.current === null) return;
    const box = svgRef.current!.getBoundingClientRect();
    const cx = (box!.left + box!.right) / 2;
    const cy = (box!.top + box!.bottom) / 2;
    const p = new DOMPoint(cx, cy);
    const { x: sx, y: sy } = p.matrixTransform(
      svgRef.current.getScreenCTM()!.inverse()
    );
    const [x, y, width, height] = svgRef.current
      .getAttribute("viewBox")!
      .split(" ")
      .map(Number);
    const viewBox = [
      x - (sx - x) * (delta - 1),
      y - (sy - y) * (delta - 1),
      width * delta,
      height * delta,
    ].join(" ");
    svgRef.current.setAttribute("viewBox", viewBox);
  }
  const reset = useCallback(() => {
    svgRef.current?.setAttribute("viewBox", `0 0 ${n * GRID} ${m * GRID}`);
    zoom(1.2);
    lastPan = [0, 0];
    boardRef.current?.setAttribute("transform", `translate(0,0)`);
    gridRef.current?.setAttribute("visibility", "hidden");
  }, []);
  useEffect(() => {
    reset();
  }, [reset]);
  useGesture(
    {
      onDragStart: ({ pinching, cancel }) => {
        if (pinching) {
          cancel();
        }
      },
      onDrag: ({ first, target, movement: [mx, my], memo, pinching }) => {
        const select = first
          ? (target as any).classList.contains("stroke-2")
          : memo;
        const { x: x0, y: y0 } = new DOMPoint(0, 0).matrixTransform(
          boardRef.current!.getScreenCTM()!.inverse()
        );
        const { x, y } = new DOMPoint(mx, my).matrixTransform(
          boardRef.current!.getScreenCTM()!.inverse()
        );
        const dx = x - x0,
          dy = y - y0;
        if (select) {
          const dj = Math.round(dx / GRID),
            di = Math.round(dy / GRID);
          selectedRef.current!.setAttribute(
            "transform",
            `translate(${dj * GRID} ${di * GRID})`
          );
        } else {
          boardRef.current!.setAttribute(
            "transform",
            `translate(${lastPan[0] + dx} ${lastPan[1] + dy})`
          );
        }
        return select;
      },
      onDragEnd: ({ movement: [mx, my], memo, pinching, touches }) => {
        // setLog((log) => [...log, "dragEnd" + pinching + touches]);
        const { x: zx, y: zy } = new DOMPoint(0, 0).matrixTransform(
          boardRef.current!.getScreenCTM()!.inverse()
        );
        const { x, y } = new DOMPoint(mx, my).matrixTransform(
          boardRef.current!.getScreenCTM()!.inverse()
        );
        const dx = x - zx,
          dy = y - zy;
        if (memo) {
          selectedRef.current!.removeAttribute("transform");

          let dj = Math.round(dx / GRID),
            di = Math.round(dy / GRID);
          // console.log("end", di, dj);

          drop(di, dj);
        } else {
          boardRef.current!.setAttribute(
            "transform",
            `translate(${lastPan[0] + dx} ${lastPan[1] + dy})`
          );
          lastPan = [lastPan[0] + dx, lastPan[1] + dy];
          // console.log("end", lastPan[0], lastPan[1]);
        }
        lastDrag = new Date().getTime();
        // console.log("onDragEnd", memo);
      },
      onWheel: ({ event }) => {
        const delta = event.deltaY > 0 ? 1.05 : 0.95;
        zoom(delta);
      },
      onPinch: ({ delta: [dy] }) => {
        const delta = dy < 0 ? 1.05 : 0.95;
        zoom(delta);
      },
      onPinchEnd: ({ touches }) => {
        // setLog((l) => [...l, "pinchEnd" + touches]);
        lastDrag = new Date().getTime();
      },
      onPointerUp: ({ event, touches }) => {
        // setLog((l) => [...l, "pointerUp" + touches]);
        const now = new Date().getTime();
        if (now - lastDrag < 180) return;
        if (boardRef.current === null) return;
        const p = new DOMPoint(event.clientX, event.clientY);
        const { x: bx, y: by } = p.matrixTransform(
          boardRef.current.getScreenCTM()!.inverse()
        );
        const j = Math.floor(bx / GRID),
          i = Math.floor(by / GRID);
        if (i < 0 || i >= m || j < 0 || j >= n) return;
        press(i, j);
      },
    },
    {
      target: boardRef,
      eventOptions: { passive: false },
      drag: { threshold: 5 },
    }
  );
  useGesture(
    {
      onDrag: ({ xy: [x, y], memo, first }) => {
        const rect: DOMRect = first
          ? boardRef.current!.getBoundingClientRect()
          : memo;
        if (
          x > rect.right ||
          x < rect.left ||
          y > rect.bottom ||
          y < rect.top
        ) {
          dropRef.current!.style.display = "none";
          return rect;
        }
        dropRef.current!.style.display = "inline";
        const p = new DOMPoint(x, y);
        const { x: bx, y: by } = p.matrixTransform(
          boardRef.current!.getScreenCTM()!.inverse()
        );
        const j = Math.floor(bx / GRID),
          i = Math.floor(by / GRID);
        dropRef.current!.setAttribute(
          "transform",
          `translate(${j * GRID} ${i * GRID})`
        );
        // return rect;
      },
      onDragEnd: ({ xy: [x, y] }) => {
        dropRef.current!.style.display = "none";
        const p = new DOMPoint(x, y);
        const { x: bx, y: by } = p.matrixTransform(
          boardRef.current!.getScreenCTM()!.inverse()
        );
        const j = Math.floor(bx / GRID),
          i = Math.floor(by / GRID);
        dropPattern(i, j);
      },
    },
    {
      target: patternRef,

      // eventOptions: { passive: false },
      drag: { threshold: 5 },
    }
  );
  return (
    <>
      <div className="col-span-2 md:col-start-2 md:row-span-2">
        {name ? (
          <div className="relative w-full h-full rounded-md p-2">
            <div className="absolute bottom-2 right-2 z-50 menu-container [&>*]:button-xs-sm bg-gray-200 [&>*>svg]:fill-gray-700">
              <div>
                <MdOutlineGrid4X4
                  onClick={() => {
                    gridRef.current?.getAttribute("visibility") === "visible"
                      ? gridRef.current?.setAttribute("visibility", "hidden")
                      : gridRef.current?.setAttribute("visibility", "visible");
                  }}
                />
              </div>
              <div onClick={reset}>
                <MdMyLocation />
              </div>
              <div onClick={() => setState({ appMode: AppMode.GALLERY })}>
                <MdOutlineMenu />
              </div>
            </div>
            <div className="absolute bg-gray-200 left-2 bottom-2 z-50 menu-container [&>*]:button-xs-sm">
              <div
                onClick={() => {
                  undo(true);
                }}
              >
                <MdOutlineUndo
                  className={hasUndo ? "fill-green-400" : "fill-gray-700"}
                />
              </div>
              <div
                onClick={() => {
                  undo(false);
                }}
              >
                <MdOutlineRedo
                  className={hasRedo ? "fill-green-400" : "fill-gray-700"}
                />
              </div>
            </div>
            <Control />
            <svg
              id="svg"
              ref={svgRef}
              preserveAspectRatio="xMidYMid meet"
              className={"h-full w-full touch-none"}
            >
              <g id="board" className="touch-none" ref={boardRef}>
                <rect
                  x="0"
                  y="0"
                  rx="3"
                  className={"fill-lego-" + boardColor}
                  width={n * GRID}
                  height={m * GRID}
                />
                <rect
                  x="0"
                  y="0"
                  fill="url(#pattern)"
                  width={n * GRID}
                  height={m * GRID}
                />
                <g ref={gridRef}>
                  <rect
                    z="50"
                    x="0"
                    y="0"
                    fill={isWhite ? "url(#grid-black)" : "url(#grid-white)"}
                    width={n * GRID}
                    height={m * GRID}
                  />
                </g>
                {data.map((row, i) => {
                  return (
                    <React.Fragment key={"" + i}>
                      {row.map((dots, j) => {
                        return dots.map(([shape, rotate, color]) => {
                          if (!SHAPES.includes(shape)) return null;
                          const key = [i, j, shape, rotate, color].join(".");
                          return (
                            <use
                              key={key}
                              href={"#" + shape}
                              className={"fill-lego-" + color}
                              transform={
                                `translate(${j * GRID},${i * GRID})` +
                                (rotate === 0
                                  ? ""
                                  : `rotate(${rotate} ${GRID / 2} ${GRID / 2})`)
                              }
                            />
                          );
                        });
                      })}
                    </React.Fragment>
                  );
                })}
                <g className="touch-none" ref={selectedRef}>
                  {selected.map((str) => {
                    const [i, j, s, r, c] = str.split(".");
                    if (!SHAPES.includes(s)) return null;
                    return (
                      <use
                        key={str}
                        href={"#" + s}
                        // mask="url(#mask)"
                        className={"stroke-2 stroke-red-300 fill-lego-" + c}
                        transform={
                          `translate(${+j * GRID},${+i * GRID})` +
                          (r === "0"
                            ? ""
                            : `rotate(${r} ${GRID / 2} ${GRID / 2})`)
                        }
                      />
                    );
                  })}
                </g>
                {pattern && (
                  <g ref={dropRef} className="hidden touch-none">
                    {pattern.placing.map(([i, j, s, r, c]) => {
                      return (
                        <use
                          key={[i, j, s, r, c].join(".")}
                          href={"#" + s}
                          className={"fill-lego-" + c}
                          transform={
                            `translate(${j * GRID},${i * GRID})` +
                            (r === 0
                              ? ""
                              : `rotate(${r} ${GRID / 2} ${GRID / 2})`)
                          }
                        />
                      );
                    })}
                  </g>
                )}
              </g>
            </svg>
          </div>
        ) : (
          <div className="w-full h-full rounded-md grid place-content-center">
            <button
              className="text-lg text-white rounded-md bg-sky-500 px-4 py-2"
              onClick={() =>
                setState((state) =>
                  state.gallery.length === 0
                    ? { appMode: AppMode.NEW }
                    : { appMode: AppMode.GALLERY }
                )
              }
            >
              Open or Create A Board to Start
            </button>
          </div>
        )}
      </div>
      {name ? (
        expand ? (
          <div className="col-span-2 md:row-start-2 md:col-span-1 row-span-1 md:row-span-2 flex md:flex-col-reverse">
            <div className="grow overflow-y-auto scrollbar flex flex-wrap place-content-start">
              {patterns.map(({ width, height, placing }, i) => {
                return (
                  <svg
                    key={i}
                    className={`w-24 h-24 p-1${
                      selectedPattern === i ? " border-2 border-sky-500" : ""
                    }`}
                    viewBox={`0 0 ${width * GRID} ${height * GRID}`}
                    onClick={() =>
                      selectedPattern === i
                        ? setExpand(false)
                        : setState({ selectedPattern: i })
                    }
                  >
                    {placing.map(([i, j, s, r, c]) => {
                      return (
                        <use
                          key={[i, j, s, r, c].join(".")}
                          href={"#" + s}
                          className={"fill-lego-" + c}
                          transform={
                            `translate(${j * GRID},${i * GRID})` +
                            (r === 0
                              ? ""
                              : `rotate(${r} ${GRID / 2} ${GRID / 2})`)
                          }
                        />
                      );
                    })}
                  </svg>
                );
              })}
            </div>
            <div
              className="flex-none flex justify-center items-center"
              onClick={() => setExpand(false)}
            >
              <MdExpandMore className="fill-sky-500 rotate-90 md:rotate-0" />
            </div>
          </div>
        ) : (
          <>
            <div className="md:col-start-1">
              <div className="flex md:flex-col-reverse">
                <div className="w-24 h-24">
                  {pattern && (
                    <svg
                      className="w-full h-full p-1 touch-none"
                      viewBox={`0 0 ${pattern.width * GRID} ${
                        pattern.height * GRID
                      }`}
                      ref={patternRef}
                    >
                      {pattern.placing.map(([i, j, s, r, c]) => {
                        return (
                          <use
                            key={[i, j, s, r, c].join(".")}
                            href={"#" + s}
                            className={"fill-lego-" + c}
                            transform={
                              `translate(${j * GRID},${i * GRID})` +
                              (r === 0
                                ? ""
                                : `rotate(${r} ${GRID / 2} ${GRID / 2})`)
                            }
                          />
                        );
                      })}
                    </svg>
                  )}
                </div>
                <div
                  className="flex justify-center items-center"
                  onClick={() => setExpand(true)}
                >
                  <MdExpandLess className="fill-sky-500 rotate-90 md:rotate-0" />
                </div>
              </div>
            </div>
            <div className="md:row-start-2 overflow-y-auto scrollbar flex flex-wrap place-content-start">
              {/* <div className="overflow-y-auto scrollbar">
                {log.map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
              </div> */}
              {used.map(([name, occ]) => {
                const [shape, color] = name.split(".");

                return (
                  <div
                    key={name}
                    className="relative button-sm"
                    onClick={() => {
                      setState((state) => {
                        return {
                          current: [shape, 0, color],
                          editorMode: EditorMode.PLACE,
                        };
                      });
                    }}
                  >
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-zinc-800">
                      {occ}
                    </span>
                    <DotButton shape={shape} color={color} rotate={0} />
                  </div>
                );
              })}
            </div>
          </>
        )
      ) : (
        <div className="col-span-2 md:row-start-2 md:col-span-1 row-span-2"></div>
      )}
    </>
  );
};

export default React.memo(Board);
