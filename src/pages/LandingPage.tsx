import React, { useCallback } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import AppSelect from "../components/app-select";
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

export const AppSelector = (props: Omit<Parameters<typeof AppSelect>[0], "value" | "onChange">) => {
    const { username, password } = useCredentials();
    const { reset: resetDOM } = useCurrentDOM();
    const navigate = useNavigate();
    const appUuid = useMatch("/app/:appUuid")?.params?.appUuid;

    const selectApp = useCallback((uuid: string) => {
        resetDOM();
        navigate(uuid ? `/app/${uuid}/` : "");
    }, [navigate, resetDOM]);

    const hasCredentials = username && password;
    return <AppSelect {...props} disabled={!hasCredentials} value={appUuid || ""} onChange={selectApp} />
};
