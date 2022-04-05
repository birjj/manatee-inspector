/** @fileoverview A generic resizable container */

import React, { MouseEventHandler, useCallback, useRef, useState } from "react";
import { useEventListener } from "../../hooks";

import style from "./resizable.module.css";

type ResizableProps = {
    dir: "LEFT" /* currently only supports left resizing, because that's all we need */
};
const Resizable = ({ dir, children, className, style: styleProp, ...props }: ResizableProps & React.HTMLAttributes<HTMLDivElement>) => {
    const $container = useRef(null as HTMLDivElement | null);
    const onContainer = (ref: HTMLDivElement | null) => {
        $container.current = ref;
        setWidth(ref ? ref.clientWidth : null);
    }

    const [dragging, setDragging] = useState(null as [number, number] | null);
    const [width, setWidth] = useState(null as number | null);
    const [dragWidth, setDragWidth] = useState(null as number | null);

    // callbacks for starting, updating and stopping the drag
    const startDrag: MouseEventHandler = useCallback(e => {
        e.preventDefault();
        const { clientX, clientY } = e;
        setDragging([clientX, clientY]);
        if ($container.current) {
            setDragWidth($container.current.clientWidth);
        }
    }, [$container, setDragging, setWidth]);
    const updateDrag = useCallback((e: MouseEvent) => {
        if (dragging === null) { return; }
        e.preventDefault();
        const { clientX, clientY } = e;
        const [startX, startY] = dragging;

        setWidth(dragWidth! - (clientX - startX));
    }, [dragging, width]);
    const endDrag = useCallback((e: MouseEvent) => {
        if (dragging === null) { return; }
        setDragging(null);
    }, [dragging, setDragging]);

    // attach event listeners to global DOM
    useEventListener("mousemove", updateDrag);
    useEventListener("mouseup", endDrag);

    // return the element with the appropriate size
    const styleObj = Object.assign(
        {},
        styleProp || {},
        {
            width: width === null ? undefined : `${width}px`
        }
    );
    return <div {...props} className={[style.container, className || ""].join(" ")} style={styleObj} ref={onContainer}>
        <span className={[style.border, !!dragging ? style.dragging : ""].join(" ")} onMouseDown={startDrag} />
        {children}
    </div>;
};
export default Resizable;