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
  const rawParts = content.split(BATCH_SEPARATOR);
  let parts = rawParts.map((s: string) => s.trim());

  while (parts.length > 0 && parts[0] === "") parts.shift();
  while (parts.length > 0 && parts[parts.length - 1] === "") parts.pop();

  console.log("[translate:lmstudio] fetch done", {
    fetchMs,
    status: res.status,
    outputChars: content.length,
    expectedCount: texts.length,
    rawPartCount: rawParts.length,
    partCount: parts.length,
  });
  console.log("[translate:lmstudio] raw content (first 800 chars):", content.slice(0, 800));
  if (parts.length !== texts.length) {
    console.warn("[translate:lmstudio] part count mismatch", {
      expected: texts.length,
      actual: parts.length,
      rawActual: rawParts.length,
      contentPreview: content.slice(0, 800),
    });
    console.warn("[translate:lmstudio] all raw parts:", JSON.stringify(rawParts));
    console.warn("[translate:lmstudio] trimmed parts:", JSON.stringify(parts));
  }

  // Attach raw LM Studio debug info for the API route to pass to the client
  (parts as any).__lmstudioPreview = content.slice(0, 500);
  (parts as any).__lmstudioResponse = JSON.stringify(data).slice(0, 1000);

  return parts;
}
