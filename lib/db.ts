import prisma from "./prisma";
import { ReportData } from "@/types";
import { logger } from "@/lib/logger";

export async function saveReport(data: ReportData) {
  logger.debug("Saving report to database", {
    context: "db",
    metadata: { filename: data.filename },
  });

  const report = await prisma.report.create({
    data: {
      filename: data.filename,
      rowCount: data.rowCount,
      columnCount: data.columnCount,
      columnsAnalyzed: data.columnsAnalyzed,
      insightsSummary: data.insightsSummary,
      trends: data.trends,
      outliers: data.outliers,
      recommendations: data.recommendations,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      csvPreviewJson: data.csvPreviewJson as any,
    },
  });

  logger.info("Report saved", {
    context: "db",
    metadata: { reportId: report.id },
  });

  return report;
}

export async function getReports(limit: number = 5) {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return reports;
}

export async function getReportById(id: number) {
  const report = await prisma.report.findUnique({
    where: { id },
  });
  return report;
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return true;
  } catch (err) {
    logger.error("Database health check failed", {
      context: "db",
      error: err,
    });
    return false;
  }
}
