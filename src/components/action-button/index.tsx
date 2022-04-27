import React, { useCallback, useRef, useState } from "react";

import style from "./action-button.module.css";

type ActionButtonProps = {
    action: (() => Promise<any>) | (() => void),
    timeout?: number,
    activeText: React.ReactNode,
    tooltip?: React.ReactNode,
    onClick?: () => boolean,
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;
const ActionButton = ({ action, timeout = 1000, activeText, tooltip, className, children, onClick, disabled, ...props }: ActionButtonProps) => {
    const [isActive, setIsActive] = useState(false);
    const activeTimeout = useRef(0);

    const doAction = useCallback(() => {
        if (disabled) { return; }
        if (onClick) {
            if (onClick() === false) {
                return;
            }
        }

        clearTimeout(activeTimeout.current);
        const trigger = () => {
            setIsActive(true);
            activeTimeout.current = setTimeout(() => setIsActive(false), timeout);
        };
        const result = action();
        if (result instanceof Promise) {
            result.then(() => {
                setIsActive(true);
                trigger();
            });
        } else {
            trigger();
        }
    }, [onClick, action, activeTimeout, setIsActive, disabled, timeout]);

    const cName = [
        style.button,
        isActive ? style["button--active"] : "",
        className || ""
    ].join(" ");

    return <button {...props} disabled={disabled} className={cName} onClick={doAction}>
        <span className={style.tooltip}>{tooltip}</span>
        <span className={style["tooltip--active"]}>{activeText}</span>
        {children}
    </button>
};
export default ActionButton;