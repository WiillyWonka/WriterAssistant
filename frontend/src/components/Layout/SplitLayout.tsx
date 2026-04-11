"use client";

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

import { ChatPanel } from "@/components/Chat/ChatPanel";
import { EditorSection } from "@/components/Editor/EditorSection";
import { useEditorStore } from "@/stores/editorStore";

export function SplitLayout() {
  const title = useEditorStore((s) => s.title);
  const setTitle = useEditorStore((s) => s.setTitle);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b border-[var(--border)] px-4 py-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-0 flex-1 border-none bg-transparent text-lg font-semibold text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
          placeholder="Название документа"
        />
        <span className="hidden text-xs text-[var(--muted)] sm:inline">
          Writer Assistant
        </span>
      </header>

      <PanelGroup
        direction="horizontal"
        className="min-h-0 flex-1"
        autoSaveId="writer-assistant-main"
      >
        <Panel defaultSize={62} minSize={35} className="min-w-0 p-3">
          <EditorSection />
        </Panel>
        <PanelResizeHandle className="group relative w-2 bg-[var(--border)] transition-colors hover:bg-[var(--accent)]">
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--muted)] opacity-50 group-hover:opacity-100" />
        </PanelResizeHandle>
        <Panel defaultSize={38} minSize={25} className="min-w-0 p-3">
          <ChatPanel />
        </Panel>
      </PanelGroup>
    </div>
  );
}
