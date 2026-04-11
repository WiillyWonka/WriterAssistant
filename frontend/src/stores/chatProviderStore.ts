import { create } from "zustand";

export type LlmProvider = "anthropic" | "openai";

type ChatProviderState = {
  provider: LlmProvider;
  setProvider: (provider: LlmProvider) => void;
};

export const useChatProviderStore = create<ChatProviderState>((set) => ({
  provider: "anthropic",
  setProvider: (provider) => set({ provider }),
}));
