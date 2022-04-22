import React, { useEffect } from "react";

import { Routes, Route, useSearchParams } from "react-router-dom";
import Topbar from "./components/topbar";
import { usePorts } from "./hooks";
import InspectPage from "./pages/InspectPage";
import LandingPage from "./pages/LandingPage";
import SelectorPage from "./pages/SelectorPage";
import SettingsPage from "./pages/SettingsPage";

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

function App() {
    return <>
        <Topbar />
        <SearchParamsInterceptor />
        <Routes>
            <Route path="/settings/" element={<SettingsPage />} />
            <Route path="/app/:appUuid" element={<InspectPage />} />
            <Route path="/app/:appUuid/selector" element={<SelectorPage />} />
            <Route path="*" element={<LandingPage />} />
        </Routes>
    </>
}

export default App;