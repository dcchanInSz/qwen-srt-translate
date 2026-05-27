import { NextRequest, NextResponse } from "next/server";
import { getModels, parseProvider } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const provider = parseProvider(body.provider);
    const config = body.config || {};
    const models = await getModels(provider, {
      baseUrl: config.baseUrl || "",
      apiKey: config.apiKey || "",
    });
    return NextResponse.json({ models, provider });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
