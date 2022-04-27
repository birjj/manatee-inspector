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

export const runCode = (appId: string, code: string, timeout = 30000): Promise<string> => {
    const { port, securePort } = getPorts();
    let credentials = window.localStorage.getItem("credentials") || "";
    if (credentials) {
        credentials = JSON.parse(credentials);
    }

    return new Promise((res, rej) => {
        let finished = false;
        const socket = new DebugSocket(appId, code, credentials, port, securePort);
        socket.on("finished", (result) => {
            finished = true;
            if ("result" in result) {
                res(result.result.Value);
            } else {
                rej(result.error.Value);
            }
            socket.close();
        });
        socket.on("error", err => {
            finished = true;
            rej(err);
        });
        socket.on("close", () => {
            finished = true;
            rej();
        });

        setTimeout(() => {
            if (!finished) {
                finished = true;
                rej(`Timeout of ${(timeout / 1000).toFixed(2)}s for running code expired`);
            }
        }, timeout);
    });
};