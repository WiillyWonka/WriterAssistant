"use client";

import type { EditorViewMode } from "@/types";
import { useEditorStore } from "@/stores/editorStore";

const modes: { id: EditorViewMode; label: string }[] = [
  { id: "edit", label: "Редактор" },
  { id: "preview", label: "Просмотр" },
  { id: "split", label: "Разделение" },
];

export function EditorToolbar() {
  const viewMode = useEditorStore((s) => s.viewMode);
  const setViewMode = useEditorStore((s) => s.setViewMode);

  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
        Markdown
      </span>
      <div className="flex rounded-lg border border-[var(--border)] p-0.5">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setViewMode(m.id)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === m.id
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
