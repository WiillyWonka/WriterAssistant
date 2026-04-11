"use client";

import type { ChatStatus } from "ai";
import { useState } from "react";

type Props = {
  sendMessage: (message: { text: string }) => Promise<void>;
  status: ChatStatus;
  stop: () => Promise<void>;
};

export function ChatInput({ sendMessage, status, stop }: Props) {
  const [input, setInput] = useState("");
  const busy = status === "submitted" || status === "streaming";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = input.trim();
    if (!t || busy) return;
    await sendMessage({ text: t });
    setInput("");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-2 flex shrink-0 flex-col gap-2 border-t border-[var(--border)] pt-2"
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Сообщение ассистенту…"
        rows={3}
        disabled={busy}
        className="resize-none rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-60"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Отправить
        </button>
        {busy && (
          <button
            type="button"
            onClick={() => void stop()}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)]"
          >
            Стоп
          </button>
        )}
      </div>
    </form>
  );
}
