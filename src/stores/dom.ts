import { useCallback } from "react";
import { createGlobalState } from "react-hooks-global-state";
import { runCode, selectNode } from "../manatee";
import { useApplications } from "./apps";

import type { DOMEntry } from "../manatee/types";

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
    path: null as string | null,
    pathInfo: [] as ({ [k: string]: string } & { uniqueTokens: string[] })[]
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
    const [pathInfo, setPathInfo] = useGlobalDOMState("pathInfo");
    const { active: activeApp } = useApplications();

    const reset = useCallback(() => {
        setIsLoading(false);
        setIsSelecting(false);
        setPath(null);
        setPathInfo([]);
        setDOM(null);
        setError(null);
    }, [setIsLoading, setIsSelecting, setPath, setDOM, setError]);

    const doSelect = useCallback(() => {
        if (!activeApp || isSelecting) { console.warn("Attempted to select while already selecting", { activeApp, isSelecting }); return; }
        setIsSelecting(true);
        setIsLoading(false);
        setPath(null);
        setPathInfo([]);
        setDOM(null);
        setError(null);

        // we use an async func to actually communicate with Manatee so we don't have to nest promise callbacks
        (async () => {
            const node = await selectNode(activeApp.uuid);
            const path = /^{[^}]+$/.test(node.Path) ? node.Path + "}*" : node.Path;
            setPath(path);
            setPathInfo(node.PathInfo);
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
                setPathInfo([]);
            })
            .then(() => {
                setIsLoading(false);
                setIsSelecting(false);
            });
    }, [activeApp, isSelecting, setIsSelecting, setError, setDOM, setPath, setPathInfo, useCachedUI, collectTexts]);

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
        pathInfo,
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