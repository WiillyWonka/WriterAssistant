"use client";

import type { UIMessage } from "ai";
import { useEffect, useRef } from "react";

import { MessageBubble } from "@/components/Chat/MessageBubble";

type Props = {
  messages: UIMessage[];
};

export function MessageList({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-1 py-2">
      {messages.length === 0 && (
        <p className="text-center text-sm text-[var(--muted)]">
          Спросите ассистента о сюжете, стиле или правках — в контексте уже есть
          текст из редактора.
        </p>
      )}
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
