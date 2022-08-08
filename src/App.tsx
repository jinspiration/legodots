/// <reference path="./svg.d.ts" />

import { useEffect } from "react";
import { ReactComponent as Defs } from "./assets/defs.svg";
import { AppMode } from "./store";
import Menu from "./Menu";
import useStore from "./store";
import Editor from "./Editor";

function App() {
  const appMode = useStore((state) => state.appMode);
  useEffect(() => {
    const setViewHeight = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setViewHeight();
    window.addEventListener("resize", setViewHeight);
    return () => {
      window.removeEventListener("resize", setViewHeight);
    };
  }, []);
  return (
    <div className="App bg-neutral-900 container h-screen mx-auto ">
      <Defs />
      {appMode === AppMode.EDITOR ? <Editor /> : <Menu />}
    </div>
  );
}

export default App;
