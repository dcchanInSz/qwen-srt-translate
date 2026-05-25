import {
  BATCH_SEPARATOR,
  buildSystemContent,
  buildUserContent,
  LlmModel,
} from "./types";

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
  texts: string[],
  fullContext?: string[]
): Promise<string[]> {
  const userContent =
    fullContext && fullContext.length > 0
      ? buildUserContent(fullContext, texts)
      : texts.join(BATCH_SEPARATOR);

  const startedAt = Date.now();
  console.log("[translate:ollama] fetch start", {
    base: OLLAMA_BASE,
    model,
    segmentCount: texts.length,
    userContentChars: userContent.length,
    hasFullContext: Boolean(fullContext?.length),
    contextLines: fullContext?.length ?? 0,
  });

  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: buildSystemContent(systemPrompt) },
        { role: "user", content: userContent },
      ],
      stream: false,
    }),
  });

  const fetchMs = Date.now() - startedAt;
  if (!res.ok) {
    const errText = await res.text();
    console.error("[translate:ollama] fetch error", {
      fetchMs,
      status: res.status,
      errPreview: errText.slice(0, 200),
    });
    throw new Error(`Ollama translate error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const content: string = data.message?.content || "";
  const parts = content.split(BATCH_SEPARATOR).map((s: string) => s.trim());
  console.log("[translate:ollama] fetch done", {
    fetchMs,
    status: res.status,
    outputChars: content.length,
    partCount: parts.length,
  });

  return parts;
}
