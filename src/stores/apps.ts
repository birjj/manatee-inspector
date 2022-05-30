import create from "zustand";
import { persist } from "zustand/middleware";
import useDOMStore from "./dom";
import useConsoleStore from "./console";

type Application = { uuid: string, name: string };
type Page = "inspect" | "selector" | "console" | "settings";
const useAppsStore = create<{
    applications: Application[],
    addApplication: (uuid: string, name: string) => void,
    removeApplication: (uuid: string) => void,
    active: Application | null | undefined,
    setActive: (uuid: string | null) => void,
    page: Page,
    setPage: (page: Page) => void,
}, any>(persist(
    set => ({
        applications: [],
        addApplication: (uuid, name) => set(state => {
            if (state.applications.find(app => app.uuid === uuid)) {
                throw new Error("An app with that UUID already exists");
            }
            return {
                applications: [...state.applications, { uuid, name }]
            };
        }),
        removeApplication: (uuid) => set(state => {
            const apps = [...state.applications];
            const i = apps.findIndex((app) => app.uuid === uuid);
            if (i === -1) { return {}; }
            apps.splice(i, 1);
            return {
                applications: apps,
                active: uuid === state.active?.uuid ? null : state.active
            };
        }),
        active: undefined,
        setActive: (uuid) => set(state => {
            if (uuid === null) {
                return { active: null };
            }
            if (uuid === state.active?.uuid) {
                return {};
            }
            const app = state.applications.find(app => app.uuid === uuid);
            if (!app) {
                throw new Error(`Couldn't find app with uuid ${uuid}`);
            }

            useDOMStore.getState().reset();
            useConsoleStore.getState().clearHistory();
            return { active: app };
        }),
        page: "inspect",
        setPage: (page) => set(state => {
            if (page === state.page) {
                return {};
            }
            return { page };
        })
    }),
    {
        name: "apps",
        partialize: state => ({ applications: state.applications })
    }
));
export default useAppsStore;