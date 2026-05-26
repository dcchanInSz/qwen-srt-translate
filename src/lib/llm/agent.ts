import { generateText, stepCountIs, LanguageModel } from "ai";
import { checkEmpty } from "./tools";

const BATCH_SEPARATOR = "\n---\n";

function buildTranslationPrompt(
  entries: { index: number; text: string }[],
  fullContext: string[],
  targetLanguage: string
): string {
  const script = fullContext.map((line, i) => `${i + 1}. ${line}`).join("\n");
  const segments = entries.map((e) => e.text).join(BATCH_SEPARATOR);

  return `[FULL SUBTITLE SCRIPT - for context only, do not translate]
${script}

[SEGMENTS TO TRANSLATE]
${segments}

Translate the ${entries.length} segments above into ${targetLanguage}. Return translations separated by "---", one per segment, in the same order.
After translating, call the checkEmpty tool with all translations to verify none are empty. If any are empty, retranslate those and check again.`;
}

export async function translateWithAgent(
  provider: LanguageModel,
  systemPrompt: string,
  entries: { index: number; text: string }[],
  fullContext: string[],
  targetLanguage: string
): Promise<{ index: number; text: string }[]> {
  console.log("[agent] starting translation", {
    segmentCount: entries.length,
    targetLanguage,
  });

  const prompt = buildTranslationPrompt(entries, fullContext, targetLanguage);

  const result = await generateText({
    model: provider,
    system: systemPrompt,
    prompt,
    stopWhen: stepCountIs(5),
    tools: { checkEmpty },
  });

  console.log("[agent] finished", {
    steps: result.steps?.length,
    textLength: result.text.length,
  });

  const translatedTexts = result.text.split(BATCH_SEPARATOR).map((t) => t.trim());

  return entries.map((entry, i) => ({
    index: entry.index,
    text: translatedTexts[i] ?? "",
  }));
}
