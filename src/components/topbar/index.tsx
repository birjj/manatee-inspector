/** @fileoverview The top-most bar of the application, containing the element picker amongst other things */

import React, { useCallback } from "react";
import { Link, NavLink } from "react-router-dom";

import { AppSelector } from "../../pages/LandingPage";
import useApplications from "../../stores/apps";
import useDOMStore from "../../stores/dom";
import { usePorts } from "../../stores/settings";
import Bar, { Divider, Filler, TextButton } from "../bar";
import { GitHubIcon, HomeIcon, NodeSelectIcon, PlusIcon, SettingsIcon } from "../icons";

import style from "./topbar.module.css";
import barStyle from "../bar/bar.module.css";
import shallow from "zustand/shallow";

export default function Topbar() {
    const activeApp = useApplications(state => state.active);
    const page = useApplications(state => state.page);
    const setPage = useApplications(state => state.setPage);
    const { selectOptions, setSelectOptions } = useDOMStore(state => ({ selectOptions: state.selectOptions, setSelectOptions: state.setSelectOptions }), shallow);
    const { port, securePort } = usePorts();
    const isSettings = page === "settings";

    const onSettingsClick: React.MouseEventHandler<HTMLAnchorElement> = useCallback(e => {
        e.stopPropagation();
        e.preventDefault();
        isSettings ? history.go(-1) : setPage("settings");
    }, [isSettings, setPage]);
    const onNavClick: React.MouseEventHandler<HTMLAnchorElement> = useCallback(e => {
        if (!activeApp) { e.preventDefault(); }
    }, [activeApp]);

    return <>
        <Bar>
            <NodeSelectButton disabled={!activeApp} />
            <label>
                <input type="checkbox" disabled={!activeApp} checked={selectOptions.useCachedUI} onChange={e => setSelectOptions({ useCachedUI: e.target.checked })} />
                useCachedUI
            </label>
            <label>
                <input type="checkbox" disabled={!activeApp} checked={selectOptions.collectTexts} onChange={e => setSelectOptions({ collectTexts: e.target.checked })} />
                collectTexts
            </label>
            <Divider />
            <NavLink to={`/app/${activeApp?.uuid}/inspect/`} className={[style.item, style["nav-link"], activeApp ? "" : style.disabled].join(" ")} onClick={onNavClick}>Inspect</NavLink>
            <NavLink to={`/app/${activeApp?.uuid}/selector/`} className={[style.item, style["nav-link"], activeApp ? "" : style.disabled].join(" ")} onClick={onNavClick}>Selector</NavLink>
            <NavLink to={`/app/${activeApp?.uuid}/console/`} className={[style.item, style["nav-link"], activeApp ? "" : style.disabled].join(" ")} onClick={onNavClick}>Console</NavLink>

            <Filler />

            <Link to={`/app/${activeApp?.uuid}/settings/`} className={barStyle["text-button"]}>
                <PlusIcon />
            </Link>
            <div className={[style.item, style["text-item"]].join(" ")}>
                Application:
                <AppSelector className={style["app-selector"]} hideUuid />
            </div>
            <Divider />
            <a href="https://github.com/birjolaxew/manatee-inspector" target="_blank" className={barStyle["text-button"]}>
                <GitHubIcon />
            </a>
            <Link to="/settings/" onClick={onSettingsClick} className={[barStyle["text-button"], isSettings ? "active" : ""].join(" ")}>
                <SettingsIcon />
            </Link>
        </Bar>
        {!port && !securePort
            ? <Bar warning>
                No ports for communicating with Manatee were given. The application likely won't work. See the README for instructions.
            </Bar>
            : null}
    </>
}

type NodeSelectButtonProps = {
    showError?: boolean;
};
export const NodeSelectButton = ({ className, disabled, showError = true, ...props }: NodeSelectButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const active = useApplications(state => state.active);
    const { isSelecting, selectNode, error, clearError } = useDOMStore(state => ({ isSelecting: state.isSelecting, selectNode: state.select, error: state.error, clearError: state.clearError }), shallow);

    return <div className={style["button-wrapper"]}>
        <TextButton {...props} className={[
            style.item,
            style.button,
            className,
            isSelecting ? "active" : ""
        ].join(" ")} disabled={disabled || !active} onClick={() => selectNode(active?.uuid || "")}>
            <NodeSelectIcon />
        </TextButton>
        {showError && error
            ? <div className={style.error} onClick={clearError}>
                {error}
            </div>
            : null}
    </div>;
}