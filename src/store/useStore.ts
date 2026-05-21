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
      if (!entry) return state;

      const original = entry.original;
      const translated = entry.translated;
      const mid = Math.floor(original.length / 2);

      const midTime = splitTime(entry.startTime, entry.endTime);
      if (!midTime) return state;

      const first: SubtitleEntry = {
        ...entry,
        id: Math.max(...state.entries.map((e) => e.id)) + 1 + Math.random(),
        endTime: midTime,
        original: original.slice(0, mid).trim(),
        translated: translated ? translated.slice(0, Math.floor(translated.length / 2)).trim() : "",
      };
      const second: SubtitleEntry = {
        ...entry,
        id: Math.max(...state.entries.map((e) => e.id)) + 2 + Math.random(),
        startTime: midTime,
        original: original.slice(mid).trim(),
        translated: translated ? translated.slice(Math.floor(translated.length / 2)).trim() : "",
      };

      const entries = [...state.entries];
      entries.splice(index, 1, first, second);
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
        endTime: current.endTime,
        original: above.original + "\n" + current.original,
        translated: above.translated + "\n" + current.translated,
        translatedAt: Date.now(),
      };
      entries.splice(index, 1);
      return { entries };
    }),
}));

function parseTime(ts: string): number {
  const m = ts.match(/^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/);
  if (!m) return 0;
  return (
    parseInt(m[1], 10) * 3600000 +
    parseInt(m[2], 10) * 60000 +
    parseInt(m[3], 10) * 1000 +
    parseInt(m[4], 10)
  );
}

function formatTime(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const msRem = ms % 1000;
  return (
    String(h).padStart(2, "0") +
    ":" +
    String(m).padStart(2, "0") +
    ":" +
    String(s).padStart(2, "0") +
    "," +
    String(msRem).padStart(3, "0")
  );
}

function splitTime(start: string, end: string): string | null {
  const startMs = parseTime(start);
  const endMs = parseTime(end);
  if (startMs >= endMs) return null;
  return formatTime(Math.floor((startMs + endMs) / 2));
}
