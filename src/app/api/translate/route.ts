import { NextRequest, NextResponse } from "next/server";
import { parseProvider, translate } from "@/lib/llm";
import { TranslateRequest } from "@/types/subtitle";

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const body: TranslateRequest = await request.json();
    const { model, systemPrompt, context, entries } = body;
    const provider = parseProvider(body.provider);

    console.log("[translate] request received", {
      provider,
      model,
      entryCount: entries?.length ?? 0,
      contextLines: context?.length ?? 0,
      systemPromptChars: systemPrompt?.length ?? 0,
    });

    if (!model) {
      return NextResponse.json({ error: "请选择模型" }, { status: 400 });
    }

    const texts = entries.map((e) => e.text);
    const textChars = texts.reduce((n, t) => n + t.length, 0);
    console.log("[translate] calling LLM", {
      segmentCount: texts.length,
      segmentTextChars: textChars,
    });

    const llmStartedAt = Date.now();
    const translated = await translate(
      provider,
      model,
      systemPrompt,
      texts,
      context
    );
    console.log("[translate] LLM finished", {
      llmMs: Date.now() - llmStartedAt,
      resultCount: translated.length,
      mismatch: translated.length !== texts.length,
    });

    const translations = entries.map((entry, i) => ({
      index: entry.index,
      text: translated[i] ?? "",
    }));

    console.log("[translate] success", { totalMs: Date.now() - startedAt });
    return NextResponse.json({ translations });
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
