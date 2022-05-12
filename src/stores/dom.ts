import { useCallback } from "react";
import create from "zustand";
import { runCode, selectNode } from "../manatee";
import useApplications from "./apps";

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

const useDOMStore = create<{
    isSelecting: boolean,
    isLoading: boolean,
    selectOptions: { useCachedUI: boolean, collectTexts: boolean },
    setSelectOptions: (opts: { useCachedUI?: boolean, collectTexts?: boolean }) => void,
    error: string | null,
    dom: DOMEntry | null,
    path: string | null,
    pathInfo: ({ [k: string]: string } & { uniqueTokens: string[] })[],
    reset: () => void,
    select: (app: string) => Promise<void>
}>((set, get) => ({
    isSelecting: false,
    isLoading: false,
    selectOptions: { useCachedUI: false, collectTexts: false },
    setSelectOptions: (opts) => set(state => {
        return {
            selectOptions: { ...state.selectOptions, ...opts }
        };
    }),
    error: null,
    dom: null,
    path: null,
    pathInfo: [],
    reset: () => set({
        isLoading: false,
        isSelecting: false,
        path: null,
        pathInfo: [],
        dom: null,
        error: null
    }),
    select: async (app) => {
        // reset our state first
        set({
            isSelecting: true,
            isLoading: false,
            path: null,
            pathInfo: [],
            dom: null,
            error: null
        });

        try {
            const node = await selectNode(app);
            const path = /^{[^}]+$/.test(node.Path) ? node.Path + "}*" : node.Path;

            set({
                path,
                pathInfo: node.PathInfo,
                isSelecting: false,
                isLoading: true
            });

            const inspectOpts = get().selectOptions;
            const code = `JSON.stringify((new Field(${JSON.stringify(path)})).inspect(${JSON.stringify(inspectOpts)}));`;
            const result = await runCode(app, code);
            let data: DOMEntry;
            try {
                data = JSON.parse(result);
            } catch (e) {
                throw new Error("Failed to parse response JSON: " + result);
            }
            data = decorateDOM(data);
            set({ dom: data });
        } catch (e) {
            console.warn("Error in result", e);
            set({
                error: "" + e,
                dom: null,
                path: null,
                pathInfo: []
            });
        }
        set({
            isLoading: false,
            isSelecting: false
        });
    }
}));
export default useDOMStore;

let oldHighlightPath: string = "";
export const useHighlightNode = () => {
    const { active: activeApp } = useApplications();
    const highlight = useCallback((path: string) => {
        if (!path) {
            console.warn("Attempting to highlight empty path", activeApp?.uuid);
            return;
        }
        let code = `(new Field(${JSON.stringify(path)})).highlightWithColor("red");`;
        if (oldHighlightPath) {
            code = `var lowlightField = new Field(${JSON.stringify(oldHighlightPath)}); if (lowlightField.exists()) { lowlightField.lowlight(); } ${code}`;
        }
        oldHighlightPath = path;
        runCode(activeApp?.uuid || "", code)
            .catch(e => console.warn("Error while highlighting", activeApp?.uuid, path, e));
    }, [activeApp?.uuid]);
    return highlight;
};