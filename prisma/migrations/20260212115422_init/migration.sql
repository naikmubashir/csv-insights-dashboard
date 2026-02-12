-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "row_count" INTEGER,
    "column_count" INTEGER,
    "columns_analyzed" TEXT[],
    "insights_summary" TEXT,
    "trends" TEXT,
    "outliers" TEXT,
    "recommendations" TEXT,
    "csv_preview_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);
