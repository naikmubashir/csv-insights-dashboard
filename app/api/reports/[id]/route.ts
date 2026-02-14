import { NextRequest, NextResponse } from "next/server";
import { getReportById } from "@/lib/db";
import { logger, generateRequestId } from "@/lib/logger";
import { ReportIdSchema, safeValidate } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();

  try {
    const { id } = await params;

    const validation = safeValidate(ReportIdSchema, { id });
    if (!validation.success) {
      logger.warn("Invalid report ID requested", {
        context: "api/reports/[id]",
        requestId,
        metadata: { id, error: validation.error },
      });
      return NextResponse.json(
        { error: "Invalid report ID" },
        { status: 400 }
      );
    }

    const reportId = parseInt(validation.data.id, 10);
    const report = await getReportById(reportId);

    if (!report) {
      logger.info("Report not found", {
        context: "api/reports/[id]",
        requestId,
        metadata: { reportId },
      });
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    logger.info("Report fetched", {
      context: "api/reports/[id]",
      requestId,
      metadata: { reportId },
    });

    return NextResponse.json({ report });
  } catch (error) {
    logger.error("Failed to fetch report", {
      context: "api/reports/[id]",
      requestId,
      error,
    });
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}
