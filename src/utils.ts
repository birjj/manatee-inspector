import type { PathEntry } from "./components/path-editor";
import type { DOMEntry, DOMEntryJava } from "./manatee/types"

export const getNodePath = (node: DOMEntry, rootPath: string = "") => {
    if (!node) { return rootPath; }
    const getPathComponent = (node: DOMEntry) => {
        return (node as DOMEntryJava).accessibleName
            || (node as DOMEntryJava).name
            || (node as DOMEntryJava).simpleType
            || node.type;
    }
    const walkBack = (current: DOMEntry, path: string[] = []): string[] => {
        if (!current.parent) { return path; }
        path.push(getPathComponent(current));
        return walkBack(current.parent, path);
    }

    const path = walkBack(node, []).reverse().join("/");
    if (!path) { return rootPath; }
    return rootPath ? `${rootPath}/${path}` : path;
}

const UNIQUE_TOKENS = ["accessibleName", "tooltip", "name"];
export const getPathAlternatives = (pathInfo: PathEntry[]) => {
    const outp: PathEntry[][] = [[]];

    const getUniqueKeys = (entry: PathEntry) => {
        if ((entry as any).type === "window") { return ["title"]; }
        if (!("uniqueTokens" in entry)) { return []; }
        return UNIQUE_TOKENS.filter(k => (entry as any)[k] && (entry as any).uniqueTokens.indexOf(entry[k]) !== -1);
    };
    const insertWildcard = (list: PathEntry[]) => {
        const last = list[list.length - 1];
        switch (last.text) {
            case "*":
                last.text = "**";
                return;
            case "**":
                return;
            default:
                list.push({ hasInfo: false, text: "*" });
        }
    }

    let allowWildcards = false;
    for (var i = pathInfo.length - 1; i >= 0; --i) {
        const uniqueKeys = getUniqueKeys(pathInfo[i]);
        // always include every token from last unique token and onwards
        if (uniqueKeys.length === 0 && !allowWildcards) {
            outp.forEach(list => list.push(pathInfo[i]));
            continue;
        }
        // if we aren't unique, add in a wildcard to each list
        if (uniqueKeys.length === 0) {
            outp.forEach(list => insertWildcard(list));
            continue;
        }
        // otherwise insert our unique token into each list (and if we aren't the last unique token, add a selector without us in it)
        outp.forEach(list => {
            if (allowWildcards) {
                const newList = list.slice();
                outp.push(newList);
                insertWildcard(newList);
            }
            list.push(pathInfo[i]);
        });
        allowWildcards = allowWildcards || uniqueKeys.length > 0;
    }

    return outp.map(list => list.reverse()).reverse();
};