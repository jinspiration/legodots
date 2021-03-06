import { useGesture } from "@use-gesture/react";
import React, { useCallback, useEffect, useRef } from "react";
import {
  MdMyLocation,
  MdOutlineMenu,
  MdOutlineRedo,
  MdOutlineUndo,
} from "react-icons/md";
import { GRID, SHAPES } from "./meta";
import StatusButton from "./StatusButton";
import useStore, { ModeType } from "./store";

const Board: React.FC<{}> = ({}) => {
  const board = useStore((state) => state.board);
  const boardColor = useStore((state) => state.boardColor);
  const undo = useStore((state) => state.undo);
  const setState = useStore((state) => state.setState);
  const m = board.length,
    n = board[0].length;
  const selected = useStore((state) => state.selected);
  const press = useStore((state) => state.press);
  const svgRef = useRef<SVGSVGElement>(null);
  const boardRef = useRef<SVGSVGElement>(null);
  const panRef = React.useRef<[number, number, number]>([0, 0, 0]);

  // const [log, setLog] = React.useState<string[]>([]);

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
  function pan(dx: number, dy: number): void {
    if (boardRef.current === null) return;
    const paras = getTransform(boardRef.current!);
    if (paras === null) return;

    boardRef.current!.setAttribute(
      "transform",
      `translate(${panRef.current![1] + dx} ${panRef.current![2] + dy})`
    );
  }
  const reset = useCallback(() => {
    svgRef.current?.setAttribute("viewBox", `0 0 ${m * GRID} ${n * GRID}`);
    boardRef.current?.setAttribute("transform", `translate(0,0)`);
  }, []);
  useEffect(() => {
    console.log("resetting");
    reset();
  }, [reset]);
  useEffect(() => {
    console.log(board);
    console.log("selected", selected);
  }, [board, selected]);
  useGesture(
    {
      onPointerUp: ({ event, pinching }) => {
        // setLog((l) => [...l, `up ${panRef.current![0]}`]);
        if (panRef.current![0] > 0) {
          panRef.current![0] = panRef.current![0] - 1;
          return;
        }
        const board = document.getElementById("board");
        let p = new DOMPoint(event.clientX, event.clientY);
        p = p.matrixTransform((board as any).getScreenCTM().inverse());
        const j = Math.floor(p.x / GRID),
          i = Math.floor(p.y / GRID);
        // const [i,j] = getPlace(event.clientX, event.clientY);
        // console.log("up", panRef.current);
        press(i, j);
      },
      onDragStart: ({ pinching, cancel }) => {
        if (pinching) {
          cancel();
          // setLog((l) => [...l, "cancel drag " + panRef.current![0]]);
          return;
        }
        console.log("drag start", panRef.current);
        // setLog((l) => [...l, "drag start " + panRef.current![0]]);
      },
      onDragEnd: ({ canceled }) => {
        // if (canceled) return;
        const paras = getTransform(boardRef.current!);
        console.log("drag end ");
        if (paras === null) return;
        panRef.current = [1, paras[0], paras[1]];
        // setLog((l) => [...l, "drag end " + panRef.current]);
      },
      onDrag: ({ movement: [mx, my], cancel }) => {
        if (boardRef.current === null) {
          cancel();
          return;
        }
        // if (log[log.length - 1] !== "drag") setLog((l) => [...l, "drag"]);
        const { x: zx, y: zy } = new DOMPoint(0, 0).matrixTransform(
          boardRef.current.getScreenCTM()!.inverse()
        );
        const { x, y } = new DOMPoint(mx, my).matrixTransform(
          boardRef.current.getScreenCTM()!.inverse()
        );
        pan(x - zx, y - zy);
      },
    },
    {
      target: boardRef,
      // pointer: { touch: true },
      //   enabled: mode === ModeType.EDIT,
      eventOptions: { passive: false },
      drag: { threshold: 10 },
    }
  );
  useGesture(
    {
      onWheel: ({ event }) => {
        const delta = event.deltaY > 0 ? 1.1 : 0.9;
        zoom(delta);
      },
      onPinch: ({ event, movement: [my], delta: [dy], first }) => {
        // if (log[log.length - 1] !== "pinch") setLog((l) => [...l, "pinch"]);
        // if (dy < 10 || dy > -10) return;
        const delta = dy < 0 ? 1.1 : 0.9;
        const box = document.getElementById("svg")!.getBoundingClientRect();
        const x = (box!.left + box!.right) / 2;
        const y = (box!.top + box!.bottom) / 2;
        const p = new DOMPoint(x, y);
        // const sp = p.matrixTransform((svg as any).getScreenCTM().inverse());
        // setLog(["pinch", dy, panRef.current![0]]);
        // setLog(["pinch ", sp.x, +sp.y]);
        zoom(delta);
      },
      // onPinchStart: () => {
      //   setLog((l) => [...l, "pinch start " + panRef.current![0]]);
      //   // setLog(["pinchend", 0, panRef.current![0]]);
      // },
      onPinchEnd: () => {
        panRef.current![0] = 2;
        // setLog((l) => [...l, "pinch end " + panRef.current![0]]);
      },
    },
    {
      target: svgRef,
      // pointer: { touch: true },
      //   enabled: mode === ModeType.EDIT,
      eventOptions: { passive: false },
    }
  );
  return (
    <div className=" relative md:col-start-2">
      {/* <div className="overflow-visible z-50 hidden absolute right-0 bottom-0">
        {log.map((l, i) => (
          <p key={i.toString()}>{l}</p>
        ))}
      </div> */}
      <div className="absolute bottom-10 right-10 z-50 flex gap-x-2 space-between">
        <div onClick={reset}>
          <MdMyLocation size={20} />
        </div>
        <div onClick={() => setState({ mode: ModeType.LANDING })}>
          <MdOutlineMenu size={20} />
        </div>
      </div>
      <div className="absolute left-10 bottom-10 z-50 flex gap-x-2 space-between">
        <div
          onClick={() => {
            undo(true);
          }}
        >
          <MdOutlineUndo size={20} />
        </div>
        <div
          onClick={() => {
            undo(false);
          }}
        >
          <MdOutlineRedo size={20} />
        </div>
      </div>
      <div className="absolute top-0 left-0 z-50 w-12 h-12 md:hidden">
        <StatusButton />
      </div>
      <svg
        id="svg"
        ref={svgRef}
        //   viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className={`bg-neutral rounded-lg p-4 h-full w-full touch-none`}
      >
        <g id="board" className="touch-none" ref={boardRef}>
          <rect
            x="0"
            y="0"
            className={"fill-" + boardColor}
            width={m * GRID}
            height={n * GRID}
          />
          <rect
            x="0"
            y="0"
            className={"bg-" + boardColor}
            fill="url(#pattern)"
            width={m * GRID}
            height={n * GRID}
          />
          {board.map((row, i) => {
            return (
              <React.Fragment key={"" + i}>
                {row.map((dot, j) => {
                  if (dot === "") return null;
                  const todraw = dot.includes("|") ? dot.split("|") : [dot];
                  return todraw.map((d, ii) => {
                    const [shape, rotate, color] = d.split(".");
                    const key = [i, j, shape, rotate].join(".");
                    const isSelected = selected.includes(key);
                    return SHAPES.includes(shape) ? (
                      <use
                        key={key}
                        href={"#" + shape}
                        mask={isSelected ? "url(#mask)" : ""}
                        className={"fill-lego-" + color}
                        transform={
                          `translate(${j * GRID},${i * GRID})` +
                          (rotate === "0"
                            ? ""
                            : `rotate(${rotate} ${GRID / 2} ${GRID / 2})`)
                        }
                      />
                    ) : null;
                  });
                })}
              </React.Fragment>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default React.memo(Board);

const getTransform = (el: SVGElement) => {
  const t = el.getAttribute("transform");
  if (t === null) return null;
  return t.match(/-?\d+\.?\d*/g)!.map(Number);
};
