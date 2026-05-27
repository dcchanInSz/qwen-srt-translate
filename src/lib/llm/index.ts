import { translateWithAgent } from "./agent";
import { createProviderModel } from "./providers";
import { translate as googleTranslate } from "./google";
import { LlmModel, LlmProvider, parseProvider, ProviderConfig } from "./types";

export type { LlmModel, LlmProvider, ProviderConfig };
export { parseProvider, LLM_PROVIDERS, DEFAULT_PROVIDER_CONFIGS } from "./types";

export async function getModels(
  provider: LlmProvider,
  config: ProviderConfig
): Promise<LlmModel[]> {
  switch (provider) {
    case "ollama":
      return fetchOllamaModels(`${config.baseUrl}/api/tags`);
    case "lmstudio":
      return fetchOpenAIModels(`${config.baseUrl}/v1/models`);
    case "openai":
      return fetchOpenAIModels(`${config.baseUrl}/models`, config.apiKey);
    case "anthropic":
      return fetchAnthropicModels(config.baseUrl, config.apiKey);
    default:
      return [];
  }
}

async function fetchJson(url: string, headers?: Record<string, string>) {
  const res = await fetch(url, { headers });
  return res.json();
}

async function fetchOllamaModels(url: string): Promise<LlmModel[]> {
  try {
    const data = await fetchJson(url);
    return (data.models || []).map((m: { name: string }) => ({ name: m.name }));
  } catch {
    return [];
  }
}

async function fetchOpenAIModels(url: string, apiKey?: string): Promise<LlmModel[]> {
  try {
    const headers: Record<string, string> = {};
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    const data = await fetchJson(url, headers);
    return (data.data || []).map((m: { id: string }) => ({ name: m.id }));
  } catch {
    return [];
  }
}

async function fetchAnthropicModels(baseUrl: string, apiKey: string): Promise<LlmModel[]> {
  try {
    const headers: Record<string, string> = {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    };
    const data = await fetchJson(`${baseUrl}/models`, headers);
    return (data.data || []).map((m: { id: string }) => ({ name: m.id }));
  } catch {
    return [];
  }
}

export async function translate(
  provider: LlmProvider,
  model: string,
  systemPrompt: string,
  texts: string[],
  fullContext: string[],
  sourceLanguage: string,
  targetLanguage: string,
  config: ProviderConfig
): Promise<string[]> {
  if (provider === "google") {
    return googleTranslate(texts, sourceLanguage, targetLanguage);
  }

  const providerModel = createProviderModel(provider, model, config);

  const results = await translateWithAgent(
    providerModel,
    systemPrompt,
    texts.map((text, index) => ({ index, text })),
    fullContext,
    sourceLanguage,
    targetLanguage
  );

  return results.map((r) => r.text);
}
