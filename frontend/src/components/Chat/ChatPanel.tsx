"use client";

import { ChatInput } from "@/components/Chat/ChatInput";
import { MessageList } from "@/components/Chat/MessageList";
import { useWriterChat } from "@/hooks/useWriterChat";

export function ChatPanel() {
  const { messages, sendMessage, status, stop, error, clearError } =
    useWriterChat();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h2 className="mb-2 shrink-0 text-sm font-semibold text-[var(--foreground)]">
        Ассистент
      </h2>
      {error && (
        <div className="mb-2 shrink-0 rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          <p>{error.message}</p>
          <button
            type="button"
            onClick={() => clearError()}
            className="mt-1 underline"
          >
            Закрыть
          </button>
        </div>
      )}
      <MessageList messages={messages} />
      <ChatInput sendMessage={sendMessage} status={status} stop={stop} />
    </div>
  );
}
