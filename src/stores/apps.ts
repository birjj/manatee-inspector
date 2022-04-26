import { useMatch, useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks";

/** Gets/sets the list of stored applications we can send messages to */
export const useApplications = () => {
    const [applications, setApplications] = useLocalStorage<{ uuid: string, name: string }[]>("applications", []);
    const activeKey = useMatch("/app/:appUuid/*")?.params?.appUuid;
    const navigate = useNavigate();

    return {
        applications,
        addApplication(uuid: string, name: string) {
            if (applications.find(app => app.uuid === uuid)) {
                throw new Error("An app with that UUID already exists");
            }
            setApplications([
                ...applications,
                { uuid, name }
            ]);
        },
        removeApplication(targetUuid: string) {
            const apps = [...applications];
            const i = apps.findIndex(({ uuid }) => uuid === targetUuid);
            if (i === -1) { return; }
            apps.splice(i, 1);
            setApplications(apps);
        },
        active: applications.find(({ uuid }) => uuid === activeKey),
        setActive: (uuid: string) => navigate(`/app/${uuid}`)
    }
};