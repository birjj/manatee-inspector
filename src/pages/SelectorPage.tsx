import React, { useEffect, useState } from "react";
import PathEditor, { PathEntry } from "../components/path-editor";
import type { DOMEntry } from "../manatee/types";
import useDOMStore, { useHighlightNode } from "../stores/dom";
import { getPathAlternatives } from "../utils";

import style from "./SelectorPage.module.css";

type ParsedSelector = {
  window?: string;
  entries: SelectorEntry[];
  node: DOMEntry;
};
type SelectorEntry = {
  text: string;
  info: { uniqueTokens: string[] } & { [k: string]: string };
};

const SelectorPage = () => {
  const pathInfo = useDOMStore((state) => state.pathInfo);
  const [alternatives, setAlternatives] = useState([] as PathEntry[][]);

  useEffect(() => {
    setAlternatives(getPathAlternatives(pathInfo));
  }, [pathInfo]);

  return (
    <div className={style.wrapper}>
      <div className={style.container}>
        <h2>Suggested path:</h2>
        <PathEditor pathInfo={pathInfo || []} editable />
        <div className={style.alternatives}>
          <h2>Alternatives:</h2>
          {alternatives.map((list, i) => (
            <React.Fragment key={i}>
              {i > 0 ? <div className={style.separator} /> : null}
              <PathEditor pathInfo={list} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SelectorPage;
