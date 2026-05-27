export type LlmProvider = "ollama" | "lmstudio" | "google" | "openai" | "anthropic";

export interface LlmModel {
  name: string;
}

export interface ProviderConfig {
  baseUrl: string;
  apiKey: string;
}

export const LLM_PROVIDERS: { id: LlmProvider; label: string; needsApiKey: boolean }[] = [
  { id: "google", label: "Google 翻译", needsApiKey: false },
  { id: "ollama", label: "Ollama", needsApiKey: false },
  { id: "lmstudio", label: "LM Studio", needsApiKey: false },
  { id: "openai", label: "OpenAI", needsApiKey: true },
  { id: "anthropic", label: "Anthropic", needsApiKey: true },
];

export const DEFAULT_PROVIDER_CONFIGS: Record<LlmProvider, ProviderConfig> = {
  ollama: { baseUrl: "http://localhost:11434", apiKey: "" },
  lmstudio: { baseUrl: "http://localhost:1234", apiKey: "" },
  openai: { baseUrl: "https://api.openai.com/v1", apiKey: "" },
  anthropic: { baseUrl: "https://api.anthropic.com/v1", apiKey: "" },
  google: { baseUrl: "", apiKey: "" },
};

export function parseProvider(value: string | null | undefined): LlmProvider {
  const valid: LlmProvider[] = ["ollama", "lmstudio", "google", "openai", "anthropic"];
  if (valid.includes(value as LlmProvider)) return value as LlmProvider;
  return "ollama";
}
