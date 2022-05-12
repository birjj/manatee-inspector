import React, { useCallback, useEffect, useRef, useState } from "react";

import { ChevronLeft, ClearIcon, ResponseIcon } from "../components/icons";

import style from "./ConsolePage.module.css";
import TextEditor from "../components/text-editor";
import useApplications from "../stores/apps";
import Value from "../components/value";
import Resizable from "../components/resizable";
import useConsoleStore, { HistoryEntry } from "../stores/console";
import shallow from "zustand/shallow";
import Bar, { Filler, TextButton } from "../components/bar";

const ConsolePage = () => {
    const { isLoading, runCode, clearHistory, prompt } = useConsoleStore(state => ({ isLoading: state.isLoading, runCode: state.runCode, clearHistory: state.clearHistory, prompt: state.prompt }), shallow);
    const activeApp = useApplications(state => state.active);

    return <div className={style.wrapper}>
        <Resizable
            direction="vertical"
            children={[
                <div className={style.history}>
                    <ConsoleHistory />
                </div>,
                <div className={style.prompt}>
                    <Bar className={style["prompt-header"]}>
                        <TextButton onClick={clearHistory}>
                            <ClearIcon style={{ height: "14px" }} />
                        </TextButton>
                        <Filler />
                        <button
                            onClick={() => runCode(activeApp?.uuid || "", prompt)}
                            disabled={isLoading || !prompt}
                            className={[
                                prompt ? "primary" : "",
                            ].join(" ")}
                        >
                            {isLoading ? <span className={style.loader} /> : null}
                            Run code (<kbd>Shift</kbd>+<kbd>Enter</kbd>)
                        </button>
                    </Bar>
                    <ConsolePrompt />
                </div>
            ]}
            childClasses={[
                style["history-section"],
                style["prompt-section"]
            ]}
        />
    </div>;
};
export default ConsolePage;

const ConsolePrompt = () => {
    const { prompt, setPrompt, runCode } = useConsoleStore(state => ({ runCode: state.runCode, prompt: state.prompt, setPrompt: state.setPrompt }), shallow);
    const activeApp = useApplications(state => state.active);
    return <div className={style["prompt-content"]}>
        <div className={style["prompt-sidebar"]}>
            <ChevronLeft className={style["prompt-chevron"]} />
        </div>
        <div className={style["prompt-input"]}>
            <TextEditor
                value={prompt}
                onChange={setPrompt}
                onSubmit={() => runCode(activeApp?.uuid || "", prompt)}
            />
        </div>
    </div>;
};

const ConsoleHistory = React.memo(() => {
    const history = useConsoleStore(state => state.history);

    return <div className={style["history-list"]}>
        {history.map((entry, i) => <HistoryEntry key={i} entry={entry} />)}
    </div>;
});

const HistoryEntry = React.memo(({ entry }: { entry: HistoryEntry }) => {
    const [requestExpanded, setRequestExpanded] = useState(false);

    let respValue: any = entry.response;
    if (entry.response === "undefined") {
        respValue = undefined;
    } else {
        try {
            respValue = JSON.parse(entry.response);
        } catch (e) { }
    }

    let $content: React.ReactNode = null;
    if (entry.loading) {
        $content = <span className={style.loader} />;
    } else if (entry.error) {
        $content = <pre>{respValue}</pre>;
    } else {
        $content = <Value data={respValue} expanded />;
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
                {$content}
            </div>
        </div>
    </>
});