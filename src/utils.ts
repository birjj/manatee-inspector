import type { DOMEntry, DOMEntryJava } from "./manatee/types"

export const getNodePath = (node: DOMEntry, rootPath: string = "") => {
    if (!node) { return rootPath; }
    const getPathComponent = (node: DOMEntry) => {
        return (node as DOMEntryJava).accessibleName
            || (node as DOMEntryJava).name
            || (node as DOMEntryJava).simpleType
            || (node as DOMEntryJava).shellType
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