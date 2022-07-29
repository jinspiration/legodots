import React from "react";
import { BsHandIndexThumb } from "react-icons/bs";
import useStore, { ModeType } from "./store";

const Select: React.FC = () => {
  const setState = useStore((state) => state.setState);
  return (
    <div
      className="bg-neutral h-24 w-36 md:w-24 rounded-md"
      onClick={() => setState({ mode: ModeType.SELECT })}
    >
      <BsHandIndexThumb />
    </div>
  );
};
export default React.memo(Select);
