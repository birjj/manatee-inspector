import React from "react";

import style from "./button.module.css";

type ToolbarButtonProps = {
    active?: boolean
};
export const ToolbarButton = ({ active = false, className, disabled, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & ToolbarButtonProps) => {
    return <button
        {...props}
        className={[
            style["toolbar-btn"],
            active ? style["toolbar-btn--active"] : "",
            className || ""
        ].join(" ")}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
    />
};

export const Button = ({ className, disabled, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    return <button
        {...props}
        className={[
            style.button,
            className || ""
        ].join(" ")}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
    />
}