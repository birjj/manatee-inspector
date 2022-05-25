import create from "zustand";
import { persist } from "zustand/middleware";
import { runCode } from "../manatee";

export type HistoryEntry = {
    error: boolean,
    loading: boolean,
    request: string,
    response: string
};
const useConsoleStore = create<{
    isLoading: boolean,
    history: HistoryEntry[],
    runCode: (appUuid: string, code: string) => void,
    clearHistory: () => void,
    prompt: string,
    setPrompt: (value: string) => void,
    promptHistory: string[]
}, any>(persist(
    (set, get) => ({
        isLoading: false,
        history: [],
        runCode: async (appUuid, code) => {
            const { isLoading, history, promptHistory } = get();
            if (isLoading || !code) {
                console.warn("Attempted to run code while already loading", { isLoading, code });
                return;
            }
            const entry: HistoryEntry = {
                error: false,
                loading: true,
                request: code,
                response: ""
            };
            // store our initial state in the store
            set({
                isLoading: true,
                history: [...history, entry],
                promptHistory: code === promptHistory[promptHistory.length - 1]
                    ? promptHistory
                    : [...promptHistory, code].slice(-100)
            });
            // then run the code in Manatee and update the store with the result
            try {
                const response = await runCode(appUuid, `JSON.stringify((function(){\n${code}\n})())`);
                entry.response = response;
            } catch (e) {
                entry.response = "" + e;
                entry.error = true;
            }
            entry.loading = false;
            const newHistory = get().history.map(
                v => v === entry ? { ...entry } : v
            );
            set({
                isLoading: false,
                history: newHistory
            });
        },
        clearHistory: () => set(() => ({ history: [] })),
        prompt: "",
        setPrompt: (code: string) => set({ prompt: code }),
        promptHistory: []
    }),
    {
        name: "console",
        partialize: (state) => ({ prompt: state.prompt, promptHistory: state.promptHistory })
    }
));
export default useConsoleStore;