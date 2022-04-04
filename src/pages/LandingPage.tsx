import React, { useCallback } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import { AppIcon } from "../components/icons";
import { useApplications } from "../hooks";

import style from "./LandingPage.module.css";
import { AddAppForm } from "./SettingsPage";

const LandingPage = () => {
    return <div className={style.container}>
        <div>
            <h1><AppIcon className={style.logo} />Manatee DOM Inspector</h1>
            <p>A <em>Chrome devtools</em>-like application to inspect the DOM structure seen by Sirenia Manatee.</p>
            <label style={{ display: "flex" }}>
                <h3>Select an application:</h3>
                <AppSelector />
            </label>
            or
            <AddAppForm />
        </div>
    </div>;
};
export default LandingPage;

export const AppSelector = ({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => {
    const { applications, active } = useApplications();
    const navigate = useNavigate();
    const appUuid = useMatch("/app/:appUuid")?.params?.appUuid;

    const selectApp = useCallback((uuid: string) => {
        navigate(uuid ? `/app/${uuid}/` : "");
    }, [navigate]);

    return <select {...props} style={{ marginLeft: "1ch", minWidth: "16ch", flexGrow: "1" }} value={appUuid || ""} onChange={e => selectApp((e.target as HTMLSelectElement).value)}>
        <option value={""}></option>
        {applications.map(({ uuid, name }) =>
            <option key={uuid} value={uuid}>{name}</option>
        )}
    </select>
};
