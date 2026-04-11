import { create } from "zustand";

import type { EditorViewMode } from "@/types";

type EditorState = {
  title: string;
  content: string;
  viewMode: EditorViewMode;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setViewMode: (mode: EditorViewMode) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  title: "Без названия",
  content:
    "# Черновик\n\nНачните писать здесь. Текст из редактора передаётся ассистенту в контексте.\n",
  viewMode: "split",
  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  setViewMode: (viewMode) => set({ viewMode }),
}));
