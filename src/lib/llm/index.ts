import { translateWithAgent } from "./agent";
import { ollama as ollamaProvider, lmstudio as lmstudioProvider } from "./providers";
import { translate as googleTranslate } from "./google";
import { LlmModel, LlmProvider, parseProvider } from "./types";

export type { LlmModel, LlmProvider };
export { parseProvider, LLM_PROVIDERS } from "./types";

export async function getModels(provider: LlmProvider): Promise<LlmModel[]> {
  switch (provider) {
    case "lmstudio":
      return fetchModels(`${process.env.LM_STUDIO_BASE || "http://localhost:1234"}/v1/models`);
    case "ollama":
      return fetchModels(`${process.env.OLLAMA_BASE || "http://localhost:11434"}/api/tags`, "ollama");
    default:
      return [];
  }
}

async function fetchModels(url: string, provider?: string): Promise<LlmModel[]> {
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (provider === "ollama") {
      return (data.models || []).map((m: { name: string }) => ({ name: m.name }));
    }
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
  targetLanguage: string
): Promise<string[]> {
  if (provider === "google") {
    return googleTranslate(texts, targetLanguage);
  }

  const providerModel = provider === "lmstudio"
    ? lmstudioProvider(model)
    : ollamaProvider(model);

  const results = await translateWithAgent(
    providerModel,
    systemPrompt,
    texts.map((text, index) => ({ index, text })),
    fullContext,
    targetLanguage
  );

  return results.map((r) => r.text);
}
