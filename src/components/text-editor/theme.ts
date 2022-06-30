import { EditorView } from "@uiw/react-codemirror";

// Theme has been yoinked from the Chrome frontend devtools
export default EditorView.theme({
  "&.cm-editor": {
    cursor: "auto",
    "&.cm-focused": {
      outline: "none",
    },
  },

  ".cm-scroller": {
    lineHeight: "1.2em",
    fontFamily: "var(--font-monospace)",
  },

  ".cm-panels": {
    backgroundColor: "var(--c-background-1)",
  },

  ".cm-selectionMatch": {
    backgroundColor: "var(--c-text-selection)",
  },

  ".cm-cursor": {
    borderLeft: "1px solid #000",
  },

  '[aria-readonly="true"] .cm-cursor': {
    display: "none",
  },

  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    background: "var(--c-selected-bg)",
  },

  ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
    backgroundColor: "rgba(0,0,0,0.07)",
    borderBottom: "1px solid rgba(0,0,0,0.5)",
  },

  ".cm-placeholder": {
    color: "var(--c-text-secondary)",
  },

  ".cm-lineWrapping": {
    wordBreak: "break-all",
  },
});
