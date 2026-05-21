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
  moveEntry: (index: number, direction: -1 | 1) => void;
  splitEntry: (index: number) => void;
  mergeWithAbove: (index: number) => void;
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

  moveEntry: (index, direction) =>
    set((state) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= state.entries.length) return state;
      const entries = [...state.entries];
      const a = entries[index];
      const b = entries[targetIndex];
      entries[index] = { ...a, translated: b.translated, translatedAt: Date.now() };
      entries[targetIndex] = { ...b, translated: a.translated, translatedAt: Date.now() };
      return { entries };
    }),

  splitEntry: (index) =>
    set((state) => {
      const entry = state.entries[index];
      if (!entry || !entry.translated) return state;

      const t = entry.translated;
      const mid = Math.floor(t.length / 2);
      const firstHalf = t.slice(0, mid).trim();
      const secondHalf = t.slice(mid).trim();
      if (!firstHalf || !secondHalf) return state;

      const newEntry: SubtitleEntry = {
        id: Math.max(...state.entries.map((e) => e.id)) + 1 + Math.random(),
        startTime: "",
        endTime: "",
        original: "",
        translated: secondHalf,
      };

      const entries = [...state.entries];
      entries[index] = { ...entry, translated: firstHalf, translatedAt: Date.now() };
      entries.splice(index + 1, 0, newEntry);
      return { entries };
    }),

  mergeWithAbove: (index) =>
    set((state) => {
      if (index <= 0 || index >= state.entries.length) return state;
      const above = state.entries[index - 1];
      const current = state.entries[index];
      const entries = [...state.entries];
      entries[index - 1] = {
        ...above,
        translated: (above.translated || "") + "\n" + (current.translated || ""),
        translatedAt: Date.now(),
      };
      entries.splice(index, 1);
      return { entries };
    }),
}));
