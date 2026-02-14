/**
 * Zod Validation Schemas
 *
 * Structured output validation for AI responses and API inputs.
 * Ensures type safety and data integrity at every boundary.
 */

import { z } from "zod";

// ─── AI Output Schemas ───────────────────────────────────────────────

export const InsightsResponseSchema = z.object({
  summary: z
    .string()
    .min(1, "Summary must not be empty")
    .max(5000, "Summary exceeds maximum length"),
  trends: z
    .string()
    .min(1, "Trends must not be empty")
    .max(5000, "Trends exceeds maximum length"),
  outliers: z
    .string()
    .min(1, "Outliers must not be empty")
    .max(5000, "Outliers exceeds maximum length"),
  recommendations: z
    .string()
    .min(1, "Recommendations must not be empty")
    .max(5000, "Recommendations exceeds maximum length"),
});

export type ValidatedInsightsResponse = z.infer<typeof InsightsResponseSchema>;

// ─── API Input Schemas ───────────────────────────────────────────────

export const UploadFileSchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[\w\-. ]+\.csv$/i, "Invalid filename format"),
  size: z.number().positive().max(10 * 1024 * 1024, "File exceeds 10MB limit"),
});

export const AnalyzeRequestSchema = z.object({
  headers: z.array(z.string().max(255)).min(1, "At least one header required").max(500),
  rows: z
    .array(z.record(z.string(), z.string().max(10000)))
    .min(1, "At least one row required")
    .max(100000),
  selectedColumns: z.array(z.string().max(255)).optional(),
});

export const FollowUpRequestSchema = z.object({
  action: z.literal("followup"),
  question: z
    .string()
    .min(1, "Question must not be empty")
    .max(1000, "Question exceeds maximum length"),
  headers: z.array(z.string().max(255)).min(1),
  rows: z.array(z.record(z.string(), z.string().max(10000))).min(1),
  previousInsights: InsightsResponseSchema,
});

export const SaveReportSchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[\w\-. ]+\.csv$/i, "Invalid filename"),
  rowCount: z.number().int().nonnegative().default(0),
  columnCount: z.number().int().nonnegative().default(0),
  columnsAnalyzed: z.array(z.string().max(255)).default([]),
  insightsSummary: z.string().min(1, "Insights summary required").max(10000),
  trends: z.string().max(10000).default(""),
  outliers: z.string().max(10000).default(""),
  recommendations: z.string().max(10000).default(""),
  csvPreviewJson: z.array(z.record(z.string(), z.string())).default([]),
});

export const ReportIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Report ID must be a number"),
});

// ─── Validation Helpers ──────────────────────────────────────────────

/**
 * Safely parse and validate data against a Zod schema.
 * Returns a discriminated union of success/error.
 */
export function safeValidate<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const messages = result.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  return { success: false, error: messages };
}
