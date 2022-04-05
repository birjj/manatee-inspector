import React, { useState } from "react";
import DOMTree from "../components/dom-tree";
import DOMInspector from "../components/inspector";
import Resizable from "../components/resizable";
import { NodeSelectButton } from "../components/topbar";
import { useCurrentDOM } from "../hooks";
import type { DOMEntry } from "../manatee/types";

import style from "./InspectPage.module.css";

const InspectPage = () => {
    const [selected, setSelected] = useState(undefined as DOMEntry | undefined);

    return <div className={style.container}>
        <DOMTreeSection selected={selected} onSelect={setSelected} />
        <Resizable dir="LEFT" className={style["inspector-section"]}>
            <DOMInspectorSection data={selected} />
        </Resizable>
    </div>;
};
export default InspectPage;

const DOMTreeSection = ({ selected, onSelect }: { selected: DOMEntry | undefined, onSelect: (v: DOMEntry) => void }) => {
    const { isLoading, dom } = useCurrentDOM();
    return <div className={[style["tree-section"], dom ? "" : "center"].join(" ")}>
        {dom
            ? <DOMTree data={dom} open selectable selectedValue={selected} onSelect={onSelect} />
            : <div className={style["tree-empty"]}>
                {isLoading
                    ? <p>Loading...</p>
                    : <p>Pick an element <NodeSelectButton className={style["btn-select"]} /> to get started</p>}
            </div>}
    </div>
};

type DOMInspectorSectionProps = {
    data?: any;
}
const DOMInspectorSection = ({ data }: DOMInspectorSectionProps) => {
    // TODO: implement
    return <div>
        <DOMInspector data={data} />
    </div>
}