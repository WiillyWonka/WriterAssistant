"use client";

import { ChatInput } from "@/components/Chat/ChatInput";
import { MessageList } from "@/components/Chat/MessageList";
import { useWriterChat } from "@/hooks/useWriterChat";
import {
  type LlmProvider,
  useChatProviderStore,
} from "@/stores/chatProviderStore";

export function ChatPanel() {
  const { messages, sendMessage, status, stop, error, clearError } =
    useWriterChat();
  const provider = useChatProviderStore((s) => s.provider);
  const setProvider = useChatProviderStore((s) => s.setProvider);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Ассистент
        </h2>
        <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <span className="shrink-0">Модель</span>
          <select
            value={provider}
            onChange={(e) =>
              setProvider(e.target.value as LlmProvider)
            }
            className="max-w-[11rem] rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2 py-1 text-xs text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            <option value="openai">ChatGPT</option>
            <option value="anthropic">Claude</option>
          </select>
        </label>
      </div>
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
