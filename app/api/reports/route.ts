import { NextRequest, NextResponse } from "next/server";
import { saveReport, getReports } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      filename,
      rowCount,
      columnCount,
      columnsAnalyzed,
      insightsSummary,
      trends,
      outliers,
      recommendations,
      csvPreviewJson,
    } = body;

    if (!filename || !insightsSummary) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const report = await saveReport({
      filename,
      rowCount: rowCount || 0,
      columnCount: columnCount || 0,
      columnsAnalyzed: columnsAnalyzed || [],
      insightsSummary,
      trends: trends || "",
      outliers: outliers || "",
      recommendations: recommendations || "",
      csvPreviewJson: csvPreviewJson || [],
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Save report error:", error);
    return NextResponse.json(
      { error: "Failed to save report" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reports = await getReports(5);
    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Get reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
