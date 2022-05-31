import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

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

    const execute = useCallback(() => {
        console.log("Running code", prompt, "in", activeApp?.uuid);
        runCode(activeApp?.uuid || "", prompt);
    }, [activeApp?.uuid, prompt]);

    return <div className={style.wrapper}>
        <Resizable
            direction="vertical"
            children={[
                <ConsoleHistory />,
                <div className={style.prompt}>
                    <Bar className={style["prompt-header"]}>
                        <TextButton onClick={clearHistory}>
                            <ClearIcon style={{ height: "14px" }} />
                        </TextButton>
                        <Filler />
                        <button
                            onClick={execute}
                            disabled={isLoading || !prompt}
                            className={[
                                prompt ? "primary" : "",
                            ].join(" ")}
                        >
                            {isLoading ? <span className={style.loader} /> : null}
                            Run code (<kbd>Shift</kbd>+<kbd>Enter</kbd>)
                        </button>
                    </Bar>
                    <ConsolePrompt execute={execute} />
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

const ConsolePrompt = ({ execute }: { execute: () => void }) => {
    const { prompt, setPrompt } = useConsoleStore(state => ({ runCode: state.runCode, prompt: state.prompt, setPrompt: state.setPrompt }), shallow);
    return <div className={style["prompt-content"]}>
        <div className={style["prompt-input"]}>
            <TextEditor
                value={prompt}
                onChange={setPrompt}
                onSubmit={execute}
            />
        </div>
    </div>;
};

const ConsoleHistory = React.memo(() => {
    const history = useConsoleStore(state => state.history);
    const $history = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const timer = setTimeout(() => {
            if (!$history.current) { return; }
            $history.current.scrollTo({
                top: Infinity,
                behavior: "auto"
            });
        }, 250);
        return () => clearTimeout(timer);
    }, [history]);

    return <div className={style.history} ref={$history}>
        <div className={style["history-list"]}>
            {history.map((entry, i) => <HistoryEntry key={i} entry={entry} />)}
        </div>
    </div>;
});

const HistoryEntry = React.memo(({ entry }: { entry: HistoryEntry }) => {
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