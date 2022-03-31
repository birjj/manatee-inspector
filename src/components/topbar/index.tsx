import React, { useCallback } from "react";
import { NavLink, useLinkClickHandler, useMatch, useNavigate, useParams } from "react-router-dom";

import { useApplications } from "../../hooks";
import { ToolbarButton } from "../button";
import { NodeSelectIcon, PlusIcon } from "../icons";
import { Select } from "../inputs";

import style from "./topbar.module.css";

const AppSelector = () => {
    const { applications, active } = useApplications();
    const navigate = useNavigate();
    const appUuid = useMatch("/app/:appUuid")?.params?.appUuid;

    const selectApp = useCallback((uuid: string) => {
        navigate(uuid ? `/app/${uuid}/` : "");
    }, [navigate]);
    const settingsClick = useLinkClickHandler("/settings/");

    return <>
        <ToolbarButton className={style.item} onClick={settingsClick as any}>
            <PlusIcon />
        </ToolbarButton>
        <div className={[style.item, style["text-item"]].join(" ")}>
            Application:
            <Select style={{ marginLeft: "1ch", minWidth: "16ch" }} value={appUuid || ""} onChange={e => selectApp((e.target as HTMLSelectElement).value)}>
                {appUuid ? null : <option value={""}></option>}
                {applications.map(({ uuid, name }) =>
                    <option key={uuid} value={uuid}>{name}</option>
                )}
            </Select>
        </div>
    </>;
};

const Divider = () => <div className={style.divider} />;

export default function Topbar() {
    const { active } = useApplications();
    return <div className={style.bar}>
        <ToolbarButton className={style.item} disabled={!active}>
            <NodeSelectIcon />
        </ToolbarButton>
        <Divider />
        <AppSelector />
    </div>
}