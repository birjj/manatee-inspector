import React, { useCallback, useEffect, useRef, useState } from "react";
import { useHighlightNode } from "../../../stores/dom";
import ActionButton from "../../action-button";
import { CopyIcon, PaintIcon } from "../../icons";

import style from "./path-editor.module.css";

export type PathEntry =
  | ({ [k: string]: string } & { uniqueTokens?: string[] })
  | { text: string; hasInfo: false };

function textFromEntry(entry: PathEntry) {
  if ((entry as any).type === "window") {
    return `{${(entry as any).title}}`;
  }
  return (
    entry.text ||
    ((entry as any).uniqueTokens || []).filter(
      (k: string) => (entry as any)[k]
    )[0] ||
    Object.values(entry).filter((v) => typeof v === "string" && v)[0] ||
    "<unknown>"
  );
}

type PathEditorProps = {
  pathInfo: PathEntry[];
  editable?: boolean;
};
const PathEditor = ({ pathInfo, editable = false }: PathEditorProps) => {
  const $container = useRef(null as HTMLDivElement | null);
  const tags: React.ReactNode[] = [];
  const highlightNode = useHighlightNode();

  pathInfo.forEach((entry, i) => {
    tags.push(
      <PathEntryElm key={i} data={entry} editable={editable} />,
      (entry as any).type !== "window" && i < pathInfo.length - 1 ? (
        <span key={`${i}-sep`} className={style.separator}>
          /
        </span>
      ) : null
    );
  });

  const doCopy = useCallback(() => {
    if (!$container.current) {
      return false;
    }
    if (!pathInfo.length) {
      return false;
    }
    navigator.clipboard.writeText($container.current.textContent || "");
    return true;
  }, [pathInfo, $container]);

  const doHighlight = useCallback(() => {
    if (!$container.current) {
      return false;
    }
    if (!pathInfo.length) {
      return false;
    }
    const path = $container.current.textContent || "";
    highlightNode(path);
    return true;
  }, [pathInfo, $container]);

  return (
    <div className={style.container}>
      <div className={style["tag-container"]} ref={$container}>
        {tags}
      </div>
      <div className={style["button-container"]}>
        <ActionButton
          disabled={!pathInfo.length}
          action={doCopy}
          activeText="Copied"
          tooltip="Copy"
        >
          <CopyIcon />
        </ActionButton>
        <ActionButton
          disabled={!pathInfo.length}
          action={doHighlight}
          activeText="Highlighted"
          tooltip="Highlight"
        >
          <PaintIcon />
        </ActionButton>
      </div>
    </div>
  );
};

type PathEntryProps = {
  data: PathEntry;
  editable: boolean;
};
const PathEntryElm = ({ data, editable }: PathEntryProps) => {
  const cName = [
    style["entry"],
    (data as any).type === "window" ? style["entry--window"] : "",
    data.hasInfo === false ? style["entry--no-info"] : "",
    data.text === "*" || data.text === "**" ? style["entry--wildcard"] : "",
  ].join(" ");

  return <span className={cName}>{textFromEntry(data)}</span>;
};

export default PathEditor;
