import React, { useCallback, useEffect, useRef, useState } from "react";
import { useHighlightNode } from "../../stores/dom";
import { CopyIcon, PaintIcon } from "../icons";

import style from "./path-editor.module.css";

export type PathEntry = ({ [k: string]: string } & { uniqueTokens?: string[] }) | { text: string, hasInfo: false };

function textFromEntry(entry: PathEntry) {
    if ((entry as any).type === "window") {
        return `{${(entry as any).title}}`;
    }
    return entry.text
        || ((entry as any).uniqueTokens || []).filter((k: string) => (entry as any)[k])[0]
        || Object.values(entry).filter(v => typeof v === "string" && v)[0]
        || "<unknown>";
}

type PathEditorProps = {
    pathInfo: PathEntry[],
    editable?: boolean,
};
const PathEditor = ({ pathInfo, editable = false }: PathEditorProps) => {
    const $container = useRef(null as HTMLDivElement | null);
    const tags: React.ReactNode[] = [];
    const [didCopy, setDidCopy] = useState(false);
    const didCopyTimeout = useRef(0);
    const [didHighlight, setDidHighlight] = useState(false);
    const didHighlightTimeout = useRef(0);
    const highlightNode = useHighlightNode();

    pathInfo.forEach((entry, i) => {
        tags.push(
            <PathEntryElm key={i} data={entry} editable={editable} />,
            (entry as any).type !== "window" && i < pathInfo.length - 1
                ? <span key={`${i}-sep`} className={style.separator}>/</span>
                : null
        );
    });

    const doCopy = useCallback(() => {
        if (!$container.current) { return; }
        if (!pathInfo.length) { return; }
        clearTimeout(didCopyTimeout.current);
        setDidCopy(true);
        navigator.clipboard.writeText($container.current.textContent || "");
        didCopyTimeout.current = setTimeout(() => setDidCopy(false), 500);
    }, [pathInfo, $container, didCopyTimeout, setDidCopy]);

    const doHighlight = useCallback(() => {
        if (!$container.current) { return; }
        if (!pathInfo.length) { return; }
        clearTimeout(didHighlightTimeout.current);
        didHighlightTimeout.current = setTimeout(() => setDidHighlight(false), 500);
        setDidHighlight(true);
        const path = $container.current.textContent || "";
        highlightNode(path);
    }, [pathInfo, $container, didHighlightTimeout, setDidHighlight]);

    return <div className={style.container}>
        <div className={style["tag-container"]} ref={$container}>
            {tags}
        </div>
        <div className={style["button-container"]}>
            <button disabled={!pathInfo.length} className={[style["icon-button"], didCopy ? style["icon-button--active"] : ""].join(" ")} onClick={doCopy}>
                <CopyIcon />
                <span className={style["icon-tooltip"]}>Copied</span>
            </button>
            <button disabled={!pathInfo.length} className={[style["icon-button"], didHighlight ? style["icon-button--active"] : ""].join(" ")} onClick={doHighlight}>
                <PaintIcon />
                <span className={style["icon-tooltip"]}>Highlighted</span>
            </button>
        </div>
    </div>
};

type PathEntryProps = {
    data: PathEntry,
    editable: boolean,
}
const PathEntryElm = ({ data, editable }: PathEntryProps) => {
    const cName = [
        style["entry"],
        (data as any).type === "window" ? style["entry--window"] : "",
        data.hasInfo === false ? style["entry--no-info"] : "",
        data.text === "*" || data.text === "**" ? style["entry--wildcard"] : ""
    ].join(" ");

    return <span className={cName}>{textFromEntry(data)}</span>;
};

export default PathEditor;