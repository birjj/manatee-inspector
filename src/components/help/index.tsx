/** @fileoverview A "?" icon which shows help text when clicked */

import React, { useRef, useState } from "react";
import { useOutsideClick } from "../../hooks";
import { HelpIcon } from "../icons";

import style from "./help.module.css";

const Help = ({ children }: React.HTMLAttributes<"div">) => {
    const [isOpen, setOpen] = useState(false);
    const ref = useRef(null);

    useOutsideClick(ref, () => setOpen(false));

    return <span className={style.container} ref={ref}>
        <HelpIcon className={style.icon} onClick={() => setOpen(!isOpen)} />
        {isOpen
            ? <div className={style.tooltip}>
                {children}
            </div>
            : null}
    </span>
};
export default Help;