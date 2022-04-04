import React, { FormEvent, useCallback, useState } from "react";
import Help from "../components/help";
import { TrashIcon } from "../components/icons";
import { useApplications, useCredentials, usePorts } from "../hooks";

import style from "./SettingsPage.module.css";

const SettingsPage = () => {
    const { port, securePort } = usePorts();

    return <div className={style.wrapper}>
        <div className={style.container}>
            <div className={style.section} id="credentials">
                <h2>Credentials</h2>
                <p>Credentials used to communicate with the Manatee instance. Must match those used in Cuesta.</p>
                <CredentialsForm />
            </div>
            <div className={style.section} id="registered-applications">
                <h2>Registered applications</h2>
                <AppList />
                <AddAppForm />
            </div>
            <div className={style.section} id="manatee-ports">
                <h2>Manatee ports</h2>
                <p>Ports used to communicate with the Manatee instance:</p>
                <form className={style.row}>
                    <label style={{ marginRight: "5ch" }}><h3>Port:</h3> {port}</label>
                    <label><h3>Secure port:</h3> {securePort}</label>
                </form>
            </div>
        </div>
    </div>;
};
export default SettingsPage;

const AppList = () => {
    const { applications, removeApplication } = useApplications();

    return <table>
        <colgroup>
            <col />
            <col />
            <col width={0} />
        </colgroup>
        <thead>
            <tr>
                <th>Name</th>
                <th>UUID</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {applications.map(({ uuid, name }) =>
                <tr key={uuid}>
                    <td>{name}</td>
                    <td>{uuid}</td>
                    <td className={style["trash-cell"]} onClick={() => removeApplication(uuid)}><TrashIcon /></td>
                </tr>
            )}
        </tbody>
    </table>;
};

export const CredentialsForm = (props: React.HTMLProps<HTMLDivElement>) => {
    const { username, password, setCredentials } = useCredentials();
    const [name, setName] = useState(username);
    const [pass, setPass] = useState(password);
    const [error, setError] = useState("");

    const onSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();
        try {
            setCredentials(name, pass);
        } catch (e) {
            setError((e as Error).message);
            return;
        }
        setError("");
    }, [setCredentials, name, pass]);

    return <div {...props}>
        <form className={style.row} onSubmit={onSubmit}>
            <h3>Credentials:</h3>
            <label style={{ marginRight: "1ch", marginLeft: "1ch" }}>
                Username:
                <input
                    type="text"
                    name="name"
                    placeholder="Username"
                    style={{ marginLeft: "1ch" }}
                    value={name}
                    onChange={e => setName((e.target as HTMLInputElement).value)}
                />
            </label>
            <label style={{ marginRight: "1ch" }}>
                Password:
                <input
                    type="password"
                    name="pass"
                    placeholder="Password"
                    style={{ marginLeft: "1ch" }}
                    value={pass}
                    onChange={e => setPass((e.target as HTMLInputElement).value)}
                />
            </label>
            <button className={username === name && password === pass ? "" : "primary"}>Save</button>
        </form>
        {error ? <div className={style.error}>{error}</div> : null}
    </div>;
};

export const AddAppForm = ({ disabled = false }: { disabled?: boolean }) => {
    const { addApplication } = useApplications();
    const [uuid, setUuid] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const onSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();
        try {
            addApplication(uuid, name);
        } catch (e) {
            setError((e as Error).message);
            return;
        }
        setError("");
        setName("");
        setUuid("");
    }, [addApplication, uuid, name]);

    return <>
        <form className={style.row} onSubmit={onSubmit}>
            <h3>Add application:</h3><Help>Enter the UUID of the application you want to work on, as well as a human-friendly name.<br />The UUID must match the one from Cuesta.</Help>
            <label style={{ marginRight: "1ch", marginLeft: "1ch" }}>
                Name:
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    required
                    style={{ marginLeft: "1ch" }}
                    value={name}
                    onChange={e => setName((e.target as HTMLInputElement).value)}
                    autoComplete="off"
                    disabled={disabled}
                />
            </label>
            <label style={{ marginRight: "1ch" }}>
                UUID:
                <input
                    type="text"
                    name="uuid"
                    placeholder="UUID"
                    required
                    style={{ marginLeft: "1ch" }}
                    value={uuid}
                    onChange={e => setUuid((e.target as HTMLInputElement).value)}
                    autoComplete="off"
                    disabled={disabled}
                />
            </label>
            <button disabled={disabled}>Add</button>
        </form>
        {error ? <div className={style.error}>{error}</div> : null}
    </>;
};