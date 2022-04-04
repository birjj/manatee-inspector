import { RefObject, useCallback, useEffect, useState } from "react";
import { createGlobalState } from "react-hooks-global-state";
import { useMatch, useNavigate } from "react-router-dom";
import { runCode, selectNode } from "./manatee";
import type { MonitorTarget } from "./manatee/monitor-socket";

/** Attaches an event listener to window. TODO: extend to support  */
export function useEventListener<K extends keyof WindowEventMap>(event: K, handler: (event: WindowEventMap[K]) => void): void;
export function useEventListener<K extends keyof HTMLElementEventMap, T extends HTMLElement>(event: K, handler: (event: HTMLElementEventMap[K]) => void, element: RefObject<T>): void;
export function useEventListener<KW extends keyof WindowEventMap, KE extends keyof HTMLElementEventMap, T extends HTMLElement | void = void>(event: KW | KE, listener: (event: any) => void, elm?: RefObject<T>) {
    useEffect(() => {
        const target: T | Window = elm?.current || window;
        if (!target) { return; }
        target.addEventListener(event, listener);
        return () => {
            target.removeEventListener(event, listener);
        };
    }, [event, elm, listener]);
}

/** Attaches an event listener for clicks outside of a ref component */
export function useOutsideClick<T extends HTMLElement = HTMLElement>(ref: RefObject<T>, handler: (ev: MouseEvent) => void) {
    useEventListener("mousedown", ev => {
        const $elm = ref?.current;
        if (!$elm || $elm.contains(ev.target as Node)) {
            return;
        }
        handler(ev);
    });
}

/** Stores persistent state in local storage */
export const useLocalStorage = <T,>(key: string, initialValue: T): [T, (val: T) => void] => {
    const getValueFromStorage = useCallback((): T => {
        if (typeof window === "undefined") { return initialValue; }

        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
    }, [initialValue, key]);

    const [storedValue, setStoredValue] = useState<T>(getValueFromStorage);

    const setValue = useCallback((value: T) => {
        setStoredValue(value);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(value));
            window.dispatchEvent(new StorageEvent("storage", { key }));
        }
    }, [key]);

    const handleStorageChange = useCallback(() => {
        setStoredValue(getValueFromStorage())
    }, [getValueFromStorage, setStoredValue]);

    useEventListener("storage", handleStorageChange);

    return [storedValue, setValue];
};

/** Gets/sets the list of stored applications we can send messages to */
export const useApplications = () => {
    const [applications, setApplications] = useLocalStorage<{ uuid: string, name: string }[]>("applications", []);
    const activeKey = useMatch("/app/:appUuid")?.params?.appUuid;
    const navigate = useNavigate();

    return {
        applications,
        addApplication(uuid: string, name: string) {
            if (applications.find(app => app.uuid === uuid)) {
                throw new Error("An app with that UUID already exists");
            }
            setApplications([
                ...applications,
                { uuid, name }
            ]);
        },
        removeApplication(targetUuid: string) {
            const apps = [...applications];
            const i = apps.findIndex(({ uuid }) => uuid === targetUuid);
            if (i === -1) { return; }
            apps.splice(i, 1);
            setApplications(apps);
        },
        active: applications.find(({ uuid }) => uuid === activeKey),
        setActive: (uuid: string) => navigate(`/app/${uuid}`)
    }
};

/** Gets/sets the ports used to communicate with Manatee */
export const usePorts = () => {
    const [ports, setPorts] = useLocalStorage<{ port: number, securePort: number }>("ports", { port: 0, securePort: 0 });

    return {
        port: ports.port,
        securePort: ports.securePort,
        setPorts
    };
};

/** Gets/sets the credentials used to authenticate with Manatee */
export const useCredentials = () => {
    const [encoded, setEncoded] = useLocalStorage<string>("credentials", "");
    let username = "";
    let password = "";
    if (encoded) {
        const decoded = atob(encoded);
        [username, password] = decoded.split(":");
    }

    return {
        username,
        password,
        credentials: encoded,
        setCredentials(username: string, password: string) {
            setEncoded(btoa(`${username}:${password}`));
        }
    }
};

/** SWR-like hook for selecting a DOM using Manatee */
const { useGlobalState: useGlobalDOMState } = createGlobalState({
    isSelecting: false,
    isLoading: false,
    error: null as string | null,
    dom: null as any | null, // TODO: type the returned DOM
    path: null as string | null
});
export const useCurrentDOM = () => {
    const [isSelecting, setIsSelecting] = useGlobalDOMState("isSelecting");
    const [isLoading, setIsLoading] = useGlobalDOMState("isLoading");
    const [error, setError] = useGlobalDOMState("error");
    const [dom, setDOM] = useGlobalDOMState("dom");
    const [path, setPath] = useGlobalDOMState("path");
    const { active: activeApp } = useApplications();

    const doSelect = useCallback(() => {
        if (!activeApp || isSelecting) { return; }
        setIsSelecting(true);
        setIsLoading(false);
        setPath(null);
        setDOM(null);

        // we use an async func to actually communicate with Manatee so we don't have to nest promise callbacks
        (async () => {
            const node = await selectNode(activeApp.uuid);
            setPath(node.Path);
            setIsSelecting(false);
            setIsLoading(true);
            console.log("User selected node", node.Path);
            const inspectOpts = {}; // TODO: allow users to set inspect options
            const code = `JSON.stringify((new Field(${JSON.stringify(node.Path)})).inspect(${JSON.stringify(inspectOpts)}));`;
            const result = await runCode(activeApp.uuid, code);
            console.log("Got resulting DOM");
            try {
                return JSON.parse(result);
            } catch (e) {
                throw "Failed to parse response JSON: " + result;
            }
        })()
            .then(data => setDOM(data))
            .catch(e => setError(e))
            .then(() => setIsLoading(false));
    }, [activeApp, isSelecting, setIsSelecting, setError, setDOM, setPath]);

    return {
        isSelecting,
        isLoading,
        error,
        dom,
        selectNode: doSelect
    };
}