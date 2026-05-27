import { NextRequest, NextResponse } from "next/server";
import { parseProvider, translate } from "@/lib/llm";
import type { TranslateRequest } from "@/types/subtitle";

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const body: TranslateRequest = await request.json();
    const { model, systemPrompt, context, entries, targetLanguages, sourceLanguage, providerConfig } = body;
    const provider = parseProvider(body.provider);

    console.log("[translate] request received", {
      provider,
      model,
      entryCount: entries?.length ?? 0,
      contextLines: context?.length ?? 0,
      targetLanguages,
      sourceLanguage,
    });

    if (provider !== "google" && !model) {
      return NextResponse.json({ error: "No model selected" }, { status: 400 });
    }

    const texts = entries.map((e) => e.text);

    const results: Record<string, { index: number; text: string }[]> = {};
    const errors: Record<string, string> = {};

    const translations: { lang: string; items: { index: number; text: string }[]; error: string | null }[] = [];

    for (let i = 0; i < targetLanguages.length; i++) {
      if (i > 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }
      const lang = targetLanguages[i];
      try {
        const translated = await translate(
          provider,
          model,
          systemPrompt,
          texts,
          context,
          sourceLanguage,
          lang,
          providerConfig
        );

        const items = entries.map((entry, j) => ({
          index: entry.index,
          text: translated[j] ?? "",
        }));

        translations.push({ lang, items, error: null });
      } catch (err) {
        translations.push({
          lang,
          items: [],
          error: err instanceof Error ? err.message : "Translation failed",
        });
      }
    }

    for (const t of translations) {
      if (t.error) {
        errors[t.lang] = t.error;
      }
      results[t.lang] = t.items;
    }

    console.log("[translate] success", {
      totalMs: Date.now() - startedAt,
      languages: Object.keys(results).length,
      errors: Object.keys(errors).length,
    });

    return NextResponse.json({ results, errors: Object.keys(errors).length > 0 ? errors : undefined });
  } catch (error) {
    console.error("[translate] failed", {
      totalMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Translation failed" },
      { status: 500 }
    );
  }
}
