/** @fileoverview A representation of a JS value (e.g. an object or a string) */

import React from "react";
import treeFactory from "../tree";

import style from "./value-tree.module.css";

type ValueProps = {
    data: any
};

/** Representation of literals (strings, numbers, booleans, null, undefined, ...) */
const LiteralValue = ({ data }: ValueProps) => {
    return <span className={style[`value--${typeof data}`]}>
        {JSON.stringify(data)}
    </span>;
};

const TAGS = {
    "object": ["{", "}"] as [string, string],
    "array": ["[", "]"] as [string, string]
}
/** Representation of objects (objects, arrays, ...) */
const ObjectValue = treeFactory(
    ({ data, closed }) => {
        const tag = data instanceof Array ? "array" : "object";
        const [open, close] = TAGS[tag];
        const isEmpty = Object.keys(data).length === 0;
        return <span className={[style[`value--${tag}`], isEmpty ? style["empty"] : ""].join(" ")}>
            {open}
            {closed || isEmpty
                ? (isEmpty ? "" : "…") + close
                : null}
        </span>;
    },
    ({ data }) => {
        const tag = data instanceof Array ? "array" : "object";
        const [, close] = TAGS[tag];
        return <span className={style[`value--${tag}`]}>
            {close}
        </span>;
    },
    (val: any) => Object.keys(val).map(key => ({
        Component: ObjectChild,
        data: [key, val[key]] as [string, any],
        key: key,
        props: {}
    }))
);
const ObjectChild = ({ data: [key, value] }: { data: [string, any] }) => {
    return <div>
        <span className={style.key}>{key}</span>: <Value data={value} />
    </div>;
};

const Value = ({ data }: ValueProps) => {
    if (data instanceof Object) {
        return <ObjectValue data={data} inlineArrow={true} className={style["container"]} />
    }
    return <LiteralValue data={data} />
};
export default Value;