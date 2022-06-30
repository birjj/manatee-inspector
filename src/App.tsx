import React, { useEffect, useRef } from "react";

import {
  Routes,
  Route,
  useSearchParams,
  useMatch,
  useNavigate,
  useParams,
} from "react-router-dom";
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
        securePort: +(params.get("manateePortSecure") || 0) || securePort,
      };
      setPorts(newPorts);
      const newParams: { [k: string]: string } = {};
      for (const [k, v] of params) {
        if (k === "manateePort" || k === "manateePortSecure") {
          continue;
        }
        newParams[k] = v;
      }
      setSearchParams(newParams, { replace: true });
    }
  }, [params, setSearchParams, setPorts, port, securePort]);

  return null;
};

/** Responsible for updating state when URI changes, and updating URI when state changes */
const UriParamsInterceptor = () => {
  const uuidMatch = useMatch({ path: "/app/:uuid/", end: false });
  const pathMatch = useMatch({ path: "/app/:uuid/:path" });
  const { uuid } = uuidMatch?.params || {};
  const path = pathMatch?.params?.path || "inspect";
  const navigate = useNavigate();
  const setActiveApp = useAppsStore((state) => state.setActive);
  const activeApp = useAppsStore((state) => state.active);
  const setActivePath = useAppsStore((state) => state.setPage);
  const activePath = useAppsStore((state) => state.page);

  useEffect(() => {
    if (!uuid) {
      return;
    }
    console.log("Setting app to", uuid);
    setActiveApp(uuid);
  }, [uuid, setActiveApp]);
  useEffect(() => {
    console.log("Setting path to", path);
    setActivePath(path as any);
  }, [path, setActivePath]);

  useEffect(() => {
    if (activeApp === undefined) {
      return;
    }
    if (activeApp?.uuid === uuid && path === activePath) {
      return;
    }
    console.log("Navigating to", activeApp?.uuid, activePath);
    navigate(activeApp ? `/app/${activeApp.uuid}/${activePath}/` : "/");
  }, [activeApp?.uuid, activePath]);

  return null;
};

function App() {
  return (
    <>
      <Topbar />
      <SearchParamsInterceptor />
      <UriParamsInterceptor />
      <Routes>
        <Route path="/app/:appUuid/settings" element={<SettingsPage />} />
        <Route path="/app/:appUuid/inspect" element={<InspectPage />} />
        <Route path="/app/:appUuid/selector" element={<SelectorPage />} />
        <Route path="/app/:appUuid/console" element={<ConsolePage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </>
  );
}

export default App;
