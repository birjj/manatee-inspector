import React from "react";

import style from "./ConsolePage.module.css";
import Resizable from "../components/resizable";
import ConsoleEditor from "../components/page-console/prompt";
import ConsoleHistory from "../components/page-console/history";

const ConsolePage = () => {
  return (
    <div className={style.wrapper}>
      <Resizable
        direction="vertical"
        children={[<ConsoleHistory />, <ConsoleEditor />]}
        childClasses={[style["history-section"], style["prompt-section"]]}
      />
    </div>
  );
};
export default ConsolePage;
