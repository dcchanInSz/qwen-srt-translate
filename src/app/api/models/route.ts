import { NextRequest, NextResponse } from "next/server";
import { getModels, parseProvider } from "@/lib/llm";

export async function GET(request: NextRequest) {
  try {
    const provider = parseProvider(request.nextUrl.searchParams.get("provider"));
    const models = await getModels(provider);
    return NextResponse.json({ models, provider });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
