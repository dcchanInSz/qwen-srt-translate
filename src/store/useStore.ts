"use client";

import { create } from "zustand";
import {
  buildDefaultSystemPrompt,
  DEFAULT_ACTIVE_TAB,
} from "@/lib/languages";
import type { LlmProvider } from "@/lib/llm";
import type { SubtitleEntry } from "@/types/subtitle";

interface AppState {
  entries: SubtitleEntry[];
  fileName: string | null;
  selectedIndices: number[];
  provider: LlmProvider;
  model: string;
  activeTab: string;
  systemPrompt: string;
  translateError: string | null;

  setEntries: (entries: SubtitleEntry[]) => void;
  setFileName: (name: string | null) => void;
  updateEntry: (id: number, updates: Partial<SubtitleEntry>) => void;
  updateTranslation: (id: number, languageId: string, text: string) => void;
  setSelectedIndices: (indices: number[]) => void;
  toggleSelected: (index: number) => void;
  setProvider: (provider: LlmProvider) => void;
  setModel: (model: string) => void;
  setActiveTab: (tab: string) => void;
  setSystemPrompt: (prompt: string) => void;
  setTranslateError: (error: string | null) => void;
  translatedCount: (languageId: string) => number;
  moveEntry: (index: number, direction: -1 | 1) => void;
  splitEntry: (index: number) => void;
  mergeWithAbove: (index: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  entries: [],
  fileName: null,
  selectedIndices: [],
  provider: "lmstudio",
  model: "",
  activeTab: DEFAULT_ACTIVE_TAB,
  systemPrompt: buildDefaultSystemPrompt(DEFAULT_ACTIVE_TAB),
  translateError: null,

  setEntries: (entries) => set({ entries, selectedIndices: [] }),
  setFileName: (fileName) => set({ fileName }),

  updateEntry: (id: number, updates: Partial<SubtitleEntry>) =>
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),

  updateTranslation: (id, languageId, text) =>
    set((state) => ({
      entries: state.entries.map((e) => {
        if (e.id !== id) return e;
        return {
          ...e,
          translations: { ...e.translations, [languageId]: text },
          translatedAt: { ...e.translatedAt, [languageId]: Date.now() },
        };
      }),
    })),

  setSelectedIndices: (selectedIndices) => set({ selectedIndices }),
  toggleSelected: (index) =>
    set((state) => {
      const indices = state.selectedIndices.includes(index)
        ? state.selectedIndices.filter((i) => i !== index)
        : [...state.selectedIndices, index];
      return { selectedIndices: indices };
    }),
  setProvider: (provider) => set({ provider, model: "" }),
  setModel: (model) => set({ model }),

  setActiveTab: (activeTab) =>
    set({
      activeTab,
      systemPrompt:
        get().activeTab === activeTab ? get().systemPrompt : buildDefaultSystemPrompt(activeTab),
    }),

  setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
  setTranslateError: (translateError) => set({ translateError }),
  translatedCount: (languageId) =>
    get().entries.filter((e) => e.translations[languageId]).length,

  moveEntry: (index, direction) =>
    set((state) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= state.entries.length) return state;
      const entries = [...state.entries];
      const a = entries[index];
      const b = entries[targetIndex];
      const lang = state.activeTab;
      const now = Date.now();
      const aTrans = a.translations[lang] ?? "";
      const bTrans = b.translations[lang] ?? "";
      entries[index] = {
        ...a,
        translations: { ...a.translations, [lang]: bTrans },
        translatedAt: { ...a.translatedAt, [lang]: now },
      };
      entries[targetIndex] = {
        ...b,
        translations: { ...b.translations, [lang]: aTrans },
        translatedAt: { ...b.translatedAt, [lang]: now },
      };
      return { entries };
    }),

  splitEntry: (index) =>
    set((state) => {
      const entry = state.entries[index];
      const lang = state.activeTab;
      const t = entry.translations[lang];
      if (!entry || !t) return state;

      const mid = Math.floor(t.length / 2);
      const firstHalf = t.slice(0, mid).trim();
      const secondHalf = t.slice(mid).trim();
      if (!firstHalf || !secondHalf) return state;

      const entries = [...state.entries];
      const now = Date.now();
      entries[index] = {
        ...entry,
        translations: { ...entry.translations, [lang]: firstHalf },
        translatedAt: { ...entry.translatedAt, [lang]: now },
      };

      entries.push({
        id: Math.max(...entries.map((e) => e.id)) + 1 + Math.random(),
        startTime: "",
        endTime: "",
        original: "",
        translations: {},
      });

      for (let k = entries.length - 1; k > index + 1; k--) {
        entries[k] = {
          ...entries[k],
          translations: { ...entries[k].translations, [lang]: entries[k - 1].translations[lang] ?? "" },
        };
      }
      entries[index + 1] = {
        ...entries[index + 1],
        translations: { ...entries[index + 1].translations, [lang]: secondHalf },
      };

      return { entries };
    }),

  mergeWithAbove: (index) =>
    set((state) => {
      if (index <= 0 || index >= state.entries.length) return state;
      const above = state.entries[index - 1];
      const current = state.entries[index];
      const entries = [...state.entries];
      const lang = state.activeTab;
      const now = Date.now();

      const aboveTrans = above.translations[lang] ?? "";
      const currentTrans = current.translations[lang] ?? "";
      entries[index - 1] = {
        ...above,
        translations: { ...above.translations, [lang]: aboveTrans + "\n" + currentTrans },
        translatedAt: { ...above.translatedAt, [lang]: now },
      };

      for (let k = index; k < entries.length - 1; k++) {
        entries[k] = {
          ...entries[k],
          translations: { ...entries[k].translations, [lang]: entries[k + 1].translations[lang] ?? "" },
        };
      }
      entries[entries.length - 1] = {
        ...entries[entries.length - 1],
        translations: { ...entries[entries.length - 1].translations, [lang]: "" },
      };

      const last = entries[entries.length - 1];
      if (!last.original && !last.translations[lang]) {
        entries.pop();
      }

      return { entries };
    }),
}));
