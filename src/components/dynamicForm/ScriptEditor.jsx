import { useEffect, useRef, useCallback } from "react";
import { Box, Stack, Tooltip, IconButton, Divider } from "@mui/material";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

// ✅ Prettier v3 — standalone browser-safe imports
import * as prettier from "prettier/standalone";
import * as parserBabel from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";

// ✅ Async because prettier.format() returns a Promise in v3
const formatJS = async (code) => {
  try {
    return await prettier.format(code, {
      parser: "babel",
      plugins: [parserBabel, prettierPluginEstree],
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: "es5",
      printWidth: 80,
    });
  } catch (e) {
    console.warn("Prettier formatting failed:", e.message);
    return code; // Return original code untouched if there's a syntax error
  }
};

const ScriptEditor = ({ c, formData, handleInputChange, error, setError, isMandatory }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  // Keep a stable ref to the latest callback — avoids stale closure in the listener
  const handleInputChangeRef = useRef(handleInputChange);
  const setErrorRef = useRef(setError);
  useEffect(() => { handleInputChangeRef.current = handleInputChange; }, [handleInputChange]);
  useEffect(() => { setErrorRef.current = setError; }, [setError]);

  // Sync external formData changes into the editor
  useEffect(() => {
    if (!editorRef.current) return;

    // Grab the CURRENT value at mount time (fixes blank editor on async data load)
    const initialValue = formData[c.element] || "";

    const state = EditorState.create({
      doc: initialValue,
      extensions: [
        basicSetup,
        javascript(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            // Use refs so these are always the latest versions
            handleInputChangeRef.current(c.element, newValue);
            if (newValue) setErrorRef.current(false);
          }
        }),
        EditorView.theme({
          "&": {
            fontSize: "13px",
            border: error ? "1px solid #d32f2f" : "1px solid rgba(255,255,255,0.12)",
            borderRadius: "4px",
            minHeight: "180px",
            maxHeight: "400px",
          },
          ".cm-scroller": { overflow: "auto" },
          ".cm-editor.cm-focused": {
            outline: "none",
            border: error
              ? "1px solid #d32f2f"
              : "1px solid #90caf9",
          },
        }),
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.element]);

  // Sync external formData → editor when value changes from OUTSIDE the editor
  // (e.g. a "Reset" button, or data loaded after mount)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const editorValue = view.state.doc.toString();
    const externalValue = formData[c.element] || "";

    // Only patch if the values differ — prevents cursor jumping while typing
    if (editorValue !== externalValue) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: externalValue },
      });
    }
  }, [formData, c.element]);

  const handleFormat = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    const raw = view.state.doc.toString();
    const formatted = formatJS(raw);
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: formatted },
    });
  }, []);

  const handleCopy = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    navigator.clipboard.writeText(view.state.doc.toString());
  }, []);

  return (
    <Box
      sx={{
        border: error ? "1px solid #d32f2f" : "1px solid rgba(255,255,255,0.23)",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{
          px: 1,
          py: 0.5,
          bgcolor: "#1e1e2e",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Tooltip title="Format code">
          <IconButton size="small" onClick={handleFormat} sx={{ color: "#cdd6f4" }}>
            <FormatAlignLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy to clipboard">
          <IconButton size="small" onClick={handleCopy} sx={{ color: "#cdd6f4" }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.12)", mx: 0.5 }} />
      </Stack>

      {/* CodeMirror mount point */}
      <div ref={editorRef} />

      {/* Error helper text */}
      {error && (
        <Box sx={{ px: 1.5, py: 0.5, bgcolor: "#1e1e2e" }}>
          <span style={{ color: "#d32f2f", fontSize: "0.75rem" }}>
            This field is required
          </span>
        </Box>
      )}
    </Box>
  );
};

export default ScriptEditor;