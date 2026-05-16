"use client";

import type { UIMessage } from "ai";
import { useEffect, useState } from "react";

import { authedFetch } from "@/lib/api";
import { useDocumentStore } from "@/stores/documentStore";
import { useEditorStore } from "@/stores/editorStore";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type SessionPayload = {
  document: { id: string; title: string; content: string };
  messages: UIMessage[];
};

export function useBootstrapSession(accessToken: string | undefined) {
  const [ready, setReady] = useState(false);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setReady(false);
      setInitialMessages([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setReady(false);
    setError(null);

    void (async () => {
      try {
        const res = await authedFetch(
          `${apiBase}/api/session`,
          accessToken,
          { method: "GET" },
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || res.statusText);
        }
        const data = (await res.json()) as SessionPayload;
        if (cancelled) {
          return;
        }
        useEditorStore.getState().setTitle(data.document.title);
        useEditorStore.getState().setContent(data.document.content);
        useDocumentStore.getState().setDocumentId(data.document.id);
        setInitialMessages(Array.isArray(data.messages) ? data.messages : []);
        setReady(true);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return { ready, initialMessages, error };
}
