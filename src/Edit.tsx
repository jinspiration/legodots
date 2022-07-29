import React from "react";
import { BsEraser } from "react-icons/bs";
import { MdOutlineFormatColorFill, MdWaterDrop } from "react-icons/md";
import DotButton from "./DotButton";
import { DOTCOLORS, DOTS } from "./meta";
import StatusButton from "./StatusButton";
import useStore, { ModeType } from "./store";

const Edit: React.FC = () => {
  const setState = useStore((state) => state.setState);
  const current = useStore((state) => state.current);
  const mode = useStore((state) => state.mode);
  const boardColor = useStore((state) => state.boardColor);
  return (
    <div className="bg-neutral grid md:col-span-2 grid-rows-[3rem_3rem] auto-cols-[3rem] [&>*]:h-full [&>*]:w-full [&>*]:p-1 rounded-md overflow-x-auto">
      <div className="row-start-1 row-span-2 col-span-2 hidden md:inline-flex">
        <StatusButton />
      </div>
      {Object.keys(DOTS).map((shape) => (
        <div
          key={shape}
          className="row-start-1"
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
            className="row-start-2"
            onClick={() =>
              setState((state) => {
                return {
                  current: [state.current[0], state.current[1], color],
                };
              })
            }
          >
            <MdWaterDrop
              key={color}
              size={30}
              className={`fill-lego-${color} w-full h-full`}
            />
          </div>
        ) : (
          <div
            key={color}
            className="row-start-2"
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
      <div
        className="[&>svg]:menu-icon"
        onClick={() => {
          setState((state) => {
            return boardColor === "" ? {} : { mode: ModeType.FILL };
          });
        }}
      >
        <MdOutlineFormatColorFill
          size={30}
          className={`fill-lego-${current[2]} w-full h-full`}
        />
      </div>
      <div
        className="[&>svg]:menu-icon"
        onClick={() => {
          setState((state) => {
            return boardColor === "" ? {} : { mode: ModeType.DELETE };
          });
        }}
      >
        <BsEraser />
      </div>
    </div>
  );
};
export default React.memo(Edit);
