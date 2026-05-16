"use client";

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { signOut, useSession } from "next-auth/react";

import { ChatPanel } from "@/components/Chat/ChatPanel";
import { EditorSection } from "@/components/Editor/EditorSection";
import { useAutoSaveDocument } from "@/hooks/useAutoSaveDocument";
import { useBootstrapSession } from "@/hooks/useBootstrapSession";
import { useEditorStore } from "@/stores/editorStore";

export function SplitLayout() {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;
  const { ready, initialMessages, error: bootstrapError } =
    useBootstrapSession(accessToken);

  useAutoSaveDocument(accessToken, ready);

  const title = useEditorStore((s) => s.title);
  const setTitle = useEditorStore((s) => s.setTitle);

  if (status === "loading" || (accessToken && !ready)) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-[var(--muted)]">
        Загрузка…
      </div>
    );
  }

  if (bootstrapError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 px-4 text-center text-sm text-red-200">
        <p>Не удалось загрузить сессию: {bootstrapError}</p>
        <button
          type="button"
          className="rounded-lg border border-[var(--border)] px-3 py-1 text-[var(--foreground)]"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Выйти и войти снова
        </button>
      </div>
    );
  }

  if (!accessToken) {
    return null;
  }

  const displayName =
    session?.user?.name ??
    session?.user?.email ??
    session?.user?.id ??
    "Пользователь";

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--border)] px-4 py-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-0 flex-1 border-none bg-transparent text-lg font-semibold text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
          placeholder="Название документа"
        />
        <div className="flex shrink-0 items-center gap-2 text-xs text-[var(--muted)]">
          <span className="max-w-[10rem] truncate sm:max-w-[14rem]">
            {displayName}
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-lg border border-[var(--border)] px-2 py-1 text-[var(--foreground)] hover:border-[var(--accent)]"
          >
            Выйти
          </button>
        </div>
        <span className="hidden text-xs text-[var(--muted)] sm:inline">
          Writer Assistant
        </span>
      </header>

      <PanelGroup
        direction="horizontal"
        className="min-h-0 flex-1"
        autoSaveId="writer-assistant-main"
      >
        <Panel defaultSize={62} minSize={35} className="min-w-0 p-3">
          <EditorSection />
        </Panel>
        <PanelResizeHandle className="group relative w-2 bg-[var(--border)] transition-colors hover:bg-[var(--accent)]">
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--muted)] opacity-50 group-hover:opacity-100" />
        </PanelResizeHandle>
        <Panel defaultSize={38} minSize={25} className="min-w-0 p-3">
          <ChatPanel
            accessToken={accessToken}
            initialMessages={initialMessages}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
