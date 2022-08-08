import React, { useState } from "react";
import { GRID } from "./meta";
import useStore, { EditorMode } from "./store";

const Help: React.FC = () => {
  return (
    <div className="grow flex justify-center items-center">
      <span className="text-md text-white">Under Construction</span>
    </div>
  );
};

export default React.memo(Help);
