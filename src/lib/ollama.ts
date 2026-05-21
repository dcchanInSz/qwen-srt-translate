const OLLAMA_BASE = process.env.OLLAMA_BASE || "http://localhost:11434";

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

export async function getModels(): Promise<OllamaModel[]> {
  const res = await fetch(`${OLLAMA_BASE}/api/tags`);
  if (!res.ok) throw new Error(`Ollama API error: ${res.status}`);
  const data = await res.json();
  return data.models || [];
}

export async function translate(
  model: string,
  systemPrompt: string,
  texts: string[]
): Promise<string[]> {
  const separator = "\n---\n";
  const combined = texts.join(separator);

  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: `${systemPrompt}

重要规则：我会给你多段文本，每段用 "---" 分隔。请翻译每一段，保持相同的分隔符格式。不要添加任何额外解释。`,
        },
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

  return content.split("\n---\n").map((s: string) => s.trim());
}
