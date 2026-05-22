export type LlmProvider = "ollama" | "lmstudio";

export interface LlmModel {
  name: string;
}

export const LLM_PROVIDERS: { id: LlmProvider; label: string }[] = [
  { id: "ollama", label: "Ollama" },
  { id: "lmstudio", label: "LM Studio" },
];

export const BATCH_SEPARATOR = "\n---\n";

export function buildSystemContent(systemPrompt: string): string {
  return `${systemPrompt}

重要规则：我会给你多段文本，每段用 "---" 分隔。请翻译每一段，保持相同的分隔符格式。不要添加任何额外解释。`;
}

export function parseProvider(value: string | null | undefined): LlmProvider {
  return value === "lmstudio" ? "lmstudio" : "ollama";
}
