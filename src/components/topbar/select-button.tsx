import React, { MouseEventHandler, useRef, useState } from "react";
import shallow from "zustand/shallow";
import { useOutsideClick } from "../../hooks";
import useAppsStore from "../../stores/apps";
import useDOMStore from "../../stores/dom";
import { TextButton } from "../bar";
import { NodeSelectDelayedIcon, NodeSelectIcon } from "../icons";

import style from "./select-button.module.css";

type NodeSelectButtonProps = {
  showError?: boolean;
};
const NodeSelectButton = ({
  className,
  disabled,
  showError = true,
  ...props
}: NodeSelectButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { active, setPage } = useAppsStore(
    (state) => ({ active: state.active, setPage: state.setPage }),
    shallow
  );
  const { isSelecting, selectNode, error, clearError } = useDOMStore(
    (state) => ({
      isSelecting: state.isSelecting,
      selectNode: state.select,
      error: state.error,
      clearError: state.clearError,
    }),
    shallow
  );
  const { selectOptions, setSelectOptions } = useDOMStore(
    (state) => ({
      selectOptions: state.selectOptions,
      setSelectOptions: state.setSelectOptions,
    }),
    shallow
  );
  const [showDropdown, setShowDropdown] = useState(false);

  const doSelect: MouseEventHandler<HTMLButtonElement> = async (e) => {
    if (isSelecting) {
      return;
    }
    if (e.shiftKey) {
      // shift-clicking should just show the dropdown
      setShowDropdown(!showDropdown);
      return;
    }
    await selectNode(active?.uuid || "");
    setPage("inspect");
  };

  const $dropdown = useRef<HTMLDivElement | null>(null);
  useOutsideClick($dropdown, () => {
    setShowDropdown(false);
  });

  return (
    <div className={style["button-wrapper"]}>
      <TextButton
        {...props}
        className={[
          style.item,
          style.button,
          className,
          isSelecting ? "active" : "",
          style["select-button"],
        ].join(" ")}
        disabled={disabled || !active}
        onClick={doSelect}
      >
        {selectOptions.delay ? <NodeSelectDelayedIcon /> : <NodeSelectIcon />}
      </TextButton>
      {showDropdown && !(showError && error) ? (
        <div className={style.dropdown} ref={$dropdown}>
          Delay:{" "}
          <input
            autoFocus
            type="number"
            value={selectOptions.delay || ""}
            step={100}
            min={0}
            max={10000}
            onChange={(e) =>
              setSelectOptions({ delay: e.target.valueAsNumber || 0 })
            }
          />
          ms
        </div>
      ) : null}
      {showError && error ? (
        <div className={style.error} onClick={clearError}>
          {error}
        </div>
      ) : null}
    </div>
  );
};
export default NodeSelectButton;
