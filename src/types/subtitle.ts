export interface SubtitleEntry {
  id: number;
  startTime: string;
  endTime: string;
  original: string;
  translated: string;
  translatedAt?: number;
}

import type { LlmProvider } from "@/lib/llm";

export interface TranslateRequest {
  provider: LlmProvider;
  model: string;
  systemPrompt: string;
  /** Full original script for plot/context understanding */
  context: string[];
  entries: { index: number; text: string }[];
}

export interface TranslateResponse {
  translations: { index: number; text: string }[];
}

export type ExportFormat = "srt" | "srt-bilingual" | "vtt" | "vtt-bilingual" | "ass";
