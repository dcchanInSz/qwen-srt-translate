export interface TargetLanguage {
  id: string;
  label: string;
  promptName: string;
}

export const TARGET_LANGUAGES: TargetLanguage[] = [
  { id: "zh", label: "中文（简体）", promptName: "Simplified Chinese" },
  { id: "zh-TW", label: "中文（繁體）", promptName: "Traditional Chinese" },
  { id: "en", label: "English", promptName: "English" },
  { id: "ja", label: "日本語", promptName: "Japanese" },
  { id: "ko", label: "한국어", promptName: "Korean" },
  { id: "es", label: "Español", promptName: "Spanish" },
  { id: "fr", label: "Français", promptName: "French" },
  { id: "de", label: "Deutsch", promptName: "German" },
  { id: "pt", label: "Português", promptName: "Portuguese" },
  { id: "ru", label: "Русский", promptName: "Russian" },
  { id: "custom", label: "Custom", promptName: "" },
];

export const DEFAULT_TARGET_LANGUAGE = "zh";

export function getTargetLanguage(id: string): TargetLanguage | undefined {
  return TARGET_LANGUAGES.find((l) => l.id === id);
}

const CONTEXT_AWARE_PROMPT = `Before translating, read the full subtitle script in the user message to understand the overall plot, characters, relationships, tone, and recurring terms. Use that context for consistent names and wording. Translate only the lines in [SEGMENTS TO TRANSLATE]. Preserve natural tone and timing-friendly brevity.`;

export function buildDefaultSystemPrompt(languageId: string): string {
  const lang = getTargetLanguage(languageId);
  if (!lang || lang.id === "custom") {
    return `You are a professional subtitle translator. ${CONTEXT_AWARE_PROMPT}`;
  }
  return `You are a professional subtitle translator. ${CONTEXT_AWARE_PROMPT} Target language: ${lang.promptName}.`;
}

export function getTargetLanguageLabel(languageId: string): string {
  return getTargetLanguage(languageId)?.label ?? languageId;
}
