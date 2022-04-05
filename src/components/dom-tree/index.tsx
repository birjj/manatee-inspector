/** @fileoverview A component for rendering the DOM structure returned by Manatee as a tree */

import React, { useEffect, useState } from "react";

import type { DOMEntry, DOMEntryJava, DOMEntryWeb } from "../../manatee/types";
import treeFactory, { TreeComponent } from "../tree";
import style from "./dom-tree.module.css";

const getName = (data: DOMEntry) => (data as DOMEntryJava).simpleType || data.type || "unknown";

const ATTRS: (keyof DOMEntryJava | keyof DOMEntryWeb)[] = ["name", "label", "tooltip", "_title", "_class", "_aria-label"];
const Opener = ({ data, closed }: { data: DOMEntry, closed: boolean }) => {
    const [name, setName] = useState("");
    const [attrs, setAttrs] = useState({} as { [k: string]: string });
    const isEmpty = !data.children?.length;

    useEffect(() => {
        setName(getName(data));
        const newAttrs: typeof attrs = {};
        ATTRS.forEach(key => {
            if ((data as any)[key] === "" || (data as any)[key] === undefined) { return; }
            newAttrs[key] = "" + (data as any)[key];
        });
        setAttrs(newAttrs);
    }, [data]);

    return <span className={style.tag}>
        {"<"}
        <span className={style.name}>{name}</span>
        {Object.keys(attrs).map(key => {
            return <span key={key} className={style.attr}>
                <span className={style["attr__name"]}>{key}</span>
                ="
                <span className={style["attr__val"]}>{attrs[key]}</span>
                "
            </span>
        })}
        {closed && !isEmpty
            ? <>
                {">…</"}
                <span className={style.name}>{name}</span>
            </>
            : null}
        {isEmpty ? " />" : ">"}
    </span>;
};

const Closer = ({ data }: { data: DOMEntry }) => {
    const [name, setName] = useState("");
    useEffect(() => {
        setName(getName(data));
    }, [data]);
    return <span className={style.tag}>
        {"</"}
        <span className={style.name}>{name}</span>
        {">"}
    </span>;
};

const DOMTree: TreeComponent<DOMEntry> = treeFactory(Opener, Closer, (data: DOMEntry) => {
    return (data.children || []).map((entry, i) => ({
        Component: DOMTree,
        data: entry,
        key: "" + i,
        props: {}
    }));
});
export default DOMTree;