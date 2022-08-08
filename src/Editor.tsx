import React from "react";
import Board from "./Board";
import useStore, { EditorMode } from "./store";
import { DotButton, StatusButton } from "./Buttons";
import { DOTS } from "./meta";
import { MdOutlineFormatColorFill } from "react-icons/md";

const Editor: React.FC = () => {
  const setState = useStore((state) => state.setState);
  const current = useStore((state) => state.current);
  const mode = useStore((state) => state.editorMode);
  const rotateCurrent = useStore((state) => state.rotateCurrent);
  const shapes = useStore((state) => state.shapes);
  const colors = useStore((state) => state.colors);
  return (
    <div className="p-2 h-full w-full grid grid-flow-row-dense grid-rows-[6rem_minmax(0,1fr)_6rem] grid-cols-[7rem_minmax(0,1fr)] md:grid-rows-[6rem_minmax(0,1fr)_7rem] md:grid-cols-[6rem_minmax(0,1fr)] [&>div]:rounded-lg gap-1 [&>div]:bg-zinc-700">
      <div className="button-md hidden md:inline-flex" onClick={rotateCurrent}>
        <StatusButton />
      </div>
      <div className="col-span-2 md:col-start-2 px-2">
        <div className="flex overflow-x-auto scrollbar">
          {shapes.map((shape) => (
            <div
              key={shape}
              className="flex-none button-sm"
              onClick={() =>
                setState((state) => {
                  return {
                    current: [
                      shape,
                      DOTS[shape].rotate.indexOf(state.current[1]) !== -1
                        ? state.current[1]
                        : 0,
                      state.current[2],
                    ],
                    editorMode: EditorMode.PLACE,
                  };
                })
              }
            >
              <DotButton shape={shape} rotate={0} color={current[2]} />
            </div>
          ))}
        </div>
        <div className="flex overflow-x-auto scrollbar">
          {colors.map((color) => {
            return mode === EditorMode.FILL ? (
              <div
                key={color}
                className="flex-none button-sm"
                onClick={() =>
                  setState((state) => {
                    return {
                      current: [state.current[0], state.current[1], color],
                    };
                  })
                }
              >
                <MdOutlineFormatColorFill
                  key={color}
                  className={`fill-lego-${color} w-full h-full`}
                />
              </div>
            ) : (
              <div
                key={color}
                className="flex-none button-sm"
                onClick={() =>
                  setState((state) => {
                    return {
                      current: [state.current[0], state.current[1], color],
                      editorMode: EditorMode.PLACE,
                    };
                  })
                }
              >
                <DotButton
                  shape={current[0]}
                  rotate={current[1]}
                  color={color}
                />
              </div>
            );
          })}
        </div>
      </div>
      <Board />
    </div>
  );
};

export default React.memo(Editor);
