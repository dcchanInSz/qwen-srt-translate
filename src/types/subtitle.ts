export interface SubtitleEntry {
  id: number;
  startTime: string;
  endTime: string;
  original: string;
  translated: string;
  translatedAt?: number;
}

export interface TranslateRequest {
  model: string;
  systemPrompt: string;
  entries: { index: number; text: string }[];
}

export interface TranslateResponse {
  translations: { index: number; text: string }[];
}

export type ExportFormat = "srt" | "srt-bilingual" | "vtt" | "vtt-bilingual" | "ass";
