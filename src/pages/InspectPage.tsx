import React from "react";
import Resizable from "../components/resizable";
import { NodeSelectButton } from "../components/topbar";

import style from "./InspectPage.module.css";

const InspectPage = () => {
    return <div className={style.container}>
        <DOMTreeSection />
        <Resizable dir="LEFT" className={style["inspector-section"]}>
            <DOMInspectorSection />
        </Resizable>
    </div>;
};
export default InspectPage;

type DOMTreeSectionProps = {
    dom?: any; // TODO: type
};
const DOMTreeSection = ({ dom }: DOMTreeSectionProps) => {
    return <div className={[style["tree-section"], dom ? "" : "center"].join(" ")}>
        {dom
            ? null
            : <div className={style["tree-empty"]}>
                <p>Pick an element <NodeSelectButton className={style["btn-select"]} /> to get started</p>
            </div>}
    </div>
};

type DOMInspectorSectionProps = {
    data?: any;
}
const DOMInspectorSection = ({ data }: DOMInspectorSectionProps) => {
    // TODO: implement
    return <div>

    </div>
}