import { NextRequest, NextResponse } from "next/server";
import { generateInsights, askFollowUp } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "followup") {
      const { question, headers, rows, previousInsights } = body;

      if (!question || !headers || !rows || !previousInsights) {
        return NextResponse.json(
          { error: "Missing required fields for follow-up" },
          { status: 400 }
        );
      }

      const answer = await askFollowUp(question, headers, rows, previousInsights);
      return NextResponse.json({ answer });
    }

    const { headers, rows, selectedColumns } = body;

    if (!headers || !rows || !Array.isArray(headers) || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: "Invalid data format. Expected headers and rows arrays." },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No data rows provided" },
        { status: 400 }
      );
    }

    const insights = await generateInsights(headers, rows, selectedColumns);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights. Please check your Gemini API key." },
      { status: 500 }
    );
  }
}
