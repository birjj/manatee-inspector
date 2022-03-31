import React from "react";

import { Routes, Route } from "react-router-dom";
import Topbar from "./components/topbar";
import SettingsPage from "./pages/SettingsPage";

function App() {
    return <>
        <Topbar />
        <Routes>
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/app/:appUuid" element={<>Test</>} />
            <Route path="*" element={<SettingsPage />} />
        </Routes>
    </>
}

export default App;