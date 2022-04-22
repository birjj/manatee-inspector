import React, { useEffect, useState } from "react";
import DOMTree from "../components/dom-tree";
import ErrorBoundary from "../components/error-boundary";
import DOMInspector from "../components/inspector";
import Resizable from "../components/resizable";
import { NodeSelectButton } from "../components/topbar";
import { useApplications, useCurrentDOM, useHighlightNode } from "../hooks";
import type { DOMEntry } from "../manatee/types";
import { getNodePath } from "../utils";

import style from "./InspectPage.module.css";

const InspectPage = () => {
    const [selected, setSelected] = useState(undefined as DOMEntry | undefined);
    const { active } = useApplications();
    const { dom, path } = useCurrentDOM();
    const highlightNode = useHighlightNode();

    useEffect(() => {
        setSelected(dom || undefined);
    }, [dom]);
    const updateSelected = (val?: DOMEntry) => {
        if (val && active) {
            const nodePath = getNodePath(val, path || "");
            highlightNode(active?.uuid, nodePath);
        }
        setSelected(val);
    };

    return <div className={style.container}>
        <Resizable
            left={<DOMTreeSection selected={selected} onSelect={updateSelected} />}
            leftClass={style.grow}
            right={<DOMInspectorSection data={selected} />}
            rightClass={style["inspector-section"]}
        />
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
                        ? <div>Loading...</div>
                        : <div>Pick an element <NodeSelectButton className={style["btn-select"]} showError={false} /> to get started</div>}
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