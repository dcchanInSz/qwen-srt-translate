import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const ollama = createOpenAICompatible({
  baseURL: `${process.env.OLLAMA_BASE || "http://localhost:11434"}/v1`,
  name: "ollama",
});

export const lmstudio = createOpenAICompatible({
  baseURL: `${process.env.LM_STUDIO_BASE || "http://localhost:1234"}/v1`,
  name: "lmstudio",
});
