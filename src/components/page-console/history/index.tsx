import React, { useLayoutEffect, useRef } from "react";
import useConsoleStore from "../../../stores/console";
import HistoryListEntry from "./entry";

import style from "./index.module.css";

const ConsoleHistory = React.memo(() => {
  const history = useConsoleStore((state) => state.history);
  const $history = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      if (!$history.current) {
        return;
      }
      $history.current.scrollTo({
        top: Infinity,
        behavior: "auto",
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [history]);

  return (
    <div className={style.history} ref={$history}>
      <div className={style["history-list"]}>
        {history.map((entry, i) => (
          <HistoryListEntry key={i} entry={entry} />
        ))}
      </div>
    </div>
  );
});
export default ConsoleHistory;
