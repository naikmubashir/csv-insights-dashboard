import prisma from "./prisma";
import { ReportData } from "@/types";

export async function saveReport(data: ReportData) {
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
  } catch {
    return false;
  }
}
