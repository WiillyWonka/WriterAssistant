"use client";

import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getMessageText } from "@/lib/messageText";

type Props = {
  message: UIMessage;
};

export function MessageBubble({ message }: Props) {
  const text = getMessageText(message);
  const isUser = message.role === "user";

  return (
    <div
      className={`max-w-[95%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
        isUser
          ? "ml-auto bg-[var(--accent)] text-white"
          : "mr-auto border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)]"
      }`}
    >
      {isUser ? (
        <div className="whitespace-pre-wrap">{text}</div>
      ) : (
        <div className="markdown-preview max-w-none text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
