import React from "react";
import { Link, NavLink } from "react-router-dom";

import { useApplications } from "../../hooks";
import { AppSelector } from "../../pages/LandingPage";
import { HomeIcon, NodeSelectIcon, PlusIcon, SettingsIcon } from "../icons";

import style from "./topbar.module.css";

const Divider = () => <div className={style.divider} />;

export default function Topbar() {
    const { active } = useApplications();

    return <div className={style.bar}>
        <button className={[style.item, style.button].join(" ")} disabled={!active}>
            <NodeSelectIcon />
        </button>
        <Divider />
        <Link to="/settings/" className={style["button"]}>
            <PlusIcon />
        </Link>
        <div className={[style.item, style["text-item"]].join(" ")}>
            Application:
            <AppSelector />
        </div>
        <span className={style.filler} />
        {/*<NavLink to="/" className={style["button"]}>
            <HomeIcon />
        </NavLink>*/}
        <NavLink to="/settings/" className={style["button"]}>
            <SettingsIcon />
        </NavLink>
    </div>
}