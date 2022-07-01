import React, { useState } from "react";
import type { HistoryEntry } from "../../../stores/console";
import { ResponseIcon } from "../../icons";
import TextEditor from "../../text-editor";
import Value from "../../value";

import style from "./entry.module.css";

const HistoryListEntry = React.memo(({ entry }: { entry: HistoryEntry }) => {
  const [requestExpanded, setRequestExpanded] = useState(false);

  let respValue: any = entry.response;
  if (entry.response === "undefined") {
    respValue = undefined;
  }

  let $content: React.ReactNode = null;
  if (entry.loading) {
    $content = <span className={style.loader} />;
  } else if (entry.error) {
    $content = <pre>{respValue}</pre>;
  } else {
    $content = <Value data={respValue} expanded />;
  }
  return (
    <>
      <div
        className={[
          style.entry,
          style["entry--request"],
          style["entry--expandable"],
          requestExpanded ? style["entry--expanded"] : "",
        ].join(" ")}
      >
        <div className={style["entry__icon"]}>
          <ResponseIcon style={{ transform: "rotate(180deg)" }} />
        </div>
        <div className={style["entry__content"]}>
          <TextEditor value={entry.request} onChange={() => {}} readOnly />
        </div>
        <div
          className={style["entry__expand-toggler"]}
          onClick={() => setRequestExpanded(!requestExpanded)}
        />
      </div>
      <div
        className={[
          style.entry,
          entry.error ? style["entry--error"] : "",
          style["entry--response"],
        ].join(" ")}
      >
        <div className={style["entry__icon"]}>
          <ResponseIcon />
        </div>
        <div className={style["entry__content"]}>{$content}</div>
      </div>
    </>
  );
});
export default HistoryListEntry;
