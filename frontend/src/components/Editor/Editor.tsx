"use client";

import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";

import { useEditorStore } from "@/stores/editorStore";

import { oneDark } from "@codemirror/theme-one-dark";

export function Editor() {
  const content = useEditorStore((s) => s.content);
  const setContent = useEditorStore((s) => s.setContent);

  const extensions = [markdown(), EditorView.lineWrapping, oneDark];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
      <CodeMirror
        value={content}
        height="100%"
        className="h-full min-h-[200px] flex-1 overflow-auto text-sm [&_.cm-editor]:h-full [&_.cm-editor]:min-h-[200px] [&_.cm-scroller]:min-h-[200px]"
        extensions={extensions}
        onChange={(v) => setContent(v)}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
        }}
      />
    </div>
  );
}
