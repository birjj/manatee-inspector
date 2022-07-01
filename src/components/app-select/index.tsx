import React, { useCallback } from "react";
import shallow from "zustand/shallow";
import useAppsStore from "../../stores/apps";
import { useCredentials } from "../../stores/settings";
import AppSelect from "./select";

export const AppSelector = (
  props: Omit<Parameters<typeof AppSelect>[0], "value" | "onChange">
) => {
  const { username, password } = useCredentials();
  const { activeApp, setActive, page, setPage } = useAppsStore(
    (state) => ({
      activeApp: state.active,
      setActive: state.setActive,
      setPage: state.setPage,
      page: state.page,
    }),
    shallow
  );

  const selectApp = useCallback(
    (uuid: string) => {
      setActive(uuid);
      if (!page) {
        setPage("inspect");
      }
    },
    [setActive, page, setPage]
  );

  const hasCredentials = username && password;
  return (
    <AppSelect
      {...props}
      disabled={!hasCredentials}
      value={activeApp?.uuid || ""}
      onChange={selectApp}
    />
  );
};
