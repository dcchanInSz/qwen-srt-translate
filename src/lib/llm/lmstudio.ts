import {
  BATCH_SEPARATOR,
  buildSystemContent,
  buildUserContent,
  LlmModel,
} from "./types";

const LM_STUDIO_BASE = process.env.LM_STUDIO_BASE || "http://localhost:1234/v1";

export async function getModels(): Promise<LlmModel[]> {
  const res = await fetch(`${LM_STUDIO_BASE}/models`);
  if (!res.ok) throw new Error(`LM Studio API error: ${res.status}`);
  const data = await res.json();
  return (data.data || []).map((m: { id: string }) => ({ name: m.id }));
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
  console.log("[translate:lmstudio] fetch start", {
    base: LM_STUDIO_BASE,
    model,
    segmentCount: texts.length,
    userContentChars: userContent.length,
    hasFullContext: Boolean(fullContext?.length),
    contextLines: fullContext?.length ?? 0,
  });

  const res = await fetch(`${LM_STUDIO_BASE}/chat/completions`, {
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
    console.error("[translate:lmstudio] fetch error", {
      fetchMs,
      status: res.status,
      errPreview: errText.slice(0, 200),
    });
    throw new Error(`LM Studio translate error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content || "";
  const parts = content
    .split(BATCH_SEPARATOR)
    .map((s: string) => s.trim())
    .filter(Boolean);
  console.log("[translate:lmstudio] fetch done", {
    fetchMs,
    status: res.status,
    outputChars: content.length,
    partCount: parts.length,
    expectedCount: texts.length,
  });

  if (parts.length !== texts.length) {
    console.warn("[translate:lmstudio] part count mismatch", {
      expected: texts.length,
      actual: parts.length,
      contentPreview: content.slice(0, 300),
    });
  }

  return parts;
}
