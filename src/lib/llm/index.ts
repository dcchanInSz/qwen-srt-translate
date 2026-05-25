import * as lmstudio from "./lmstudio";
import * as ollama from "./ollama";
import * as google from "./google";
import { LlmModel, LlmProvider, parseProvider } from "./types";

export {
  BATCH_SEPARATOR,
  buildSystemContent,
  buildUserContent,
  LLM_PROVIDERS,
  parseProvider,
  type LlmModel,
  type LlmProvider,
} from "./types";

export async function getModels(provider: LlmProvider): Promise<LlmModel[]> {
  switch (provider) {
    case "lmstudio":
      return lmstudio.getModels();
    case "ollama":
      return ollama.getModels();
    default:
      return [];
  }
}

export async function translate(
  provider: LlmProvider,
  model: string,
  systemPrompt: string,
  texts: string[],
  fullContext?: string[],
  targetLanguage?: string
): Promise<string[]> {
  switch (provider) {
    case "lmstudio":
      return lmstudio.translate(model, systemPrompt, texts, fullContext);
    case "ollama":
      return ollama.translate(model, systemPrompt, texts, fullContext);
    case "google":
      return google.translate(texts, targetLanguage || "zh");
  }
}
