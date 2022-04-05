import React, { useCallback } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import { AppIcon } from "../components/icons";
import { useApplications, useCredentials, useCurrentDOM } from "../hooks";

import style from "./LandingPage.module.css";
import { AddAppForm, CredentialsForm } from "./SettingsPage";

const LandingPage = () => {
    const { username, password } = useCredentials();
    return <div className={style.container}>
        <div>
            <h1><AppIcon className={style.logo} />Manatee DOM Inspector</h1>
            <p>A <em>Chrome devtools</em>-like application to inspect the DOM structure seen by Sirenia Manatee.</p>
            {username && password
                ? <div className={style["app-section"]}>
                    <label style={{ display: "flex" }}>
                        <h3>Select an application:</h3>
                        <AppSelector />
                    </label>
                    or
                    <AddAppForm />
                </div>
                : <>
                    <p>Enter the same credentials as used in Cuesta. These will be used to communicate with the local Manatee instance.</p>
                    <CredentialsForm />
                </>}
        </div>
    </div>;
};
export default LandingPage;

export const AppSelector = ({ className, disabled, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => {
    const { applications } = useApplications();
    const { username, password } = useCredentials();
    const { reset: resetDOM } = useCurrentDOM();
    const navigate = useNavigate();
    const appUuid = useMatch("/app/:appUuid")?.params?.appUuid;

    const selectApp = useCallback((uuid: string) => {
        resetDOM();
        navigate(uuid ? `/app/${uuid}/` : "");
    }, [navigate, resetDOM]);

    const hasCredentials = username && password;
    return <select {...props} disabled={disabled || !hasCredentials} style={{ marginLeft: "1ch", minWidth: "16ch", flexGrow: "1" }} value={appUuid || ""} onChange={e => selectApp((e.target as HTMLSelectElement).value)}>
        <option value={""}></option>
        {applications.map(({ uuid, name }) =>
            <option key={uuid} value={uuid}>{name}</option>
        )}
    </select>
};
