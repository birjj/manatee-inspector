import CodeMirror, { EditorView, Extension } from "@uiw/react-codemirror";
import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  lineNumbers,
  highlightActiveLineGutter,
} from "@codemirror/view";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
} from "@codemirror/language";
import {
  defaultKeymap,
  history,
  historyKeymap,
  insertNewlineAndIndent,
} from "@codemirror/commands";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import React, { useCallback, useMemo, useRef, useState } from "react";

import theme from "./theme";
import { javascript } from "@codemirror/lang-javascript";

type TextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  readOnly?: boolean;
};
const TextEditor = ({
  value,
  onChange,
  onSubmit,
  readOnly,
}: TextEditorProps) => {
  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(value);
    }
  }, [onSubmit, value]);
  const extensions = useMemo(
    () =>
      [
        highlightSpecialChars(),
        highlightSelectionMatches(),
        history(),
        readOnly ? null : drawSelection(),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        dropCursor(),
        readOnly ? null : bracketMatching(),
        closeBrackets(),
        readOnly ? null : lineNumbers(),
        EditorView.lineWrapping,
        //autocompletion(),
        keymap.of([
          {
            key: "Enter",
            run: insertNewlineAndIndent,
            shift: (): boolean => {
              handleSubmit();
              return true;
            },
          },
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          //...completionKeymap
        ]),
        javascript({ jsx: false, typescript: false }),
      ].filter((v) => v) as Extension[],
    [handleSubmit]
  );

  return (
    <CodeMirror
      editable={!readOnly}
      value={value}
      onChange={onChange}
      autoFocus
      theme={theme}
      extensions={extensions}
      basicSetup={false}
      placeholder="Enter code..."
    />
  );
};

export default TextEditor;
