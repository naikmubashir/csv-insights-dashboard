import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db";
import { checkGeminiHealth } from "@/lib/gemini";

export async function GET() {
  try {
    const [dbHealthy, llmHealthy] = await Promise.all([
      checkDatabaseHealth(),
      checkGeminiHealth(),
    ]);

    const status = dbHealthy && llmHealthy ? "healthy" : "unhealthy";

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
    console.error("Status check error:", error);
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
