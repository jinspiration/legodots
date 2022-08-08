import React from "react";
import { BsEraser, BsHandIndexThumb } from "react-icons/bs";
import {
  MdOutlineControlPointDuplicate,
  MdOutlineEditOff,
  MdOutlineFormatColorFill,
  MdOutlineKeyboardArrowDown,
  MdOutlineWindow,
} from "react-icons/md";
import { DOTS, GRID } from "./meta";
import useStore, { EditorMode } from "./store";

interface Prop {
  shape: string;
  color: string;
  rotate: number;
}

const _DotButton: React.FC<Prop> = ({ shape, color, rotate }) => {
  return (
    <svg viewBox={`0 0 ${DOTS[shape].size * GRID} ${DOTS[shape].size * GRID}`}>
      <use
        href={"#" + shape}
        className={`fill-lego-${color}`}
        transform={`rotate(${rotate} ${(GRID * DOTS[shape].size) / 2} ${
          (GRID * DOTS[shape].size) / 2
        }) `}
      ></use>
    </svg>
  );
};

const _StatusButton: React.FC = () => {
  const editorMode = useStore((state) => state.editorMode);
  const current = useStore((state) => state.current);
  return editorMode === EditorMode.PLACE ? (
    <DotButton shape={current[0]} rotate={current[1]} color={current[2]} />
  ) : editorMode === EditorMode.DELETE ? (
    <BsEraser className="fill-blue-500" />
  ) : editorMode === EditorMode.FILL ? (
    <MdOutlineFormatColorFill className={`fill-lego-${current[2]}`} />
  ) : editorMode === EditorMode.SELECT ? (
    <BsHandIndexThumb className="fill-blue-500" />
  ) : (
    <MdOutlineKeyboardArrowDown className="fill-blue-500" />
  );
};

export const StatusButton = React.memo(_StatusButton);
export const DotButton = React.memo(_DotButton);
