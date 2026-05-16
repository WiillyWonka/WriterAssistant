"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { TextStreamChatTransport } from "ai";
import { useMemo } from "react";

import { useChatProviderStore } from "@/stores/chatProviderStore";
import { useDocumentStore } from "@/stores/documentStore";
import { useEditorStore } from "@/stores/editorStore";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type WriterChatOptions = {
  accessToken: string;
  initialMessages: UIMessage[];
};

export function useWriterChat({ accessToken, initialMessages }: WriterChatOptions) {
  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: `${apiBase}/api/chat`,
        credentials: "omit",
        fetch: async (input, init) => {
          const headers = new Headers(init?.headers);
          headers.set("Authorization", `Bearer ${accessToken}`);
          return fetch(input, { ...init, headers });
        },
        prepareSendMessagesRequest: ({ id, messages, body }) => {
          const documentId = useDocumentStore.getState().documentId;
          if (!documentId) {
            throw new Error("Документ ещё не загружен");
          }
          return {
            body: {
              ...body,
              id,
              messages,
              document_id: documentId,
              document_content: useEditorStore.getState().content,
              provider: useChatProviderStore.getState().provider,
            },
          };
        },
      }),
    [accessToken],
  );

  return useChat({
    id: "writer-assistant-chat",
    transport,
    messages: initialMessages,
  });
}
