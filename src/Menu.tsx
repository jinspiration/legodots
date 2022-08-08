import React, { useState } from "react";
import {
  MdHelpOutline,
  MdOutlineAddBox,
  MdOutlineDynamicFeed,
  MdOutlineEdit,
  MdOutlineSettings,
} from "react-icons/md";
import BoardSelection from "./BoardSelection";
import Gallery from "./Gallery";
import Help from "./Help";
import Settings from "./Settings";
import useStore, { AppMode, EditorMode } from "./store";

const Menu: React.FC = () => {
  const appMode = useStore((state) => state.appMode);
  const setState = useStore((state) => state.setState);
  return (
    <div className="p-2 h-full w-full grid grid-rows-[6rem_minmax(0,1fr)] md:grid-rows-[8rem_minmax(0,1fr)] gap-y-2">
      <div className="bg-zinc-700 rounded-lg h-24 md:h-32 grid grid-cols-5 shadow-sm shadow-gray-400 [&>*>div]:button-sm md:[&>*>div]:button-md justify-evenly items-center [&>*]:menu-item">
        <div onClick={() => setState({ appMode: AppMode.EDITOR })}>
          <div>
            <MdOutlineEdit className="fill-blue-500" />
          </div>
          <span>EDITOR</span>
        </div>
        <div onClick={() => setState({ appMode: AppMode.NEW })}>
          <div>
            <MdOutlineAddBox
              className={
                appMode === AppMode.NEW ? "fill-green-400" : "fill-blue-500"
              }
            />
          </div>
          <span>NEW</span>
        </div>
        <div onClick={() => setState({ appMode: AppMode.GALLERY })}>
          <div>
            <MdOutlineDynamicFeed
              className={
                appMode === "gallery" ? "fill-green-400" : "fill-blue-500"
              }
            />
          </div>
          <span>GALLERY</span>
        </div>
        <div onClick={() => setState({ appMode: AppMode.SETTINGS })}>
          <div>
            <MdOutlineSettings
              className={
                appMode === "settings" ? "fill-green-400" : "fill-blue-500"
              }
            />
          </div>
          <span>SETTINGS</span>
        </div>
        <div onClick={() => setState({ appMode: AppMode.HELP })}>
          <div>
            <MdHelpOutline
              className={
                appMode === "help" ? "fill-green-400" : "fill-blue-500"
              }
            />
          </div>
          <span>HELP</span>
        </div>
      </div>
      {appMode === AppMode.GALLERY && <Gallery />}
      {appMode === AppMode.NEW && <BoardSelection />}
      {appMode === AppMode.SETTINGS && <Settings />}
      {appMode === AppMode.HELP && <Help />}
    </div>
  );
};
export default Menu;
