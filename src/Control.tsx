import React, { useEffect } from "react";
import { BsEraser, BsHandIndexThumb } from "react-icons/bs";
import {
  MdOutlineAddToPhotos,
  MdOutlineCancel,
  MdOutlineFormatColorFill,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import { StatusButton } from "./Buttons";
import useStore, { ModeType } from "./store";

const Control: React.FC = () => {
  const setState = useStore((state) => state.setState);
  const mode = useStore((state) => state.mode);
  const current = useStore((state) => state.current);
  const boardColor = useStore((state) => state.boardColor);
  const rotateCurrent = useStore((state) => state.rotateCurrent);
  const selected = useStore((state) => state.selected);
  const pickupSelected = useStore((state) => state.pickupSelected);
  const duplicateSelected = useStore((state) => state.duplicateSelected);
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
  return (
    <div className="absolute top-2 left-2 z-50 flex gap-x-1 ">
      <div
        className={`${
          mode === ModeType.EDIT ? "bg-zinc-700" : "bg-blue-500"
        } menu-container shadow-sm md:hidden`}
      >
        <div className="button-xs md:button-sm" onClick={rotateCurrent}>
          <StatusButton />
        </div>
      </div>
      <div className="bg-gray-200 menu-container [&>*]:button-xs-sm [&>*>svg]:fill-gray-700 flex shadow-md">
        <div
          onClick={() => {
            setState((state) => {
              return boardColor === "" ? {} : { mode: ModeType.FILL };
            });
          }}
        >
          <MdOutlineFormatColorFill />
        </div>
        <div
          onClick={() => {
            setState((state) => {
              return boardColor === "" ? {} : { mode: ModeType.DELETE };
            });
          }}
        >
          <BsEraser />
        </div>
        <div
          onClick={() => {
            setState((state) => {
              return boardColor === "" ? {} : { mode: ModeType.SELECT };
            });
          }}
        >
          <BsHandIndexThumb />
        </div>
      </div>
      {selected.length !== 0 && (
        <div className="bg-yellow-200 menu-container [&>*]:button-xs-sm [&>*>svg]:fill-gray-700 flex shadow-md">
          <div
            onClick={() => setState({ selected: [], mode: ModeType.SELECT })}
          >
            <MdOutlineCancel />
          </div>
          <div onClick={() => pickupSelected()}>
            <MdOutlineKeyboardArrowUp />
          </div>
          <div>
            <MdOutlineAddToPhotos onClick={() => duplicateSelected()} />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Control);
