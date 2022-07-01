import React, { ChangeEvent } from "react";
import shallow from "zustand/shallow";
import useConsoleStore from "../../../stores/console";
import { Input } from "../../input";

import style from "./index.module.css";

const ConsoleTimeoutInput = () => {
  const { timeout, setTimeout } = useConsoleStore(
    (state) => ({
      timeout: state.timeout,
      setTimeout: state.setTimeout,
    }),
    shallow
  );

  return (
    <div className={style.timeout}>
      Time limit:{" "}
      <Input
        postfix={"ms"}
        className={style["timeout-input"]}
        innerClass={style["timeout-inner"]}
        type="number"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setTimeout(+e.target.value || 0);
        }}
        value={timeout || ""}
      />
    </div>
  );
};
export default ConsoleTimeoutInput;
