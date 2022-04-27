/** @fileoverview A generic resizable container */

import React, { MouseEventHandler, RefAttributes, useCallback, useLayoutEffect, useRef, useState } from "react";
import { useEventListener, useSize } from "../../hooks";

import style from "./resizable.module.css";

type ResizableProps = {
    left: React.ReactChild,
    leftClass?: string,
    right: React.ReactChild,
    rightClass?: string
};
const Resizable = ({ left, leftClass, right, rightClass, className, style: styleProp, ...props }: ResizableProps & React.HTMLAttributes<HTMLDivElement>) => {
    const $container = useRef(null as HTMLDivElement | null);
    const $left = useRef(null as HTMLDivElement | null);
    const [leftWidth, setLeftWidth] = useState(null as number | null);
    const $right = useRef(null as HTMLDivElement | null);
    const [rightWidth, setRightWidth] = useState(null as number | null);
    const [dragging, setDragging] = useState(null as [number, number] | null);
    const ownWidth = useSize($container);
    const [leftPercentage, setLeftPercentage] = useState(-1);
    const [dragWidth, setDragWidth] = useState(null as number | null);

    // callbacks for starting, updating and stopping the drag
    const startDrag: MouseEventHandler = useCallback(e => {
        e.preventDefault();
        const { clientX, clientY } = e;
        setDragging([clientX, clientY]);
        if ($left.current) {
            const width = $left.current.clientWidth;
            setDragWidth(width);
            setLeftWidth(width);
            setRightWidth($right.current?.clientWidth || null);
        }
    }, [$left, $right, setDragging, setLeftWidth, setRightWidth]);
    const updateDrag = useCallback((e: MouseEvent) => {
        if (dragging === null) { return; }
        e.preventDefault();
        const { clientX, clientY } = e;
        const [startX, startY] = dragging;

        const newWidth = Math.min(
            (ownWidth?.width || Infinity) - 8,
            Math.max(8, dragWidth! + (clientX - startX))
        );
        setLeftPercentage(ownWidth ? newWidth / ownWidth.width : 0.5);
    }, [dragging, setLeftPercentage, ownWidth]);
    const endDrag = useCallback((e: MouseEvent) => {
        if (dragging === null) { return; }
        setDragging(null);
    }, [dragging, setDragging]);

    // attach event listeners to global DOM
    useEventListener("mousemove", updateDrag);
    useEventListener("mouseup", endDrag);

    // return the element with the appropriate size
    const cName = [
        style.container,
        dragging ? style["container--dragging"] : "",
        className || ""
    ].join(" ");
    return <div {...props} className={cName} style={styleProp} ref={$container}>
        <div className={[style.left, leftClass || ""].join(" ")} ref={$left} style={{ width: leftPercentage !== -1 ? `${leftPercentage * 100}%` : undefined }}>
            <div className={style["reflow-blocker"]} style={{ width: dragging ? `${leftWidth}px` : "" }}>
                {left}
            </div>
        </div>
        <span className={[style.border, !!dragging ? style.dragging : ""].join(" ")} onMouseDown={startDrag} />
        <div className={[style.right, rightClass || ""].join(" ")} ref={$right} style={{ width: leftPercentage !== -1 ? `${(1 - leftPercentage) * 100}%` : undefined }}>
            <div className={style["reflow-blocker"]} style={{ width: dragging ? `${rightWidth}px` : "" }}>
                {right}
            </div>
        </div>
    </div>;
};

export default Resizable;