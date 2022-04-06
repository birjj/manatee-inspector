/** @fileoverview The top-most bar of the application, containing the element picker amongst other things */

import React, { useCallback } from "react";
import { Link, useMatch, useNavigate } from "react-router-dom";

import { useApplications, useCurrentDOM } from "../../hooks";
import { AppSelector } from "../../pages/LandingPage";
import { GitHubIcon, HomeIcon, NodeSelectIcon, PlusIcon, SettingsIcon } from "../icons";

import style from "./topbar.module.css";

const Divider = () => <div className={style.divider} />;

export default function Topbar() {
    const { active } = useApplications();
    const { useCachedUI, setUseCachedUI, collectTexts, setCollectTexts } = useCurrentDOM();
    const navigate = useNavigate();
    const isSettings = !!useMatch("/settings");

    const onSettingsClick: React.MouseEventHandler<HTMLAnchorElement> = useCallback(e => {
        e.stopPropagation();
        e.preventDefault();
        isSettings ? history.go(-1) : navigate("/settings/")
    }, [isSettings, navigate]);

    return <div className={style.bar}>
        <NodeSelectButton disabled={!active} />
        <label>
            <input type="checkbox" checked={useCachedUI} onChange={e => setUseCachedUI(e.target.checked)} />
            useCachedUI
        </label>
        <label>
            <input type="checkbox" checked={collectTexts} onChange={e => setCollectTexts(e.target.checked)} />
            collectTexts
        </label>
        <Divider />
        <Link to="/settings/" className={style["button"]}>
            <PlusIcon />
        </Link>
        <div className={[style.item, style["text-item"]].join(" ")}>
            Application:
            <AppSelector />
        </div>
        <span className={style.filler} />
        <a href="https://github.com/birjolaxew/manatee-inspector" target="_blank" className={style.button}>
            <GitHubIcon />
        </a>
        <Link to="/settings/" onClick={onSettingsClick} className={[style["button"], isSettings ? "active" : ""].join(" ")}>
            <SettingsIcon />
        </Link>
    </div>
}

type NodeSelectButtonProps = {
    showError?: boolean;
};
export const NodeSelectButton = ({ className, disabled, showError = true, ...props }: NodeSelectButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const { active } = useApplications();
    const { isSelecting, selectNode, error } = useCurrentDOM();

    return <button {...props} className={[
        style.item,
        style.button,
        className,
        isSelecting ? "active" : ""
    ].join(" ")} disabled={disabled || !active} onClick={selectNode}>
        <NodeSelectIcon />
        {showError && error
            ? <div className={style.error}>
                {error}
            </div>
            : null}
    </button>;
}