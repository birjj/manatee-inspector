import React, { useEffect, useRef } from "react";

import { Routes, Route, useSearchParams, useMatch, useNavigate, useParams } from "react-router-dom";
import Topbar from "./components/topbar";
import ConsolePage from "./pages/ConsolePage";
import InspectPage from "./pages/InspectPage";
import LandingPage from "./pages/LandingPage";
import SelectorPage from "./pages/SelectorPage";
import SettingsPage from "./pages/SettingsPage";
import useAppsStore from "./stores/apps";
import { usePorts } from "./stores/settings";

const SearchParamsInterceptor = () => {
    const [params, setSearchParams] = useSearchParams();
    const { port, securePort, setPorts } = usePorts();
    useEffect(() => {
        if (params.get("manateePort") || params.get("manateePortSecure")) {
            const newPorts = {
                port: +(params.get("manateePort") || 0) || port,
                securePort: +(params.get("manateePortSecure") || 0) || securePort
            };
            setPorts(newPorts);
            const newParams: { [k: string]: string } = {};
            for (const [k, v] of params) {
                if (k === "manateePort" || k === "manateePortSecure") { continue; }
                newParams[k] = v;
            }
            setSearchParams(newParams, { replace: true });
        }
    }, [params, setSearchParams, setPorts, port, securePort]);

    return null;
};

/** Responsible for updating state when URI changes, and updating URI when state changes */
const UriParamsInterceptor = () => {
    const uriMatch = useMatch({ path: "/app/:uuid/", end: false });
    const { uuid } = uriMatch?.params || {};
    const navigate = useNavigate();
    const setActiveApp = useAppsStore(state => state.setActive);
    const activeApp = useAppsStore(state => state.active);

    useEffect(() => {
        if (!uuid) { return; }
        setActiveApp(uuid);
    }, [uuid, setActiveApp]);

    useEffect(() => {
        if (activeApp === undefined) { return; }
        if (activeApp?.uuid === uuid) { return; }
        navigate(activeApp ?
            `/app/${activeApp.uuid}/`
            : "/");
    }, [activeApp?.uuid]);

    return null;
};

function App() {
    return <>
        <Topbar />
        <SearchParamsInterceptor />
        <UriParamsInterceptor />
        <Routes>
            <Route path="/settings/" element={<SettingsPage />} />
            <Route path="/app/:appUuid" element={<InspectPage />} />
            <Route path="/app/:appUuid/selector" element={<SelectorPage />} />
            <Route path="/app/:appUuid/console" element={<ConsolePage />} />
            <Route path="*" element={<LandingPage />} />
        </Routes>
    </>
}

export default App;