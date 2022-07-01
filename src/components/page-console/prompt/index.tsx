import React, { useCallback } from "react";
import shallow from "zustand/shallow";
import useAppsStore from "../../../stores/apps";
import useConsoleStore from "../../../stores/console";
import Bar, { Filler, TextButton } from "../../bar";
import { ClearIcon } from "../../icons";
import ConsoleEditor from "./editor";
import style from "./index.module.css";
import ConsoleTimeoutInput from "./timeout-input";

const ConsolePrompt = () => {
  const prompt = useConsoleStore((state) => state.prompt);
  const activeApp = useAppsStore((state) => state.active);
  const { isLoading, runCode, clearHistory } = useConsoleStore(
    (state) => ({
      isLoading: state.isLoading,
      runCode: state.runCode,
      clearHistory: state.clearHistory,
    }),
    shallow
  );
  const execute = useCallback(
    (code: string) => {
      runCode(activeApp?.uuid || "", code);
    },
    [activeApp?.uuid]
  );

  return (
    <div className={style.prompt}>
      <Bar className={style["prompt-header"]}>
        <TextButton onClick={clearHistory}>
          <ClearIcon style={{ height: "14px" }} />
        </TextButton>
        <Filler />
        <ConsoleTimeoutInput />
        <button
          onClick={() => execute(prompt)}
          disabled={isLoading || !prompt}
          className={[prompt ? "primary" : ""].join(" ")}
        >
          {isLoading ? <span className={style.loader} /> : null}
          Run code (<kbd>Shift</kbd>+<kbd>Enter</kbd>)
        </button>
      </Bar>
      <ConsoleEditor execute={execute} />
    </div>
  );
};
export default ConsolePrompt;
