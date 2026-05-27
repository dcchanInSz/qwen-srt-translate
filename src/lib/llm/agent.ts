import { generateText, LanguageModel } from "ai";

function buildPrompt(
  entries: { index: number; text: string }[],
  fullContext: string[],
  sourceLanguage: string,
  targetLanguage: string
): string {
  const script = fullContext.map((line, i) => `${i + 1}. ${line}`).join("\n");
  const segments = entries.map((e) => e.text).join("\n---\n");

  return `[FULL SUBTITLE SCRIPT - context only, do NOT translate this section]
${script}

[SEGMENTS TO TRANSLATE]
${segments}

Translate each segment above from ${sourceLanguage} into ${targetLanguage}. Important rules:
- Output ONLY the translations, separated by "---" (three dashes on their own line)
- Do NOT include the original text
- Do NOT add arrows, prefixes, or numbering
- One translation per segment, in the same order as input`;
}

function splitTranslations(text: string): string[] {
  return text
    .split(/\n*-{3,}\n*/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function translateWithAgent(
  provider: LanguageModel,
  systemPrompt: string,
  entries: { index: number; text: string }[],
  fullContext: string[],
  sourceLanguage: string,
  targetLanguage: string
): Promise<{ index: number; text: string }[]> {
  console.log("[agent] starting translation", {
    segmentCount: entries.length,
    sourceLanguage,
    targetLanguage,
  });

  const prompt = buildPrompt(entries, fullContext, sourceLanguage, targetLanguage);

  const result = await generateText({
    model: provider,
    system: systemPrompt,
    prompt,
  });

  console.log("[agent] raw output length", result.text.length);

  const translatedTexts = splitTranslations(result.text);

  const results = entries.map((entry, i) => ({
    index: entry.index,
    text: translatedTexts[i] || "",
  }));

  const emptyIndices = results
    .map((r, i) => (!r.text.trim() ? i : -1))
    .filter((i) => i >= 0);

  if (emptyIndices.length > 0 && emptyIndices.length < entries.length) {
    console.log("[agent] retrying empty indices:", emptyIndices);
    const retryEntries = emptyIndices.map((i) => entries[i]);
    const retrySegments = retryEntries.map((e) => e.text).join("\n---\n");
    const retryPrompt = `Translate each segment from ${sourceLanguage} into ${targetLanguage}. Output ONLY translations separated by "---". Do NOT include original text.\n\n${retrySegments}`;

    try {
      const retryResult = await generateText({
        model: provider,
        system: systemPrompt,
        prompt: retryPrompt,
      });
      const retryParts = splitTranslations(retryResult.text);
      retryEntries.forEach((entry, ri) => {
        if (ri < retryParts.length && retryParts[ri]) {
          const idx = entries.findIndex((e) => e.index === entry.index);
          if (idx >= 0) results[idx].text = retryParts[ri];
        }
      });
    } catch {
      console.warn("[agent] retry failed for", emptyIndices);
    }
  }

  console.log("[agent] finished", {
    translated: results.filter((r) => r.text.trim()).length,
    empty: results.filter((r) => !r.text.trim()).length,
  });

  return results;
}
