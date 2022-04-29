/** @fileoverview Used for running flows in the locally running instance of Manatee */

type DebugSocketEvents = {
    message: [any],
    finished: [DebugResult],

    open: [],
    close: [number],
    error: [string]
}
type DebugResult =
    | {
        result: {
            Value: string,
            Order: number
        }
    }
    | {
        error: {
            Order: number,
            Value: string
        },
        retry: {
            Order: number,
            Value: "false" | "true"
        }
    }
    | { [k: string]: { Value: any, Order: number } };
type DebugMessage =
    | { Action: "finished", Decision: "accept" | "decline", Reason: string, Result: DebugResult }
    | { Error: any, ErrorCode: number };

export default class DebugSocket {
    url: string;
    ws: WebSocket;
    closed = false;
    listeners: { [k in keyof DebugSocketEvents]?: ((...vals: DebugSocketEvents[k]) => void)[] } = {};

    constructor(appId: string, code: string, credentials: string, port: number, securePort?: number) {
        this.url = `${securePort ? "wss" : "ws"}://localhost.sirenia.io:${securePort || port}/flowtracer`;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = (() => {
            this.emit("open");
            this.ws.send(JSON.stringify({
                Authentication: credentials,
                Action: "run",
                Flow: {
                    Identifier: "one-off-flow",
                    Name: undefined,
                    Descriptive: {
                        id: "one-off-flow",
                        code,
                        application: appId,
                    }
                },
                Inputs: {},
                DelayMs: 0,
                NoTracerContext: true
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
        let data: DebugMessage;
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

        switch (data.Action) {
            case "finished":
                if (data.Decision === "decline") {
                    return this.emit("error", data.Reason || "Code declined by Manatee");
                }
                this.emit("finished", data.Result);
                return;
        }
    }

    close() {
        this.closed = true;
        this.emit("close", 1000);
        this.ws.close();
    }

    on<T extends keyof DebugSocketEvents>(ev: T, listener: (...vals: DebugSocketEvents[T]) => void) {
        if (!this.listeners[ev]) { this.listeners[ev] = []; }
        this.listeners[ev]?.push(listener);
    }
    off<T extends keyof DebugSocketEvents>(ev: T, listener: (...vals: DebugSocketEvents[T]) => void) {
        if (!this.listeners[ev]) { return; }
        this.listeners[ev] = this.listeners[ev]!.filter(f => f !== listener) as any;
    }
    emit<T extends keyof DebugSocketEvents>(ev: T, ...vals: DebugSocketEvents[T]) {
        this.listeners[ev]?.forEach(listener => listener(...vals));
    }
}