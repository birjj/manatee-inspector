import DebugSocket from "./debug-socket";
import MonitorSocket, { MonitorTarget } from "./monitor-socket";

const getPorts = () => {
    const portsStr = window.localStorage.getItem("ports");
    let ports: { port: number, securePort: number };
    try {
        ports = JSON.parse(portsStr || "");
    } catch (e) {
        throw new Error("Failed to parse ports: " + portsStr);
    }
    return ports;
};

export const selectNode = (appId: string): Promise<MonitorTarget> => {
    const { port, securePort } = getPorts();

    return new Promise((res, rej) => {
        const socket = new MonitorSocket(appId, port, securePort);
        socket.on("selected", target => {
            res(target);
            socket.close();
        });
        socket.on("error", err => {
            rej(err);
        });
        socket.on("close", () => {
            rej();
        });
    });
};

export const runCode = (appId: string, code: string): Promise<string> => {
    const { port, securePort } = getPorts();
    let credentials = window.localStorage.getItem("credentials") || "";
    if (credentials) {
        credentials = JSON.parse(credentials);
    }

    return new Promise((res, rej) => {
        const socket = new DebugSocket(appId, code, credentials, port, securePort);
        socket.on("finished", (result) => {
            if ("result" in result) {
                res(result.result.Value);
            } else {
                rej(result.error.Value);
            }
            socket.close();
        });
        socket.on("error", err => {
            rej(err);
        });
        socket.on("close", () => {
            rej();
        });
    });
};