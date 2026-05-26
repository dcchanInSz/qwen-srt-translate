export interface SubtitleEntry {
  id: number;
  startTime: string;
  endTime: string;
  original: string;
  translations: Record<string, string>;
  translatedAt?: Record<string, number>;
}

import type { LlmProvider } from "@/lib/llm";

export interface TranslateRequest {
  provider: LlmProvider;
  model: string;
  systemPrompt: string;
  context: string[];
  entries: { index: number; text: string }[];
  targetLanguages: string[];
}

export interface TranslateResponse {
  results: Record<string, { index: number; text: string }[]>;
  errors?: Record<string, string>;
}

export type ExportFormat = "srt" | "vtt" | "ass" | "json";
