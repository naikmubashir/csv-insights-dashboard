import { NextRequest, NextResponse } from "next/server";
import { generateInsights, askFollowUp } from "@/lib/gemini";
import { logger, generateRequestId } from "@/lib/logger";
import {
  AnalyzeRequestSchema,
  FollowUpRequestSchema,
  safeValidate,
} from "@/lib/validation";
import { sanitizeCSVData } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const body = await request.json();

    // ─── Follow-up Question ────────────────────────────────────────
    if (body.action === "followup") {
      const validation = safeValidate(FollowUpRequestSchema, body);
      if (!validation.success) {
        logger.warn("Follow-up request validation failed", {
          context: "api/analyze",
          requestId,
          metadata: { error: validation.error },
        });
        return NextResponse.json(
          { error: `Invalid request: ${validation.error}` },
          { status: 400 }
        );
      }

      const { question, headers, rows, previousInsights } = validation.data;
      const sanitizedRows = sanitizeCSVData(rows);

      logger.info("Processing follow-up question", {
        context: "api/analyze",
        requestId,
        metadata: { questionLength: question.length },
      });

      const answer = await askFollowUp(question, headers, sanitizedRows, previousInsights);
      return NextResponse.json({ answer });
    }

    // ─── Main Analysis ─────────────────────────────────────────────
    const validation = safeValidate(AnalyzeRequestSchema, body);
    if (!validation.success) {
      logger.warn("Analysis request validation failed", {
        context: "api/analyze",
        requestId,
        metadata: { error: validation.error },
      });
      return NextResponse.json(
        { error: `Invalid data format: ${validation.error}` },
        { status: 400 }
      );
    }

    const { headers, rows, selectedColumns } = validation.data;
    const sanitizedRows = sanitizeCSVData(rows);

    logger.info("Starting CSV analysis", {
      context: "api/analyze",
      requestId,
      metadata: {
        headers: headers.length,
        rows: rows.length,
        selectedColumns: selectedColumns?.length,
      },
    });

    const insights = await generateInsights(headers, sanitizedRows, selectedColumns);

    logger.info("Analysis completed successfully", {
      context: "api/analyze",
      requestId,
    });

    return NextResponse.json({ insights });
  } catch (error) {
    logger.error("Analysis failed", {
      context: "api/analyze",
      requestId,
      error,
    });
    return NextResponse.json(
      { error: "Failed to generate insights. Please try again." },
      { status: 500 }
    );
  }
}
