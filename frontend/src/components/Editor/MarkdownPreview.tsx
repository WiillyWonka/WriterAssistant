"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useEditorStore } from "@/stores/editorStore";

export function MarkdownPreview() {
  const content = useEditorStore((s) => s.content);

  return (
    <div className="markdown-preview h-full min-h-0 flex-1 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 text-sm leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
