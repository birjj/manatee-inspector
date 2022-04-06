import React, { useEffect, useState } from "react";
import DOMTree from "../components/dom-tree";
import ErrorBoundary from "../components/error-boundary";
import DOMInspector from "../components/inspector";
import Resizable from "../components/resizable";
import { NodeSelectButton } from "../components/topbar";
import { useCurrentDOM } from "../hooks";
import type { DOMEntry } from "../manatee/types";

import style from "./InspectPage.module.css";

const InspectPage = () => {
    const [selected, setSelected] = useState(undefined as DOMEntry | undefined);
    const { dom } = useCurrentDOM();

    useEffect(() => {
        setSelected(dom || undefined);
    }, [dom]);

    return <div className={style.container}>
        <DOMTreeSection selected={selected} onSelect={setSelected} />
        <Resizable dir="LEFT" className={style["inspector-section"]}>
            <DOMInspectorSection data={selected} />
        </Resizable>
    </div>;
};
export default InspectPage;

const DOMTreeSection = ({ selected, onSelect }: { selected: DOMEntry | undefined, onSelect: (v: DOMEntry) => void }) => {
    const { isLoading, error, path, dom } = useCurrentDOM();
    return <div className={[style["tree-section"], dom ? "" : "center"].join(" ")}>
        <ErrorBoundary>
            {dom
                ? <DOMTree data={dom} open selectable selectedValue={selected} onSelect={onSelect} />
                : <div className={style["tree-empty"]}>
                    {isLoading
                        ? <p>Loading...</p>
                        : <p>Pick an element <NodeSelectButton className={style["btn-select"]} showError={false} /> to get started</p>}
                    {error
                        ? <p className={style.error}>{error}</p>
                        : null}
                </div>}
        </ErrorBoundary>
    </div>
};

type DOMInspectorSectionProps = {
    data?: any;
}
const DOMInspectorSection = ({ data }: DOMInspectorSectionProps) => {
    return <ErrorBoundary>
        <DOMInspector data={data} />
    </ErrorBoundary>;
}