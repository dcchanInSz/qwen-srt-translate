import { NextResponse } from "next/server";
import { getModels } from "@/lib/ollama";

export async function GET() {
  try {
    const models = await getModels();
    return NextResponse.json({ models });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
