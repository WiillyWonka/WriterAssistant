import { create } from "zustand";

type DocumentState = {
  documentId: string | null;
  setDocumentId: (id: string | null) => void;
};

export const useDocumentStore = create<DocumentState>((set) => ({
  documentId: null,
  setDocumentId: (documentId) => set({ documentId }),
}));
