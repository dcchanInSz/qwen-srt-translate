import { NextRequest, NextResponse } from "next/server";
import { parseProvider, translate } from "@/lib/llm";
import type { TranslateRequest } from "@/types/subtitle";

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const body: TranslateRequest = await request.json();
    const { model, systemPrompt, context, entries, targetLanguages } = body;
    const provider = parseProvider(body.provider);

    console.log("[translate] request received", {
      provider,
      model,
      entryCount: entries?.length ?? 0,
      contextLines: context?.length ?? 0,
      targetLanguages,
    });

    if (provider !== "google" && !model) {
      return NextResponse.json({ error: "请选择模型" }, { status: 400 });
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
        const langPrompt = systemPrompt.includes("Target language:")
          ? systemPrompt
          : `${systemPrompt}\nTarget language: ${lang}.`;

        const translated = await translate(
          provider,
          model,
          langPrompt,
          texts,
          context,
          lang
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
          error: err instanceof Error ? err.message : "翻译失败",
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
      { error: error instanceof Error ? error.message : "翻译失败" },
      { status: 500 }
    );
  }
}
