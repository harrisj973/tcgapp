import { NextRequest, NextResponse } from "next/server";
import { getAIAnalysis } from "@/lib/ai-analysis";
import { Deck } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { deck } = await req.json() as { deck: Deck };

    if (!deck) {
      return NextResponse.json({ error: "No deck provided" }, { status: 400 });
    }

    const result = await getAIAnalysis(deck);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
