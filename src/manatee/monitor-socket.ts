/** @fileoverview Used for requesting element data from the locally running instance of Manatee */

type MonitorSocketEvents = {
    message: [any],
    selected: [MonitorTarget],
    offsetselected: [any],
    hover: [MonitorTarget],
    initialized: [],

    open: [],
    close: [number],
    error: [string]
}

export type MonitorTarget = {
    Actions: ("READ" | "CLICK")[],
    AutomationId: null | string,
    ClassName: null | string,
    ControlType: null | string,
    Image: null | string,
    Name: null | string,
    Path: string,
    PathInfo: any[], // TODO: type
    RootIsOrphan: boolean,
    ScreenPlacement: `${number}, ${number}, ${number}, ${number}`,
    WindowPlacement: `${number}, ${number}, ${number}, ${number}`
}
type MonitorMessage =
    | { Event: "SELECTED", Target: MonitorTarget }
    | { Event: "offsetselected" } // TODO: type
    | { Event: "HOVER", Target: MonitorTarget }
    | { Event: "initialized" }
    | { Error: string, ErrorCode: number };

export default class MonitorSocket {
    url: string;
    ws: WebSocket;
    closed = false;
    listeners: { [k in keyof MonitorSocketEvents]?: ((...vals: MonitorSocketEvents[k]) => void)[] } = {};

    constructor(appId: string, port: number, securePort?: number) {
        this.url = `${securePort ? "wss" : "ws"}://localhost.sirenia.io:${securePort || port}/monitor`;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = (() => {
            this.emit("open");
            this.ws.send(JSON.stringify({
                Action: "monitor-start",
                Mode: "byfield",
                ApplicationConfiguration: {
                    Identifier: appId
                }
            }));
        });
        this.ws.onerror = (ev => {
            this.emit("error", "" + ev);
        });
        this.ws.onclose = (ev => {
            this.emit("close", ev.code);
        });
        this.ws.onmessage = this.onMessage.bind(this);
    }

    onMessage(ev: MessageEvent) {
        let data: MonitorMessage;
        try {
            data = JSON.parse(ev.data);
        } catch (e) {
            console.warn("Failed to parse JSON from socket", ev.data);
            return;
        }
        this.emit("message", data);
        if ("Error" in data || "ErrorCode" in data) {
            console.warn("Error from Manatee", data);
            this.emit("error", data.Error || "" + data.ErrorCode);
            return;
        }
        switch (data.Event) {
            case "SELECTED":
                this.emit("selected", data.Target);
                return;
            case "offsetselected":
                this.emit("offsetselected", data);
                return;
            case "HOVER":
                this.emit("hover", data.Target);
                return;
            case "initialized":
                this.emit("initialized");
                return;
        }
    }

    close() {
        this.closed = true;
        this.emit("close", 1000);
        this.ws.close();
    }

    on<T extends keyof MonitorSocketEvents>(ev: T, listener: (...vals: MonitorSocketEvents[T]) => void) {
        if (!this.listeners[ev]) { this.listeners[ev] = []; }
        this.listeners[ev]?.push(listener);
    }
    off<T extends keyof MonitorSocketEvents>(ev: T, listener: (...vals: MonitorSocketEvents[T]) => void) {
        if (!this.listeners[ev]) { return; }
        this.listeners[ev] = this.listeners[ev]!.filter(f => f !== listener) as any;
    }
    emit<T extends keyof MonitorSocketEvents>(ev: T, ...vals: MonitorSocketEvents[T]) {
        this.listeners[ev]?.forEach(listener => listener(...vals));
    }
}