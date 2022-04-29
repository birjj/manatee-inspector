/** @fileoverview A generic resizable container */

import React, { MouseEventHandler, RefAttributes, useCallback, useLayoutEffect, useRef, useState } from "react";
import { useEventListener, useSize } from "../../hooks";

import style from "./resizable.module.css";

type ResizableProps = {
    direction?: "horizontal" | "vertical",
    children: [React.ReactChild, React.ReactChild],
    childClasses?: [string, string],
};
const Resizable = ({ direction = "horizontal", children, childClasses, className, style: styleProp, ...props }: ResizableProps & Omit<React.HTMLAttributes<HTMLDivElement>, "children">) => {
    const $container = useRef(null as HTMLDivElement | null);
    const ownSize = useSize($container);
    const [startSize, setStartSize] = useState(null as number | null);
    const [startPosition, setStartPosition] = useState(null as number | null);

    const [aClass, bClass] = childClasses || [];
    const $a = useRef(null as HTMLDivElement | null);
    const $b = useRef(null as HTMLDivElement | null);
    const [aSize, setASize] = useState(null as number | null);
    const [bSize, setBSize] = useState(null as number | null);
    const [sizePercentage, setSizePercentage] = useState(null as number | null);

    const widthHeight = direction === "horizontal" ? "width" : "height";
    const clientWidthHeight = direction === "horizontal" ? "clientWidth" : "clientHeight";
    const clientXY = direction === "horizontal" ? "clientX" : "clientY";

    // callbacks for starting, updating and stopping the drag
    const startDrag: MouseEventHandler = useCallback(e => {
        e.preventDefault();
        setStartPosition(e[clientXY]);
        if ($a.current) {
            const size = $a.current[clientWidthHeight];
            setStartSize(size);
            setASize(size);
            setBSize($b.current?.[clientWidthHeight] || null);
        }
    }, [direction, $a, $b, clientXY, clientWidthHeight, setStartSize, setStartPosition, setASize, setBSize]);
    const updateDrag = useCallback((e: MouseEvent) => {
        if (startPosition === null) { return; }
        e.preventDefault();
        const newPosition = e[clientXY];
        let newSize = startSize! + (newPosition - startPosition);
        newSize = Math.min(
            (ownSize?.[widthHeight] || Infinity) - 8,
            Math.max(8, newSize)
        );
        setSizePercentage(
            ownSize
                ? newSize / ownSize[widthHeight]
                : 0.5
        );
    }, [direction, startPosition, startSize, ownSize, clientXY, widthHeight, setSizePercentage]);
    const endDrag = useCallback((e: MouseEvent) => {
        if (startPosition === null) { return; }
        setStartPosition(null);
        setStartSize(null);
    }, [startPosition, setStartPosition, setStartSize]);

    // attach event listeners to global DOM
    useEventListener("mousemove", updateDrag);
    useEventListener("mouseup", endDrag);

    // return the element with the appropriate size
    const isDragging = startPosition !== null;
    const cName = [
        style.container,
        style[`container--${direction}`],
        isDragging ? style["container--dragging"] : "",
        className || ""
    ].join(" ");
    return <div {...props} className={cName} style={styleProp} ref={$container}>
        <div className={[style.left, aClass || ""].join(" ")} ref={$a} style={{ [widthHeight]: sizePercentage !== null ? `${sizePercentage * 100}%` : undefined }}>
            <div className={style["reflow-blocker"]} style={{ [widthHeight]: isDragging ? `${aSize}px` : "" }}>
                {children[0]}
            </div>
        </div>
        <span className={[style.border, isDragging ? style.dragging : ""].join(" ")} onMouseDown={startDrag} />
        <div className={[style.right, bClass || ""].join(" ")} ref={$b} style={{ [widthHeight]: sizePercentage !== null ? `${(1 - sizePercentage) * 100}%` : undefined }}>
            <div className={style["reflow-blocker"]} style={{ [widthHeight]: isDragging ? `${bSize}px` : "" }}>
                {children[1]}
            </div>
        </div>
    </div>;
};

export default Resizable;