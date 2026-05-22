import { BATCH_SEPARATOR, buildSystemContent, LlmModel } from "./types";

const OLLAMA_BASE = process.env.OLLAMA_BASE || "http://localhost:11434";

export async function getModels(): Promise<LlmModel[]> {
  const res = await fetch(`${OLLAMA_BASE}/api/tags`);
  if (!res.ok) throw new Error(`Ollama API error: ${res.status}`);
  const data = await res.json();
  return (data.models || []).map((m: { name: string }) => ({ name: m.name }));
}

export async function translate(
  model: string,
  systemPrompt: string,
  texts: string[]
): Promise<string[]> {
  const combined = texts.join(BATCH_SEPARATOR);

  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: buildSystemContent(systemPrompt) },
        { role: "user", content: combined },
      ],
      stream: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama translate error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const content: string = data.message?.content || "";

  return content.split(BATCH_SEPARATOR).map((s: string) => s.trim());
}
