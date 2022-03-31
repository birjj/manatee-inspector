import React, { FormEvent, useCallback, useState } from "react";
import { Button } from "../components/button";
import { TrashIcon } from "../components/icons";
import { Input } from "../components/inputs";
import { useApplications } from "../hooks";

import style from "./SettingsPage.module.css";

const SettingsPage = () => {
    return <div className={style.container}>
        <div className={style.section}>
            <h2>Registered applications</h2>
            <AppList />
            <AddApp />
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

const AddApp = () => {
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
            <h3>Add application:</h3>
            <label style={{ marginRight: "1ch" }}>
                Name:
                <Input
                    type="text"
                    name="name"
                    placeholder="Name"
                    required
                    style={{ marginLeft: "1ch" }}
                    value={name}
                    onChange={e => setName((e.target as HTMLInputElement).value)}
                />
            </label>
            <label style={{ marginRight: "1ch" }}>
                UUID:
                <Input
                    type="text"
                    name="uuid"
                    placeholder="UUID"
                    required
                    style={{ marginLeft: "1ch" }}
                    value={uuid}
                    onChange={e => setUuid((e.target as HTMLInputElement).value)}
                />
            </label>
            <Button>Add</Button>
        </form>
        {error ? <div className={style.error}>{error}</div> : null}
    </>;
};