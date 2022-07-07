import { useGesture } from "@use-gesture/react";
import React, { useCallback, useEffect, useRef } from "react";
import { MdMyLocation } from "react-icons/md";
import { BoardData } from "./App";
import { GRID } from "./meta";

const Board: React.FC<{
  board: BoardData;
  dimension: [number, number];
  handlePress: (place: number) => void;
}> = ({ board, dimension, handlePress }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const boardRef = useRef<SVGSVGElement>(null);

  const panRef = React.useRef<[number, number, number]>([0, 0, 0]);

  const [log, setLog] = React.useState<string[]>([]);
  console.log("board rendered");
  const getPlace = (x: number, y: number) => {
    const board = document.getElementById("board");
    let p = new DOMPoint(x, y);
    p = p.matrixTransform((board as any).getScreenCTM().inverse());
    const j = Math.floor(p.x / GRID),
      i = Math.floor(p.y / GRID);
    return i * dimension[0] + j;
  };

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
      `rotate(${paras[0]} ${paras[1]} ${paras[2]}) translate(${
        panRef.current![1] + dx
      } ${panRef.current![2] + dy})`
    );
  }
  const reset = useCallback(() => {
    svgRef.current?.setAttribute(
      "viewBox",
      `0 0 ${dimension[0] * GRID} ${dimension[1] * GRID}`
    );
    boardRef.current?.setAttribute(
      "transform",
      `rotate(0 ${(GRID * dimension[0]) / 2} ${
        (GRID * dimension[1]) / 2
      }) translate(0,0)`
    );
  }, [dimension]);
  useEffect(reset, [reset]);
  useGesture(
    {
      onPointerUp: ({ event, pinching }) => {
        console.log("up", panRef.current![0]);
        setLog((l) => [...l, `up ${panRef.current![0]}`]);
        if (panRef.current![0] > 0) {
          panRef.current![0] = panRef.current![0] - 1;
          return;
        }
        const place = getPlace(event.clientX, event.clientY);
        handlePress(place);
      },
      onDragStart: ({ pinching, cancel }) => {
        if (pinching) {
          cancel();
          setLog((l) => [...l, "cancel drag " + panRef.current![0]]);
          return;
        }
        console.log("drag start", panRef.current![0]);
        setLog((l) => [...l, "drag start " + panRef.current![0]]);
      },
      onDragEnd: ({ canceled }) => {
        // if (canceled) return;
        const paras = getTransform(boardRef.current!);
        console.log("drag end ");
        if (paras === null) return;
        panRef.current = [1, paras[3], paras[4]];
        setLog((l) => [...l, "drag end " + panRef.current![0]]);
      },
      onDrag: ({ movement: [mx, my], cancel }) => {
        if (boardRef.current === null) {
          cancel();
          return;
        }
        if (log[log.length - 1] !== "drag") setLog((l) => [...l, "drag"]);
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
        if (log[log.length - 1] !== "pinch") setLog((l) => [...l, "pinch"]);
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
      onPinchStart: () => {
        setLog((l) => [...l, "pinch start " + panRef.current![0]]);
        // setLog(["pinchend", 0, panRef.current![0]]);
      },
      onPinchEnd: () => {
        panRef.current![0] = 2;
        setLog((l) => [...l, "pinch end " + panRef.current![0]]);
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
    <>
      <div className="overflow-visible z-50 hidden absolute right-0 bottom-0">
        {log.map((l, i) => (
          <p key={i.toString()}>{l}</p>
        ))}
      </div>
      <div className="absolute bottom-10 right-10 z-50" onClick={reset}>
        <MdMyLocation />
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
            className="fill-lego-blue"
            width={dimension[0] * GRID}
            height={dimension[1] * GRID}
          />
          <rect
            x="0"
            y="0"
            className="bg-lego-blue"
            fill="url(#pattern)"
            width={dimension[0] * GRID}
            height={dimension[1] * GRID}
          />
          {Object.entries(board).map(([_place, [shape, color, rotate]]) => {
            const place = parseInt(_place);
            if (place < 0) return null;
            const x = place % dimension[0],
              y = Math.floor(place / dimension[0]);
            return (
              // <>
              <use
                key={_place}
                href={"#" + shape}
                className={`fill-lego-${color} hover:fill-white`}
                transform={`translate(${x * GRID},${y * GRID}) rotate(${
                  (rotate ?? 0) * 90
                } ${GRID / 2} ${GRID / 2}) `}
              />
            );
          })}
        </g>
      </svg>
    </>
  );
};

export default Board;

const getTransform = (el: SVGElement) => {
  const t = el.getAttribute("transform");
  if (t === null) return null;
  return t.match(/-?\d+\.?\d*/g)!.map(Number);
};

// function rotate() {
//     const svg = document.getElementById("svg");
//     const board = document.getElementById("board");
//     const box = svg?.getBoundingClientRect();
//     const x = (box!.left + box!.right) / 2;
//     const y = (box!.top + box!.bottom) / 2;
//     const p = new DOMPoint(x, y);
//     const rc = p.matrixTransform((board as any).getScreenCTM().inverse());
//     setTransform((t) => {
//       const paras = t.match(/-?\d+\.?\d*/g)!.map(Number);
//       return `rotate(${(paras[0] + 90) % 360} ${rc.x + paras[3]} ${
//         rc.y + paras[4]
//       }) translate(${paras[3]} ${paras[4]})`;
//     });
//   }
