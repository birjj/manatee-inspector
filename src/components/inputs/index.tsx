import React from "react";

import style from "./inputs.module.css";

export const Select = ({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => {
    return <select {...props} className={[
        style.select,
        className || ""
    ].join(" ")}>
        {children}
    </select>;
};

export const Input = ({ className, children, ...props }: React.HTMLProps<HTMLInputElement>) => {
    return <input {...props} className={[
        style.input,
        className || ""
    ].join(" ")}>
        {children}
    </input>;
}