import * as lmstudio from "./lmstudio";
import * as ollama from "./ollama";
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
  }
}

export async function translate(
  provider: LlmProvider,
  model: string,
  systemPrompt: string,
  texts: string[],
  fullContext?: string[]
): Promise<string[]> {
  switch (provider) {
    case "lmstudio":
      return lmstudio.translate(model, systemPrompt, texts, fullContext);
    case "ollama":
      return ollama.translate(model, systemPrompt, texts, fullContext);
  }
}
