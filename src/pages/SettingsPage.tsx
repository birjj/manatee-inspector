import React, { FormEvent, useCallback, useState } from "react";
import Help from "../components/help";
import { TrashIcon } from "../components/icons";
import { useApplications } from "../hooks";

import style from "./SettingsPage.module.css";

const SettingsPage = () => {
    return <div className={style.container}>
        <div className={style.section} id="registered-applications">
            <h2>Registered applications</h2>
            <AppList />
            <AddAppForm />
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

export const AddAppForm = () => {
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
                />
            </label>
            <button>Add</button>
        </form>
        {error ? <div className={style.error}>{error}</div> : null}
    </>;
};