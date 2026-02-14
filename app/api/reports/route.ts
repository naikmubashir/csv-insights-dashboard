import { NextRequest, NextResponse } from "next/server";
import { saveReport, getReports } from "@/lib/db";
import { logger, generateRequestId } from "@/lib/logger";
import { SaveReportSchema, safeValidate } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const body = await request.json();

    const validation = safeValidate(SaveReportSchema, body);
    if (!validation.success) {
      logger.warn("Save report validation failed", {
        context: "api/reports",
        requestId,
        metadata: { error: validation.error },
      });
      return NextResponse.json(
        { error: `Invalid request: ${validation.error}` },
        { status: 400 }
      );
    }

    const data = validation.data;

    const report = await saveReport({
      filename: data.filename,
      rowCount: data.rowCount,
      columnCount: data.columnCount,
      columnsAnalyzed: data.columnsAnalyzed,
      insightsSummary: data.insightsSummary,
      trends: data.trends,
      outliers: data.outliers,
      recommendations: data.recommendations,
      csvPreviewJson: data.csvPreviewJson,
    });

    logger.info("Report saved successfully", {
      context: "api/reports",
      requestId,
      metadata: { reportId: report.id, filename: data.filename },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    logger.error("Failed to save report", {
      context: "api/reports",
      requestId,
      error,
    });
    return NextResponse.json(
      { error: "Failed to save report" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const requestId = generateRequestId();

  try {
    const reports = await getReports(5);

    logger.info("Reports fetched", {
      context: "api/reports",
      requestId,
      metadata: { count: reports.length },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    logger.error("Failed to fetch reports", {
      context: "api/reports",
      requestId,
      error,
    });
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
