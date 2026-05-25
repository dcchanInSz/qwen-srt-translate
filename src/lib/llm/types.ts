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

Rules:
1. [FULL SUBTITLE SCRIPT] is context only—read it to understand the story; do not translate it.
2. Translate only the lines in [SEGMENTS TO TRANSLATE].
3. Segments to translate are separated by "---". Return translations with the same "---" separators, one translation per segment.
4. Do not add explanations or extra text.
5. Do NOT think step by step. Return only the translation results directly, without any reasoning, analysis, or thinking process.`;
}

export function buildUserContent(fullContext: string[], texts: string[]): string {
  const script = fullContext
    .map((line, i) => `${i + 1}. ${line}`)
    .join("\n");
  const segments = texts.join(BATCH_SEPARATOR);

  return `[FULL SUBTITLE SCRIPT - for context only, do not translate]
${script}

[SEGMENTS TO TRANSLATE - translate only these lines, return translations separated by "---", no thinking, no explanations]
${segments}`;
}

export function parseProvider(value: string | null | undefined): LlmProvider {
  return value === "lmstudio" ? "lmstudio" : "ollama";
}
