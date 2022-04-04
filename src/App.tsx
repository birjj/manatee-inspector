import React from "react";

import { Routes, Route } from "react-router-dom";
import Topbar from "./components/topbar";
import InspectPage from "./pages/InspectPage";
import LandingPage from "./pages/LandingPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
    return <>
        <Topbar />
        <Routes>
            <Route path="/settings/" element={<SettingsPage />} />
            <Route path="/app/:appUuid" element={<InspectPage />} />
            <Route path="*" element={<LandingPage />} />
        </Routes>
    </>
}

export default App;