/** @fileoverview A representation of a JS value (e.g. an object or a string) */

import React from "react";
import treeFactory from "../tree";

import style from "./value-tree.module.css";

type ValueProps = {
  data: any;
  expanded?: boolean;
};

/** Representation of literals (strings, numbers, booleans, null, undefined, ...) */
const LiteralValue = ({ data }: ValueProps) => {
  return (
    <span className={style[`value--${typeof data}`]}>
      {data === undefined ? "undefined" : JSON.stringify(data)}
    </span>
  );
};

const TAGS = {
  object: ["{", "}"] as [string, string],
  array: ["[", "]"] as [string, string],
};
/** Representation of objects (objects, arrays, ...) */
const ObjectValue = treeFactory(
  ({ data, closed }) => {
    const tag = data instanceof Array ? "array" : "object";
    const [open, close] = TAGS[tag];
    const isEmpty = Object.keys(data).length === 0;
    return (
      <span
        className={[style[`value--${tag}`], isEmpty ? style["empty"] : ""].join(
          " "
        )}
      >
        {open}
        {closed || isEmpty ? (isEmpty ? "" : "…") + close : null}
      </span>
    );
  },
  ({ data }) => {
    const tag = data instanceof Array ? "array" : "object";
    const [, close] = TAGS[tag];
    return <span className={style[`value--${tag}`]}>{close}</span>;
  },
  (val: any) =>
    Object.keys(val).map((key) => ({
      Component: ObjectChild,
      data: [key, val[key]] as [string, any],
      key: key,
      props: {},
    }))
);
const ObjectChild = ({ data: [key, value] }: { data: [string, any] }) => {
  return (
    <div>
      <span className={style.key}>{key}</span>: <Value data={value} />
    </div>
  );
};

/** Representation of date instances */
interface DateValueProps extends ValueProps {
  data: Date;
}
const DateValue = ({ data }: DateValueProps) => {
  const dateStr = isNaN(+data) ? "Invalid date" : data.toISOString();
  return (
    <span className={style[`value--date`]}>
      <span className={style["date-tag"]}>Date</span>
      <span className={style["faint"]}>(</span>
      {dateStr}
      <span className={style["faint"]}>)</span>
    </span>
  );
};

/** Representation of function instances */
interface FunctionValueProps extends ValueProps {
  data: { ___type: "function"; value: string };
}
const FunctionValue = ({ data }: FunctionValueProps) => {
  return (
    <span className={style[`value--function`]}>
      <span className={style["function-tag"]}>ƒ </span>
      <pre className={style["function-body"]}>
        {data.value.replace(/^function\s*/, "").replace(/\n+/g, "\n")}
      </pre>
    </span>
  );
};

const Value = ({ data, expanded = true }: ValueProps) => {
  if (data instanceof Date) {
    return <DateValue data={data} />;
  }
  if (data instanceof Object) {
    if (data.___type === "function") {
      return <FunctionValue data={data} />;
    }
    return (
      <ObjectValue
        open={expanded}
        data={data}
        inlineArrow={true}
        className={style["container"]}
      />
    );
  }
  return <LiteralValue data={data} />;
};
export default Value;
