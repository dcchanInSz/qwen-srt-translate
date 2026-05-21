"use client";

import { create } from "zustand";
import { SubtitleEntry } from "@/types/subtitle";

interface AppState {
  entries: SubtitleEntry[];
  fileName: string | null;
  selectedIndices: number[];
  model: string;
  systemPrompt: string;
  translateError: string | null;

  setEntries: (entries: SubtitleEntry[]) => void;
  setFileName: (name: string | null) => void;
  updateEntry: (id: number, updates: Partial<SubtitleEntry>) => void;
  setSelectedIndices: (indices: number[]) => void;
  toggleSelected: (index: number) => void;
  setModel: (model: string) => void;
  setSystemPrompt: (prompt: string) => void;
  setTranslateError: (error: string | null) => void;
  translatedCount: () => number;
}

export const useStore = create<AppState>((set, get) => ({
  entries: [],
  fileName: null,
  selectedIndices: [],
  model: "",
  systemPrompt: "你是一个专业的字幕翻译器。请将以下字幕翻译为中文，保持自然的语序和表达。",
  translateError: null,

  setEntries: (entries) => set({ entries, selectedIndices: [] }),
  setFileName: (fileName) => set({ fileName }),
  updateEntry: (id, updates) =>
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, ...updates, translatedAt: Date.now() } : e
      ),
    })),
  setSelectedIndices: (selectedIndices) => set({ selectedIndices }),
  toggleSelected: (index) =>
    set((state) => {
      const indices = state.selectedIndices.includes(index)
        ? state.selectedIndices.filter((i) => i !== index)
        : [...state.selectedIndices, index];
      return { selectedIndices: indices };
    }),
  setModel: (model) => set({ model }),
  setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
  setTranslateError: (translateError) => set({ translateError }),
  translatedCount: () => get().entries.filter((e) => e.translated).length,
}));
