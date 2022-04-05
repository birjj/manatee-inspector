import React, { useEffect, useState } from "react";

import type { DOMEntry } from "../../manatee/types";
import treeFactory, { TreeComponent } from "../tree";
import style from "./dom-tree.module.css";

const ATTRS: (keyof DOMEntry)[] = ["name", "label", "tooltip"];
const Opener = ({ data, closed }: { data: DOMEntry, closed: boolean }) => {
    const [name, setName] = useState("");
    const [attrs, setAttrs] = useState({} as { [k: string]: string });
    const isEmpty = !data.children?.length;

    useEffect(() => {
        setName(data.simpleType || "unknown");
        const newAttrs: typeof attrs = {};
        ATTRS.forEach(key => {
            if (data[key] === "" || data[key] === undefined) { return; }
            newAttrs[key] = "" + data[key];
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
                {">…<"}
                <span className={style.name}>{name}</span>
            </>
            : null}
        {isEmpty ? " />" : ">"}
    </span>;
};

const Closer = ({ data }: { data: DOMEntry }) => {
    const [name, setName] = useState("");
    useEffect(() => {
        setName(data.simpleType || "unknown");
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