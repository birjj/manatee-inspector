/** @fileoverview The inspector for the current element, displaying its properties */

import React from "react";
import Value from "../value";
import style from "./inspector.module.css";

type DOMInspectorProps = {
    data: { [k: string]: any }
};
const DOMInspector = ({ data: _data }: DOMInspectorProps) => {
    const { children, ...data } = _data;
    return <div className={[style.container, !data ? style["container--empty"] : ""].join(" ")}>
        {data
            ? Object.keys(data).map(key => {
                return <div className={style.prop} key={key}>
                    <span className={style.name}>{key}</span>: <Value expanded data={data[key]} />
                </div>;
            })
            : null}
    </div>;
};
export default DOMInspector;