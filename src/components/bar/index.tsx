import React from "react";

import style from "./bar.module.css";

export const TextButton = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const cName = [
        style["text-button"],
        className || ""
    ].join(" ");
    return <button className={cName} {...props} />
};

export const Divider = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    const cName = [
        style["divider"],
        className || ""
    ].join(" ");
    return <div className={cName} {...props} />
};

export const Filler = () => {
    return <div className={style.filler} />
};

type BarProps = {
    warning?: boolean
};
const Bar = ({ warning, className, children, ...props }: BarProps & React.HTMLAttributes<HTMLDivElement>) => {
    const cName = [
        style.bar,
        warning ? style["bar--warning"] : "",
        className || ""
    ].join(" ");
    return <div className={cName} {...props}>
        {children}
    </div>
};
export default Bar;