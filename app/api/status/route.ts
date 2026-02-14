import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db";
import { checkGeminiHealth } from "@/lib/gemini";
import { logger, generateRequestId } from "@/lib/logger";

export async function GET() {
  const requestId = generateRequestId();

  try {
    const [dbHealthy, llmHealthy] = await Promise.all([
      checkDatabaseHealth(),
      checkGeminiHealth(),
    ]);

    const status = dbHealthy && llmHealthy ? "healthy" : "unhealthy";

    logger.info("Health check completed", {
      context: "api/status",
      requestId,
      metadata: { status, database: dbHealthy, llm: llmHealthy },
    });

    return NextResponse.json({
      status,
      database: {
        connected: dbHealthy,
        message: dbHealthy
          ? "PostgreSQL connected"
          : "Failed to connect to PostgreSQL",
      },
      llm: {
        connected: llmHealthy,
        message: llmHealthy
          ? "Gemini API responding"
          : "Failed to connect to Gemini API",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Health check failed", {
      context: "api/status",
      requestId,
      error,
    });
    return NextResponse.json(
      {
        status: "unhealthy",
        database: { connected: false, message: "Check failed" },
        llm: { connected: false, message: "Check failed" },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
