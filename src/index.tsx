import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";
import * as Manatee from "./manatee";

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root"),
);

(window as any).manatee = Manatee;

if (import.meta.hot) {
    import.meta.hot.accept();
}