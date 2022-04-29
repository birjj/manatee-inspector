import React, { useCallback, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { ChevronLeft, ResponseIcon } from "../components/icons";

import style from "./ConsolePage.module.css";
import TextEditor from "../components/text-editor";
import { runCode } from "../manatee";
import { useApplications } from "../stores/apps";
import { useLocalStorage } from "../hooks";
import Value from "../components/value";

type HistoryEntry = {
    error: boolean,
    request: string,
    response: string
};

const ConsolePage = () => {
    const [history, setHistory] = useLocalStorage<HistoryEntry[]>("console-history", []);
    const [promptCode, setPromptCode] = useLocalStorage("console-prompt", "");
    const [isLoading, setIsLoading] = useState(false);
    const { active } = useApplications();

    const addToHistory = useCallback((message: HistoryEntry) => {
        setHistory([
            ...history,
            message
        ].slice(-100));
    }, [setHistory, history]);

    const submitCode = useCallback(async () => {
        if (isLoading || !promptCode) { return; }
        const code = promptCode;
        setIsLoading(true);
        try {
            const response = await runCode(active?.uuid || "", `JSON.stringify((function(){${promptCode}})())`);
            addToHistory({ error: false, request: code, response });
        } catch (e) {
            addToHistory({ error: true, request: code, response: "" + e });
        }
        setIsLoading(false);
    }, [addToHistory, active, isLoading, promptCode, setIsLoading]);

    return <div className={style.wrapper}>
        <div className={style.history}>
            <div className={style["history-list"]}>
                {history.map((entry, i) => <HistoryEntry key={i} entry={entry} />)}
            </div>
        </div>
        <div className={style.prompt}>
            <div className={style["prompt-sidebar"]}>
                <ChevronLeft className={style["prompt-chevron"]} />
            </div>
            <div className={style["prompt-input"]}>
                <TextEditor
                    value={promptCode}
                    onChange={val => setPromptCode(val)}
                    onSubmit={submitCode}
                />
            </div>
        </div>
        <div className={style.footer}>
            <button
                onClick={submitCode}
                disabled={isLoading || !promptCode}
                className={[
                    style["button-submit"],
                    promptCode ? style["button-submit--active"] : ""
                ].join(" ")}
            >
                {isLoading ? <span className={style.loader} /> : null}
                Run code (<kbd>Shift</kbd>+<kbd>Enter</kbd>)
            </button>
        </div>
    </div>;
};
export default ConsolePage;

const HistoryEntry = ({ entry }: { entry: HistoryEntry }) => {
    const [requestExpanded, setRequestExpanded] = useState(false);

    let respValue: any = entry.response;
    if (entry.response === "undefined") {
        respValue = undefined;
    } else {
        try {
            respValue = JSON.parse(entry.response);
        } catch (e) { }
    }
    return <>
        <div className={[style.entry, style["entry--request"], style["entry--expandable"], requestExpanded ? style["entry--expanded"] : ""].join(" ")}>
            <div className={style["entry__icon"]}>
                <ResponseIcon style={{ transform: "rotate(180deg)" }} />
            </div>
            <div className={style["entry__content"]}>
                <TextEditor value={entry.request} onChange={() => { }} readOnly />
            </div>
            <div className={style["entry__expand-toggler"]} onClick={() => setRequestExpanded(!requestExpanded)} />
        </div>
        <div className={[style.entry, entry.error ? style["entry--error"] : "", style["entry--response"]].join(" ")}>
            <div className={style["entry__icon"]}>
                <ResponseIcon />
            </div>
            <div className={style["entry__content"]}>
                {entry.error
                    ? <pre>{respValue}</pre>
                    : <Value data={respValue} expanded />}
            </div>
        </div>
    </>
}