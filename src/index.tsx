import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import ErrorBoundary from "./components/error-boundary";
import "./index.css";
import * as Manatee from "./manatee";

ReactDOM.render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>,
    document.getElementById("root"),
);

(window as any).manatee = Manatee;

if (import.meta.hot) {
    import.meta.hot.accept();
}