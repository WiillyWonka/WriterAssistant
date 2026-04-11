"use client";

import { Editor } from "@/components/Editor/Editor";
import { EditorToolbar } from "@/components/Editor/EditorToolbar";
import { MarkdownPreview } from "@/components/Editor/MarkdownPreview";
import { useEditorStore } from "@/stores/editorStore";

export function EditorSection() {
  const viewMode = useEditorStore((s) => s.viewMode);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <EditorToolbar />
      {viewMode === "edit" && <Editor />}
      {viewMode === "preview" && <MarkdownPreview />}
      {viewMode === "split" && (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-2">
          <Editor />
          <MarkdownPreview />
        </div>
      )}
    </div>
  );
}
