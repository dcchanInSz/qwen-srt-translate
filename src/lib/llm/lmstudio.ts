import { BATCH_SEPARATOR, buildSystemContent, LlmModel } from "./types";

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
  texts: string[]
): Promise<string[]> {
  const combined = texts.join(BATCH_SEPARATOR);

  const res = await fetch(`${LM_STUDIO_BASE}/chat/completions`, {
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
    throw new Error(`LM Studio translate error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content || "";

  return content.split(BATCH_SEPARATOR).map((s: string) => s.trim());
}
