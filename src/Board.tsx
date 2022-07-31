import { useGesture } from "@use-gesture/react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  MdMyLocation,
  MdOutlineGrid4X4,
  MdOutlineMenu,
  MdOutlineRedo,
  MdOutlineUndo,
} from "react-icons/md";
import { GRID, SHAPES } from "./meta";
import useStore, { ModeType } from "./store";
import Control from "./Control";

const Board: React.FC<{}> = ({}) => {
  const board = useStore((state) => state.board);
  const boardColor = useStore((state) => state.boardColor);
  const undo = useStore((state) => state.undo);
  const setState = useStore((state) => state.setState);
  const selected = useStore((state) => state.selected);
  const press = useStore((state) => state.press);
  const { hasRedo, hasUndo } = useStore((state) => {
    return {
      hasRedo:
        state.redoStack.length > 0 && state.curRedo < state.redoStack.length,
      hasUndo: state.undo.length > 0 && state.curRedo > 0,
    };
  });
  const [m, n, isWhite] = useMemo(
    () => [board.length, board[0].length, boardColor === "lego-white"],
    [boardColor]
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const boardRef = useRef<SVGSVGElement>(null);
  const gridRef = useRef<SVGAElement>(null);
  const panRef = React.useRef<[number, number, number]>([0, 0, 0]);

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
    svgRef.current?.setAttribute("viewBox", `0 0 ${n * GRID} ${m * GRID}`);
    zoom(1.2);
    boardRef.current?.setAttribute("transform", `translate(0,0)`);
    gridRef.current?.setAttribute("visibility", "hidden");
  }, []);
  useEffect(() => {
    reset();
  }, [reset]);
  useGesture(
    {
      onPointerUp: ({ event, pinching }) => {
        if (panRef.current![0] > 0) {
          panRef.current![0] = panRef.current![0] - 1;
          return;
        }
        const board = document.getElementById("board");
        let p = new DOMPoint(event.clientX, event.clientY);
        p = p.matrixTransform((board as any).getScreenCTM().inverse());
        const j = Math.floor(p.x / GRID),
          i = Math.floor(p.y / GRID);
        press(i, j);
      },
      onDragStart: ({ pinching, cancel }) => {
        if (pinching) {
          cancel();
          return;
        }
      },
      onDragEnd: () => {
        const paras = getTransform(boardRef.current!);
        if (paras === null) return;
        panRef.current = [1, paras[0], paras[1]];
      },
      onDrag: ({ movement: [mx, my], cancel }) => {
        if (boardRef.current === null) {
          cancel();
          return;
        }
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
      onPinch: ({ delta: [dy] }) => {
        const delta = dy < 0 ? 1.1 : 0.9;
        zoom(delta);
      },
      onPinchEnd: () => {
        panRef.current![0] = 2;
      },
    },
    {
      target: svgRef,
      eventOptions: { passive: false },
    }
  );

  return (
    <main className="relative md:col-start-2 bg-neutral rounded-md p-4">
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
        <div onClick={() => setState({ mode: ModeType.LANDING })}>
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
            className={"fill-" + boardColor}
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
          {board.map((row, i) => {
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
                        mask={selected.includes(key) ? "url(#mask)" : ""}
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
        </g>
      </svg>
    </main>
  );
};

export default React.memo(Board);

const getTransform = (el: SVGElement) => {
  const t = el.getAttribute("transform");
  if (t === null) return null;
  return t.match(/-?\d+\.?\d*/g)!.map(Number);
};
