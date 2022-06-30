import React from "react";
import { GRID, Shape } from "./meta";

const Sidebar: React.FC = () => {
  return (
    <>
      {/* current */}
      <div className="w-full">
        <Dot shape={"rect"} />
      </div>
      {/* used */}
      <div className="flex flex-col">
        <div className="flex flex-wrap">
          <Dot shape={"rect"} />
          <Dot shape={"arc"} />
          <Dot shape={"circle"} />
        </div>
        {/* all shapes */}
        <div className="flex flex-wrap">
          <Dot shape={"rect"} />
          <Dot shape={"arc"} />
          <Dot shape={"circle"} />
        </div>
      </div>
    </>
  );
};

const Dot: React.FC<{ shape: Shape; used?: number }> = ({ shape, used }) => {
  return (
    <svg className="basis-1/2" viewBox={`0 0 ${GRID} ${GRID}`}>
      <use
        href={"#" + shape}
        className={`fill-lego-blue-light w-full h-full`}
      />
    </svg>
  );
};
export default Sidebar;
