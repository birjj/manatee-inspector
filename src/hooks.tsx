import { RefObject, useCallback, useEffect, useState } from "react";
import { createGlobalState } from "react-hooks-global-state";
import { useMatch, useNavigate } from "react-router-dom";
import { runCode, selectNode } from "./manatee";
import type { MonitorTarget } from "./manatee/monitor-socket";
import type { DOMEntry } from "./manatee/types";

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

/** Walks through and sets the .parent on the DOM, so we can walk in both directions if we want to */
function decorateDOM(dom: DOMEntry) {
    function addParent(node: DOMEntry, parent?: DOMEntry) {
        if (parent) { node.parent = parent; }
        if (node.children) {
            node.children.forEach(child => addParent(child, node));
        }
    }
    addParent(dom);
    return dom;
}
const { useGlobalState: useGlobalDOMState } = createGlobalState({
    isSelecting: false,
    isLoading: false,
    useCachedUI: false,
    collectTexts: false,
    error: null as string | null,
    dom: null as DOMEntry | null,
    path: null as string | null
});
/** SWR-like hook for selecting a DOM using Manatee */
export const useCurrentDOM = () => {
    const [isSelecting, setIsSelecting] = useGlobalDOMState("isSelecting");
    const [isLoading, setIsLoading] = useGlobalDOMState("isLoading");
    const [useCachedUI, setUseCachedUI] = useGlobalDOMState("useCachedUI");
    const [collectTexts, setCollectTexts] = useGlobalDOMState("collectTexts");
    const [error, setError] = useGlobalDOMState("error");
    const [dom, setDOM] = useGlobalDOMState("dom");
    const [path, setPath] = useGlobalDOMState("path");
    const { active: activeApp } = useApplications();

    const reset = useCallback(() => {
        setIsLoading(false);
        setIsSelecting(false);
        setPath(null);
        setDOM(null);
        setError(null);
    }, [setIsLoading, setIsSelecting, setPath, setDOM, setError]);

    const doSelect = useCallback(() => {
        if (!activeApp || isSelecting) { console.warn("Attempted to select while already selecting", { activeApp, isSelecting }); return; }
        setIsSelecting(true);
        setIsLoading(false);
        setPath(null);
        setDOM(null);
        setError(null);

        // we use an async func to actually communicate with Manatee so we don't have to nest promise callbacks
        (async () => {
            const node = await selectNode(activeApp.uuid);
            const path = /^{[^}]+$/.test(node.Path) ? node.Path + "}*" : node.Path;
            setPath(path);
            setIsSelecting(false);
            setIsLoading(true);
            const inspectOpts = {
                useCachedUI,
                collectTexts
            };
            const code = `JSON.stringify((new Field(${JSON.stringify(path)})).inspect(${JSON.stringify(inspectOpts)}));`;
            const result = await runCode(activeApp.uuid, code);
            try {
                return JSON.parse(result);
            } catch (e) {
                throw "Failed to parse response JSON: " + result;
            }
        })()
            .then((data: DOMEntry) => setDOM(decorateDOM(data)))
            .catch(e => {
                setError(e);
                setDOM(null);
                setPath(null);
            })
            .then(() => {
                setIsLoading(false);
                setIsSelecting(false);
            });
    }, [activeApp, isSelecting, setIsSelecting, setError, setDOM, setPath]);

    return {
        isSelecting,
        isLoading,
        collectTexts,
        setCollectTexts,
        useCachedUI,
        setUseCachedUI,
        error,
        dom,
        path,
        selectNode: doSelect,
        reset
    };
}

let oldHighlightPath: string = "";
export const useHighlightNode = () => {
    const highlight = useCallback((appUuid: string, path: string) => {
        let code = `(new Field(${JSON.stringify(path)})).highlightWithColor("red");`;
        if (oldHighlightPath) {
            code = `var lowlightField = new Field(${JSON.stringify(oldHighlightPath)}); if (lowlightField.exists()) { lowlightField.lowlight(); } ${code}`;
        }
        oldHighlightPath = path;
        runCode(appUuid, code)
            .catch(e => console.warn("Error while highlighting", appUuid, path, e));
    }, []);
    return highlight;
};