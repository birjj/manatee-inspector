import React from "react";
import shallow from "zustand/shallow";
import useConsoleStore from "../../../stores/console";
import TextEditor from "../../text-editor";

import style from "./index.module.css";

const ConsoleEditor = ({ execute }: { execute: (code: string) => void }) => {
  const { prompt, setPrompt } = useConsoleStore(
    (state) => ({
      runCode: state.runCode,
      prompt: state.prompt,
      setPrompt: state.setPrompt,
    }),
    shallow
  );
  return (
    <div className={style["content"]}>
      <div className={style["input"]}>
        <TextEditor value={prompt} onChange={setPrompt} onSubmit={execute} />
      </div>
    </div>
  );
};
export default ConsoleEditor;
