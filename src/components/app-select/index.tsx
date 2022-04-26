import React, { useRef, useState } from "react";
import { useOutsideClick } from "../../hooks";
import { useApplications } from "../../stores/apps";

import style from "./app-select.module.css";

type AppSelectProps = {
    onChange: (uuid: string) => void,
    value: string,
    disabled?: boolean,
    hideUuid?: boolean
};
const AppSelect = ({ className, onChange, value, disabled = false, hideUuid = false, ...props }: AppSelectProps & Partial<Omit<React.HTMLAttributes<HTMLDivElement>, keyof AppSelectProps>>) => {
    const [_isOpen, setOpen] = useState(false);
    const { applications } = useApplications();
    const $container = useRef(null);

    useOutsideClick($container, () => setOpen(false));
    const doSelect = (uuid: string) => {
        setOpen(false);
        onChange(uuid);
    };

    const selected = applications.find(({ uuid }) => uuid === value);
    const isOpen = _isOpen && !disabled;

    const cName = [
        className || "",
        style.select,
        isOpen ? style.open : ""
    ].join(" ");
    return <div {...props} className={cName} ref={$container}>
        <div onClick={() => setOpen(!isOpen)} className={[style.input, disabled ? style.disabled : ""].join(" ")}>
            <span className={[style.label, !selected ? style.placeholder : ""].join(" ")}>
                {selected ? selected.name : `Select from ${applications.length} apps`}
            </span>
            <span className={style.arrow}>▶</span>
        </div>
        {isOpen
            ? <ol className={style.menu}>
                {applications.map(({ uuid, name }) => <li key={uuid} className={[style.item, uuid === value ? style["item--active"] : ""].join(" ")} onClick={() => doSelect(uuid)}>
                    {name} {hideUuid ? null : <small>{uuid}</small>}
                </li>)}
            </ol>
            : null}
    </div >;
};
export default AppSelect;