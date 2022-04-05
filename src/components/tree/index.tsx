/** @fileoverview A generator for tree-structured components (e.g. DOM tree, expandable JS objects, ...) */
import React, { MouseEventHandler, useCallback, useEffect, useState } from "react";

import style from "./tree.module.css";

/** Props for the opener element, responsible for rendering the opening tag (or the tag for the element when it is closed) */
type TreeOpenerProps<T> = {
    data: T,
    closed: boolean
};
/** Props for the closer element, responsible for rendering the closing tag */
type TreeCloserProps<T> = {
    data: T
};
/** Type of the child categorizer, which generates children from a data object */
type TreeChildCategorizer<T, F> = (data: T) => {
    Component: React.ComponentType<TreeProps<T> & F>,
    data: T,
    props: F,
    key: string
}[];

enum TreeSelectState {
    None,
    Opener,
    Closer
}

/** Props for the tree itself */
export type TreeProps<T> = {
    data: T,
    open?: boolean,
    selectable?: boolean,
    selectedValue?: T,
    inlineArrow?: boolean,
    onSelect?: (value: T) => void
} & Omit<React.HTMLProps<HTMLDivElement>, "data" | "selected" | "onSelect">;
export type TreeComponent<T> = React.ComponentType<TreeProps<T>>;

/**
 * Generates a tree component from an opener element, a closer element and a way to map children to element types.
 * The opener is responsible for rendering the tree when closed (and will be told that it is closed using the `closed` prop)
 **/
const treeFactory = <DataType, ChildProps>(Opener: React.ComponentType<TreeOpenerProps<DataType>>, Closer: React.ComponentType<TreeCloserProps<DataType>>, categorizer: TreeChildCategorizer<DataType, ChildProps>) => {
    const Tree = ({ data, open = false, selectable = false, selectedValue, inlineArrow = false, onSelect, ...props }: TreeProps<DataType>) => {
        const [isOpen, setOpen] = useState(open);
        const [selected, setSelected] = useState(TreeSelectState.None);
        const [childData, setChildData] = useState([] as ReturnType<typeof categorizer>);
        const isSelected = selectedValue && selectedValue === data;

        useEffect(() => {
            setOpen(open);
        }, [open]);
        useEffect(() => {
            setChildData(categorizer(data));
        }, [data]);

        const doSelect = useCallback((state: TreeSelectState) => {
            setSelected(state);
            if (onSelect) {
                onSelect(data);
            }
        }, [data, onSelect, setSelected]);
        const toggleOpen: MouseEventHandler<HTMLSpanElement> = useCallback(e => {
            e.stopPropagation();
            setOpen(!isOpen);
        }, [setOpen, isOpen]);

        const className = [
            props.className || "",
            style.tree,
            selectable ? style.selectable : "",
            selected ? style.selected : "",
            isOpen && childData.length ? style.expanded : "",
            inlineArrow ? style["tree--inline-arrow"] : ""
        ].join(" ");
        return <div {...props} className={className}>
            <div className={[style.line, style["line--opener"], isSelected && (selected === TreeSelectState.Opener || !isOpen) ? style.selected : ""].join(" ")} onClick={e => { e.stopPropagation(); doSelect(TreeSelectState.Opener); }}>
                {childData.length
                    ? <span className={style.arrow} onClick={toggleOpen}>▶</span>
                    : null}
                <Opener data={data} closed={!isOpen} />
                <span className={style.hover}></span>
            </div>
            {isOpen && childData.length
                ? <>
                    <div className={[style.line, style["line--children"]].join(" ")}>
                        {childData.map(({ Component, data, props, key }) => {
                            return <Component
                                key={key}
                                data={data}
                                open={open}
                                selectable={selectable}
                                selectedValue={selectedValue}
                                onSelect={onSelect}
                                {...props}
                            />
                        })}
                    </div>
                    <div className={[style.line, style["line--closer"], isSelected && selected === TreeSelectState.Closer ? style.selected : ""].join(" ")} onClick={e => { e.stopPropagation(); doSelect(TreeSelectState.Closer); }}>
                        <Closer data={data} />
                        <span className={style.hover}></span>
                    </div>
                </>
                : null}
        </div>;
    };
    return Tree;
};
export default treeFactory;