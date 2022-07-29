import React, { useEffect } from "react";
import { BsHandIndexThumb } from "react-icons/bs";
import { MdOutlineEditOff, MdOutlineWindow, MdWaterDrop } from "react-icons/md";
import { DOTS } from "./meta";
import DotButton from "./DotButton";
import useStore, { ModeType } from "./store";

const StatusButton: React.FC = () => {
  const mode = useStore((state) => state.mode);
  const current = useStore((state) => state.current);
  const setState = useStore((state) => state.setState);
  const rotateCurrent = () =>
    setState((state) => {
      console.log("rotate current");
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
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case "r":
          rotateCurrent();
          break;
      }
    };
    document.body.addEventListener("keydown", handleKey);
    return () => {
      document.body.removeEventListener("keydown", handleKey);
    };
  }, []);
  switch (mode) {
    case ModeType.LANDING:
      return (
        <div className="p-2 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-white">
          <MdOutlineWindow />
        </div>
      );
    case ModeType.EDIT:
      return (
        <div className="p-2" onClick={rotateCurrent}>
          <DotButton
            shape={current[0]}
            rotate={current[1]}
            color={current[2]}
          />
        </div>
      );
    case ModeType.DELETE:
      return (
        <div className="p-2 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-white">
          <MdOutlineEditOff />
        </div>
      );
    case ModeType.FILL:
      return (
        <div className="p-2">
          <MdWaterDrop
            size={30}
            className={`fill-lego-${current[2]} w-full h-full`}
          />
        </div>
      );
    case ModeType.SELECT:
      return (
        <div className="p-2 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-white">
          <BsHandIndexThumb />
        </div>
      );
    default:
      return null;
  }
};

export default React.memo(StatusButton);
