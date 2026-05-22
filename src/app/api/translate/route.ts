import { NextRequest, NextResponse } from "next/server";
import { parseProvider, translate } from "@/lib/llm";
import { TranslateRequest } from "@/types/subtitle";

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json();
    const { model, systemPrompt, entries } = body;
    const provider = parseProvider(body.provider);

    if (!model) {
      return NextResponse.json({ error: "Model is required" }, { status: 400 });
    }

    const texts = entries.map((e) => e.text);
    const translated = await translate(provider, model, systemPrompt, texts);

    const translations = entries.map((entry, i) => ({
      index: entry.index,
      text: translated[i] || entry.text,
    }));

    return NextResponse.json({ translations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Translation failed" },
      { status: 500 }
    );
  }
}
