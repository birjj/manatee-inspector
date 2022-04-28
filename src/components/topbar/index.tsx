/** @fileoverview The top-most bar of the application, containing the element picker amongst other things */

import React, { useCallback } from "react";
import { Link, NavLink, useMatch, useNavigate } from "react-router-dom";

import { AppSelector } from "../../pages/LandingPage";
import { useApplications } from "../../stores/apps";
import { useCurrentDOM } from "../../stores/dom";
import { usePorts } from "../../stores/settings";
import { GitHubIcon, HomeIcon, NodeSelectIcon, PlusIcon, SettingsIcon } from "../icons";

import style from "./topbar.module.css";

const Divider = () => <div className={style.divider} />;

export default function Topbar() {
    const { active } = useApplications();
    const { useCachedUI, setUseCachedUI, collectTexts, setCollectTexts } = useCurrentDOM();
    const navigate = useNavigate();
    const { port, securePort } = usePorts();
    const isSettings = !!useMatch("/settings");

    const onSettingsClick: React.MouseEventHandler<HTMLAnchorElement> = useCallback(e => {
        e.stopPropagation();
        e.preventDefault();
        isSettings ? history.go(-1) : navigate("/settings/")
    }, [isSettings, navigate]);
    const onNavClick: React.MouseEventHandler<HTMLAnchorElement> = useCallback(e => {
        if (!active) { e.preventDefault(); }
    }, [active]);

    return <>
        <div className={style.bar}>
            <NodeSelectButton disabled={!active} />
            <label>
                <input type="checkbox" disabled={!active} checked={useCachedUI} onChange={e => setUseCachedUI(e.target.checked)} />
                useCachedUI
            </label>
            <label>
                <input type="checkbox" disabled={!active} checked={collectTexts} onChange={e => setCollectTexts(e.target.checked)} />
                collectTexts
            </label>
            <Divider />
            <NavLink to={`/app/${active?.uuid}/`} className={[style.item, style["nav-link"], active ? "" : style.disabled].join(" ")} onClick={onNavClick}>Inspect</NavLink>
            <NavLink to={`/app/${active?.uuid}/selector`} className={[style.item, style["nav-link"], active ? "" : style.disabled].join(" ")} onClick={onNavClick}>Selector</NavLink>
            <NavLink to={`/app/${active?.uuid}/console`} className={[style.item, style["nav-link"], active ? "" : style.disabled].join(" ")} onClick={onNavClick}>Console</NavLink>

            <span className={style.filler} />

            <Link to="/settings/" className={style["button"]}>
                <PlusIcon />
            </Link>
            <div className={[style.item, style["text-item"]].join(" ")}>
                Application:
                <AppSelector className={style["app-selector"]} hideUuid />
            </div>
            <Divider />
            <a href="https://github.com/birjolaxew/manatee-inspector" target="_blank" className={style.button}>
                <GitHubIcon />
            </a>
            <Link to="/settings/" onClick={onSettingsClick} className={[style["button"], isSettings ? "active" : ""].join(" ")}>
                <SettingsIcon />
            </Link>
        </div>
        {!port && !securePort
            ? <div className={[style.bar, style["bar--warning"]].join(" ")}>
                No ports for communicating with Manatee were given. The application likely won't work. See the README for instructions.
            </div>
            : null}
    </>
}

type NodeSelectButtonProps = {
    showError?: boolean;
};
export const NodeSelectButton = ({ className, disabled, showError = true, ...props }: NodeSelectButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const { active } = useApplications();
    const { isSelecting, selectNode, error } = useCurrentDOM();

    return <div className={style["button-wrapper"]}>
        <button {...props} className={[
            style.item,
            style.button,
            className,
            isSelecting ? "active" : ""
        ].join(" ")} disabled={disabled || !active} onClick={selectNode}>
            <NodeSelectIcon />
        </button>
        {showError && error
            ? <div className={style.error}>
                {error}
            </div>
            : null}
    </div>;
}