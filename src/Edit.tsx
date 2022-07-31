import React from "react";
import { BsEraser, BsHandIndexThumb } from "react-icons/bs";
import { MdOutlineFormatColorFill, MdWaterDrop } from "react-icons/md";
import { DOTCOLORS, DOTS } from "./meta";
import { StatusButton, DotButton } from "./Buttons";
import useStore, { ModeType } from "./store";

const Edit: React.FC = () => {
  const setState = useStore((state) => state.setState);
  const current = useStore((state) => state.current);
  const mode = useStore((state) => state.mode);
  const rotateCurrent = useStore((state) => state.rotateCurrent);
  return (
    <div className="md:col-span-2 flex gap-x-1  overflow-x-auto scrollbar">
      <div className="button-md hidden md:inline-flex" onClick={rotateCurrent}>
        <StatusButton />
      </div>
      <div className=" grow grid grid-rows-2 auto-cols-[3rem] ">
        {Object.keys(DOTS).map((shape) => (
          <div
            key={shape}
            className="row-start-1 button-sm"
            onClick={() =>
              setState((state) => {
                if (state.mode === ModeType.LANDING) return {};
                return {
                  current: [
                    shape,
                    DOTS[shape].rotate.indexOf(state.current[1]) !== -1
                      ? state.current[1]
                      : 0,
                    state.current[2],
                  ],
                  mode: ModeType.EDIT,
                };
              })
            }
          >
            <DotButton shape={shape} rotate={0} color={current[2]} />
          </div>
        ))}
        {Object.keys(DOTCOLORS).map((_color) => {
          const color = _color.slice(5);
          return mode === ModeType.FILL ? (
            <div
              key={color}
              className="row-start-2 button-sm"
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
              className="row-start-2 button-sm"
              onClick={() =>
                setState((state) => {
                  if (state.mode === ModeType.LANDING) return {};
                  return {
                    current: [state.current[0], state.current[1], color],
                    mode: ModeType.EDIT,
                  };
                })
              }
            >
              <DotButton shape={current[0]} rotate={current[1]} color={color} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default React.memo(Edit);
