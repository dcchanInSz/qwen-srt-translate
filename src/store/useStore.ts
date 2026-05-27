"use client";

import { create } from "zustand";
import {
  buildDefaultSystemPrompt,
  DEFAULT_ACTIVE_TAB,
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGES,
  type SourceLanguage,
  type TargetLanguage,
} from "@/lib/languages";
import type { LlmProvider, ProviderConfig } from "@/lib/llm";
import { DEFAULT_PROVIDER_CONFIGS } from "@/lib/llm";
import type { SubtitleEntry } from "@/types/subtitle";

function loadProviderConfigs(): Record<LlmProvider, ProviderConfig> {
  if (typeof window === "undefined") return { ...DEFAULT_PROVIDER_CONFIGS };
  try {
    const stored = localStorage.getItem("app-provider-configs");
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, Partial<ProviderConfig>>;
      const merged = { ...DEFAULT_PROVIDER_CONFIGS };
      for (const key of Object.keys(merged) as LlmProvider[]) {
        if (parsed[key]) {
          merged[key] = { ...merged[key], ...parsed[key] };
        }
      }
      return merged;
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_PROVIDER_CONFIGS };
}

function saveProviderConfigs(configs: Record<LlmProvider, ProviderConfig>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("app-provider-configs", JSON.stringify(configs));
  } catch { /* ignore */ }
}

interface AppState {
  entries: SubtitleEntry[];
  fileName: string | null;
  selectedIndices: number[];
  provider: LlmProvider;
  model: string;
  activeTab: string;
  systemPrompt: string;
  translateError: string | null;
  sourceLanguage: SourceLanguage;
  targetLanguages: TargetLanguage[];
  providerConfigs: Record<LlmProvider, ProviderConfig>;

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
  setSourceLanguage: (sourceLanguage: SourceLanguage) => void;
  setTargetLanguages: (targetLanguages: TargetLanguage[]) => void;
  translatedCount: (languageId: string) => number;
  moveEntry: (index: number, direction: -1 | 1) => void;
  splitEntry: (index: number) => void;
  mergeWithAbove: (index: number) => void;
  setProviderConfig: (providerId: LlmProvider, config: Partial<ProviderConfig>) => void;
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
  sourceLanguage: DEFAULT_SOURCE_LANGUAGE,
  targetLanguages: DEFAULT_TARGET_LANGUAGES,
  providerConfigs: loadProviderConfigs(),

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
  setSourceLanguage: (sourceLanguage) => set({ sourceLanguage }),
  setTargetLanguages: (targetLanguages) => {
    const state = get();
    const activeTabInList = targetLanguages.some((l) => l.id === state.activeTab);
    set({
      targetLanguages,
      activeTab: activeTabInList ? state.activeTab : (targetLanguages[0]?.id ?? DEFAULT_ACTIVE_TAB),
      systemPrompt: activeTabInList
        ? state.systemPrompt
        : buildDefaultSystemPrompt(targetLanguages[0]?.id ?? DEFAULT_ACTIVE_TAB),
    });
  },
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

  setProviderConfig: (providerId, config) =>
    set((state) => {
      const newConfigs = {
        ...state.providerConfigs,
        [providerId]: { ...state.providerConfigs[providerId], ...config },
      };
      saveProviderConfigs(newConfigs);
      return { providerConfigs: newConfigs };
    }),
}));
