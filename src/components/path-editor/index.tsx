import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMutationObserver } from "../../hooks";
import { CopyIcon } from "../icons";

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

/** Combines a PathInfo and a written (possibly edited) path into a single PathInfo */
/*function parseEditablePath(path: string, info: PathEntry[]): PathEntry[] {
    const outp: PathEntry[] = [];
    const windowRegex = /^{([^}]+)}/;
    if (windowRegex.test(path)) {
        const windowText = windowRegex.exec(path)![1];
        outp.push({ type: "window", title: windowText });
        path = path.replace(windowRegex, "");
    }

    const entryStrings = path.split("/");
    // try to match up each string with its corresponding PathEntry from the given PathInfo
    let offset = info[0] && (info[0] as any).type === "window" ? 1 : 0;
    for (var i = 0; i < entryStrings.length; ++i) {
        const str = entryStrings[i];
        if (str === "*") {
            outp.push({ text: "*", hasInfo: false });
            continue;
        }
        if (str === "**") {
            outp.push({ text: "**", hasInfo: false });
            const next = entryStrings[i + 1];
            let extraOffset = 0;
            for (var j = i + 1; j + offset < info.length; ++j) {
                const targetInfo = info[j + offset];
                if (!targetInfo) { break; }
                if (Object.values(targetInfo).find(v => v === next)) {
                    extraOffset = j - i;
                    break;
                }
            }
            if (!extraOffset) { extraOffset = entryStrings.length - i; }
            offset += Math.max(0, extraOffset);
            continue;
        }
        outp.push(info[i + offset]
            ? { ...info[i + offset], text: str } as any
            : { text: str, hasInfo: false });
    }
    return outp;
}*/

type PathEditorProps = {
    pathInfo: PathEntry[],
    editable?: boolean,
};
const PathEditor = ({ pathInfo, editable = false }: PathEditorProps) => {
    const $container = useRef(null as HTMLDivElement | null);
    const tags: React.ReactNode[] = [];
    const [didCopy, setDidCopy] = useState(false);
    const didCopyTimeout = useRef(0);

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

    return <div className={style.container}>
        <div className={style["tag-container"]} ref={$container}>
            {tags}
        </div>
        <button disabled={!pathInfo.length} className={[style["copy-button"], didCopy ? style["copy-button--copied"] : ""].join(" ")} onClick={doCopy}>
            <CopyIcon />
        </button>
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