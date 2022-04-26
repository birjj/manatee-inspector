/** @fileoverview The inspector for the current element, displaying its properties */

import React, { useEffect, useRef } from "react";
import type { DOMEntry } from "../../manatee/types";
import { useCurrentDOM } from "../../stores/dom";
import { getNodePath } from "../../utils";
import Value from "../value";
import style from "./inspector.module.css";

type DOMInspectorProps = {
    data: { [k: string]: any }
};
const DOMInspector = ({ data: _data }: DOMInspectorProps) => {
    const { path } = useCurrentDOM();
    const { children, parent, ...data } = _data || {};
    const $path = useRef(null as HTMLInputElement | null);

    const nodePath = getNodePath(_data as DOMEntry, path || "");
    useEffect(() => {
        if ($path.current) {
            $path.current.scrollLeft = 99999;
        }
    }, [$path, nodePath]);

    return <div className={[style.container, !data ? style["container--empty"] : ""].join(" ")}>
        {data
            ? <>
                <div className={["bar", "bar--text", style["selector-bar"]].join(" ")}>
                    <input className={style.selector} type="text" disabled value={nodePath} ref={$path} />
                </div>
                <div className={style.content}>
                    {Object.keys(data).map(key => {
                        return <div className={style.prop} key={key}>
                            <span className={style.name}>{key}</span>: <Value expanded data={data[key]} />
                        </div>;
                    })}
                </div>
            </>
            : null}
    </div>;
};
export default DOMInspector;