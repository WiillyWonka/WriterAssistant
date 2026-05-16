"use client";

import { useEffect } from "react";

import { authedFetch } from "@/lib/api";
import { useDocumentStore } from "@/stores/documentStore";
import { useEditorStore } from "@/stores/editorStore";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function useAutoSaveDocument(
  accessToken: string | undefined,
  enabled: boolean,
) {
  const title = useEditorStore((s) => s.title);
  const content = useEditorStore((s) => s.content);
  const documentId = useDocumentStore((s) => s.documentId);

  useEffect(() => {
    if (!enabled || !accessToken || !documentId) {
      return;
    }
    const handle = window.setTimeout(() => {
      void authedFetch(`${apiBase}/api/documents/${documentId}`, accessToken, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
    }, 800);
    return () => window.clearTimeout(handle);
  }, [title, content, documentId, accessToken, enabled]);
}
