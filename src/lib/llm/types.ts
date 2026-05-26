export type LlmProvider = "ollama" | "lmstudio" | "google";

export interface LlmModel {
  name: string;
}

export const LLM_PROVIDERS: { id: LlmProvider; label: string }[] = [
  { id: "google", label: "Google 翻译" },
  { id: "ollama", label: "Ollama" },
  { id: "lmstudio", label: "LM Studio" },
];

export function parseProvider(value: string | null | undefined): LlmProvider {
  if (value === "lmstudio" || value === "google") return value;
  return "ollama";
}
