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

// Extract translations from reasoning model's thinking text
function extractTranslations(text: string, expectedCount: number): string[] | null {
  // Strategy 1: Try splitting by --- separator (standard format)
  const bySeparator = text
    .split(BATCH_SEPARATOR)
    .map((s) => s.trim())
    .filter(Boolean);
  if (bySeparator.length === expectedCount) return bySeparator;

  // Strategy 2: Extract text after -> arrows (common in Qwen reasoning output)
  const arrowRegex = /->\s*(.+)/g;
  const arrowMatches = [...text.matchAll(arrowRegex)].map((m) => m[1].trim());
  if (arrowMatches.length === expectedCount) return arrowMatches;

  // Strategy 3: Find "Drafting Translations:" or translation section,
  // then extract text after ->
  const sectionMatch = text.match(
    /(?:Drafting Translations?|翻译结果|Translations?|译文)[:\s]*([\s\S]+?)(?:\n\n|\n(?!\s*\d\.))/
  );
  if (sectionMatch) {
    const section = sectionMatch[1];
    const fromArrow = [...section.matchAll(/->\s*(.+)/g)].map((m) => m[1].trim());
    if (fromArrow.length === expectedCount) return fromArrow;
  }

  // Strategy 4: Look for numbered lines with translations
  // Pattern: <number>. <source> -> <target> or <number>. <source>\n<target>
  const numberedTranslations: string[] = [];
  const lines = text.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    const numMatch = line.match(/^\d+[.、]\s*(.+)$/);
    if (numMatch) {
      const rest = numMatch[1];
      const arrowIdx = rest.indexOf("->");
      if (arrowIdx !== -1) {
        numberedTranslations.push(rest.slice(arrowIdx + 2).trim());
      }
    }
    i++;
  }
  if (numberedTranslations.length === expectedCount) return numberedTranslations;

  return null;
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
      max_tokens: 16384,
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
  const message = data.choices?.[0]?.message || {};
  const content = (message.content || "").trim();
  const reasoning = (message.reasoning_content || "").trim();

  console.log("[translate:lmstudio] full message", {
    hasContent: Boolean(content),
    contentChars: content.length,
    hasReasoning: Boolean(reasoning),
    reasoningChars: reasoning.length,
    rawTextPreview: (content || reasoning).slice(0, 200),
  });

  // Build candidate texts to try extracting from
  const candidates = [content];
  if (reasoning) candidates.push(reasoning);

  let parts: string[] = [];
  let extractionSource = "content";

  for (const candidate of candidates) {
    const result = extractTranslations(candidate, texts.length);
    if (result) {
      parts = result;
      extractionSource = candidate === content ? "content" : "reasoning_content";
      break;
    }
  }

  // If extraction failed entirely, fall back to basic split on the best candidate
  if (parts.length === 0) {
    const rawText = content || reasoning;
    parts = rawText.split(BATCH_SEPARATOR).map((s: string) => s.trim());
    while (parts.length > 0 && parts[0] === "") parts.shift();
    while (parts.length > 0 && parts[parts.length - 1] === "") parts.pop();
    extractionSource = content ? "content" : "reasoning_content";
  }

  console.log("[translate:lmstudio] fetch done", {
    fetchMs,
    status: res.status,
    expectedCount: texts.length,
    partCount: parts.length,
    extractionSource,
  });
  if (parts.length !== texts.length) {
    console.warn("[translate:lmstudio] part count mismatch", {
      expected: texts.length,
      actual: parts.length,
      extractionSource,
      reasoningPreview: reasoning.slice(0, 800),
    });
  }

  // Attach raw LM Studio debug info for the API route to pass to the client
  (parts as any).__lmstudioPreview = (content || reasoning).slice(0, 500);
  (parts as any).__lmstudioResponse = JSON.stringify(data).slice(0, 2000);

  return parts;
}
