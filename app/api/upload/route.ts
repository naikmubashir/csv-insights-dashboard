import { NextRequest, NextResponse } from "next/server";
import { logger, generateRequestId } from "@/lib/logger";
import { sanitizeFilename } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      logger.warn("Upload attempted with no file", { context: "api/upload", requestId });
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      logger.warn("Upload rejected: invalid file type", {
        context: "api/upload",
        requestId,
        metadata: { filename: file.name },
      });
      return NextResponse.json(
        { error: "Only CSV files are supported" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      logger.warn("Upload rejected: file too large", {
        context: "api/upload",
        requestId,
        metadata: { size: file.size },
      });
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    const safeFilename = sanitizeFilename(file.name);
    const text = await file.text();

    logger.info("File uploaded successfully", {
      context: "api/upload",
      requestId,
      metadata: { filename: safeFilename, size: file.size },
    });

    return NextResponse.json({
      success: true,
      filename: safeFilename,
      size: file.size,
      content: text,
    });
  } catch (error) {
    logger.error("Upload processing failed", {
      context: "api/upload",
      requestId,
      error,
    });
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
