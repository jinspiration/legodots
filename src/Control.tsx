import React, { useEffect } from "react";
import { BsEraser, BsHandIndexThumb } from "react-icons/bs";
import { VscMove } from "react-icons/vsc";
import {
  MdOutlineAddToPhotos,
  MdOutlineCancel,
  MdOutlineFormatColorFill,
  MdOutlineKeyboardArrowUp,
  MdOutlineStar,
} from "react-icons/md";
import { StatusButton } from "./Buttons";
import useStore, { EditorMode } from "./store";

const Control: React.FC = () => {
  const setState = useStore((state) => state.setState);
  const boardColor = useStore((state) => state.board.color);
  const rotateCurrent = useStore((state) => state.rotateCurrent);
  const selected = useStore((state) => state.selected);
  const copy = useStore((state) => state.copy);
  const savePattern = useStore((state) => state.savePattern);
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
      <div className={"menu-container shadow-sm md:hidden"}>
        <div className="button-xs md:button-sm" onClick={rotateCurrent}>
          <StatusButton />
        </div>
      </div>
      <div className="bg-gray-200 menu-container [&>*]:button-xs-sm [&>*>svg]:fill-gray-700 flex shadow-md">
        <div
          onClick={() => {
            setState((state) => {
              return boardColor === "" ? {} : { editorMode: EditorMode.FILL };
            });
          }}
        >
          <MdOutlineFormatColorFill />
        </div>
        <div
          onClick={() => {
            setState((state) => {
              return boardColor === "" ? {} : { editorMode: EditorMode.DELETE };
            });
          }}
        >
          <BsEraser />
        </div>
        <div
          onClick={() => {
            setState((state) => {
              return boardColor === "" ? {} : { editorMode: EditorMode.SELECT };
            });
          }}
        >
          <BsHandIndexThumb />
        </div>
      </div>
      {selected.length !== 0 && (
        <div className="bg-yellow-200 menu-container [&>*]:button-xs-sm [&>*>svg]:fill-gray-700 flex shadow-md">
          <div
            onClick={() =>
              setState({ selected: [], editorMode: EditorMode.SELECT })
            }
          >
            <MdOutlineCancel />
          </div>
          {copy ? (
            <div>
              <MdOutlineAddToPhotos
                onClick={() => setState((state) => ({ copy: !state.copy }))}
              />
            </div>
          ) : (
            <div onClick={() => setState((state) => ({ copy: !state.copy }))}>
              <VscMove />
            </div>
          )}
          <div onClick={() => savePattern()}>
            <MdOutlineStar />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Control);
