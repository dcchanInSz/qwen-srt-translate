import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";
import type { LlmProvider, ProviderConfig } from "./types";

export function createProviderModel(
  provider: LlmProvider,
  model: string,
  config: ProviderConfig
): LanguageModel {
  switch (provider) {
    case "ollama":
    case "lmstudio":
      return createOpenAICompatible({
        baseURL: `${config.baseUrl}/v1`,
        name: provider,
      })(model);
    case "openai":
      return createOpenAICompatible({
        baseURL: config.baseUrl,
        apiKey: config.apiKey,
        name: "openai",
      })(model);
    case "anthropic":
      return createAnthropic({
        baseURL: config.baseUrl,
        apiKey: config.apiKey,
      })(model);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
