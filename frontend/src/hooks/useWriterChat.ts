"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useMemo } from "react";

import { useChatProviderStore } from "@/stores/chatProviderStore";
import { useEditorStore } from "@/stores/editorStore";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function useWriterChat() {
  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: `${apiBase}/api/chat`,
        credentials: "omit",
        prepareSendMessagesRequest: ({ id, messages, body }) => ({
          body: {
            ...body,
            id,
            messages,
            document_content: useEditorStore.getState().content,
            provider: useChatProviderStore.getState().provider,
          },
        }),
      }),
    [],
  );

  return useChat({ transport });
}
