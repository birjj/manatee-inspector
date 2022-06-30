import create from "zustand";
import { persist } from "zustand/middleware";
import { runCode } from "../manatee";

function encodeCode(code: string) {
  return `JSON.stringify((function(){
        ${code}
    })(), function replacer(key,val){
        // handle dates (these are given to replacer as strings, since that's the output of Date's .toJSON)
        if (this[key] instanceof Date) {
            return { ___type: "date", value: isNaN(this[key]) ? "NaN" : +this[key] };
        }
        // all other non-objects are just passed directly
        if (!(val instanceof Object)) { return val; }
        // functions are treated specially
        if (val instanceof Function) { return { ___type: "function", value: ""+val, name: val.name }; }
        // other objects are tested for cyclical paths, which are replaced by the string "<cyclical [previously.seen.path]>"
        // note that this doesn't actually test for cyclical paths, only previously seen - this causes issues in e.g. [obj, obj]
        // a proper solution should be implemented if this becomes a problem
        if (!val.___json_path) { Object.defineProperty(val, "___json_path", { value: this.___json_path ? this.___json_path + "." + key : "root", enumerable: false }); }
        if (val.___json_seen) { return "<cyclical ["+val.___json_path+"]>"; }
        Object.defineProperty(val, "___json_seen", { value: true, enumerable: false });
        return val;
    })`;
}
function decodeResponse(response: string) {
  try {
    return JSON.parse(response, (key, val) => {
      if (!(val instanceof Object) || !val.___type) {
        return val;
      }
      switch (val.___type) {
        case "date":
          return new Date(val.value === "NaN" ? NaN : val.value);
        case "function":
          return val; // TODO: add support for displaying functions in pretty format
        default:
          return val;
      }
    });
  } catch (e) {
    return response;
  }
}

export type HistoryEntry = {
  error: boolean;
  loading: boolean;
  request: string;
  response: any;
};
const useConsoleStore = create<
  {
    isLoading: boolean;
    history: HistoryEntry[];
    timeout: number;
    setTimeout: (ms: number) => void;
    runCode: (appUuid: string, code: string) => void;
    clearHistory: () => void;
    prompt: string;
    setPrompt: (value: string) => void;
    promptHistory: string[];
  },
  any
>(
  persist(
    (set, get) => ({
      isLoading: false,
      history: [],
      timeout: 30000,
      setTimeout: (ms) => {
        ms = ms || 0;
        set({
          timeout: ms,
        });
      },
      runCode: async (appUuid, code) => {
        const { isLoading, history, promptHistory } = get();
        if (isLoading || !code) {
          console.warn("Attempted to run code while already loading", {
            isLoading,
            code,
          });
          return;
        }
        const entry: HistoryEntry = {
          error: false,
          loading: true,
          request: code,
          response: "",
        };
        // store our initial state in the store
        set({
          isLoading: true,
          history: [...history, entry],
          promptHistory:
            code === promptHistory[promptHistory.length - 1]
              ? promptHistory
              : [...promptHistory, code].slice(-100),
        });
        // then run the code in Manatee and update the store with the result
        try {
          const response = await runCode(
            appUuid,
            encodeCode(code),
            get().timeout || 0
          );
          entry.response = decodeResponse(response);
        } catch (e) {
          entry.response = "" + e;
          entry.error = true;
        }
        entry.loading = false;
        const newHistory = get().history.map((v) =>
          v === entry ? { ...entry } : v
        );
        set({
          isLoading: false,
          history: newHistory,
        });
      },
      clearHistory: () => set(() => ({ history: [] })),
      prompt: "",
      setPrompt: (code: string) => set({ prompt: code }),
      promptHistory: [],
    }),
    {
      name: "console",
      partialize: (state) => ({
        prompt: state.prompt,
        promptHistory: state.promptHistory,
        timeout: state.timeout,
      }),
    }
  )
);
export default useConsoleStore;
