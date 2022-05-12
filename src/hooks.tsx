import useResizeObserver from "@react-hook/resize-observer";
import { RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";

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

    const handleStorageChange = useCallback((e: StorageEvent) => {
        if (e.key && e.key !== key) { return; }
        setStoredValue(getValueFromStorage());
    }, [getValueFromStorage, setStoredValue]);

    useEventListener("storage", handleStorageChange);

    return [storedValue, setValue];
};

/** Observes the size of the reference element */
export const useSize = (target: RefObject<HTMLElement>) => {
    const [size, setSize] = useState(undefined as DOMRect | undefined);
    useLayoutEffect(() => {
        setSize(target.current?.getBoundingClientRect());
    }, [target]);
    useResizeObserver(target, entry => setSize(entry.contentRect));
    return size;
};

/** Attaches a mutation observer to the reference element */
export const useMutationObserver = (target: RefObject<HTMLElement>, options: MutationObserverInit = {}, cb: MutationCallback) => {
    const observer = useMemo(
        () => new MutationObserver((rec, obs) => cb?.(rec, obs)),
        [cb]
    );

    useEffect(() => {
        if (!target.current) { return; }
        observer.observe(target.current, options);
        return () => observer.disconnect();
    }, [target, observer, options]);
};
