import { describe, it, expect } from "vitest";
import {
  InsightsResponseSchema,
  AnalyzeRequestSchema,
  FollowUpRequestSchema,
  SaveReportSchema,
  ReportIdSchema,
  UploadFileSchema,
  safeValidate,
} from "@/lib/validation";

describe("InsightsResponseSchema", () => {
  it("validates a correct insights response", () => {
    const data = {
      summary: "This is a summary of the data.",
      trends: "Upward trend in sales.",
      outliers: "One outlier found in row 42.",
      recommendations: "Increase marketing budget.",
    };
    const result = safeValidate(InsightsResponseSchema, data);
    expect(result.success).toBe(true);
  });

  it("rejects empty summary", () => {
    const data = {
      summary: "",
      trends: "Some trends",
      outliers: "Some outliers",
      recommendations: "Some recs",
    };
    const result = safeValidate(InsightsResponseSchema, data);
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const data = { summary: "Only summary" };
    const result = safeValidate(InsightsResponseSchema, data);
    expect(result.success).toBe(false);
  });

  it("rejects overly long fields", () => {
    const data = {
      summary: "x".repeat(6000),
      trends: "trends",
      outliers: "outliers",
      recommendations: "recs",
    };
    const result = safeValidate(InsightsResponseSchema, data);
    expect(result.success).toBe(false);
  });

  it("rejects non-string fields", () => {
    const data = {
      summary: 123,
      trends: "trends",
      outliers: "outliers",
      recommendations: "recs",
    };
    const result = safeValidate(InsightsResponseSchema, data);
    expect(result.success).toBe(false);
  });
});

describe("AnalyzeRequestSchema", () => {
  it("validates correct analysis request", () => {
    const data = {
      headers: ["name", "age"],
      rows: [{ name: "John", age: "30" }],
    };
    const result = safeValidate(AnalyzeRequestSchema, data);
    expect(result.success).toBe(true);
  });

  it("accepts optional selectedColumns", () => {
    const data = {
      headers: ["name", "age", "city"],
      rows: [{ name: "John", age: "30", city: "NYC" }],
      selectedColumns: ["name", "age"],
    };
    const result = safeValidate(AnalyzeRequestSchema, data);
    expect(result.success).toBe(true);
  });

  it("rejects empty headers", () => {
    const data = {
      headers: [],
      rows: [{ name: "John" }],
    };
    const result = safeValidate(AnalyzeRequestSchema, data);
    expect(result.success).toBe(false);
  });

  it("rejects empty rows", () => {
    const data = {
      headers: ["name"],
      rows: [],
    };
    const result = safeValidate(AnalyzeRequestSchema, data);
    expect(result.success).toBe(false);
  });

  it("rejects non-array headers", () => {
    const data = {
      headers: "name,age",
      rows: [{ name: "John" }],
    };
    const result = safeValidate(AnalyzeRequestSchema, data);
    expect(result.success).toBe(false);
  });
});

describe("FollowUpRequestSchema", () => {
  it("validates correct follow-up request", () => {
    const data = {
      action: "followup",
      question: "What is the average?",
      headers: ["sales"],
      rows: [{ sales: "100" }],
      previousInsights: {
        summary: "Summary",
        trends: "Trends",
        outliers: "Outliers",
        recommendations: "Recs",
      },
    };
    const result = safeValidate(FollowUpRequestSchema, data);
    expect(result.success).toBe(true);
  });

  it("rejects empty question", () => {
    const data = {
      action: "followup",
      question: "",
      headers: ["sales"],
      rows: [{ sales: "100" }],
      previousInsights: {
        summary: "S",
        trends: "T",
        outliers: "O",
        recommendations: "R",
      },
    };
    const result = safeValidate(FollowUpRequestSchema, data);
    expect(result.success).toBe(false);
  });

  it("rejects question exceeding max length", () => {
    const data = {
      action: "followup",
      question: "x".repeat(1001),
      headers: ["sales"],
      rows: [{ sales: "100" }],
      previousInsights: {
        summary: "S",
        trends: "T",
        outliers: "O",
        recommendations: "R",
      },
    };
    const result = safeValidate(FollowUpRequestSchema, data);
    expect(result.success).toBe(false);
  });

  it("rejects wrong action literal", () => {
    const data = {
      action: "analyze",
      question: "What?",
      headers: ["x"],
      rows: [{ x: "1" }],
      previousInsights: {
        summary: "S",
        trends: "T",
        outliers: "O",
        recommendations: "R",
      },
    };
    const result = safeValidate(FollowUpRequestSchema, data);
    expect(result.success).toBe(false);
  });
});

describe("SaveReportSchema", () => {
  it("validates correct report data", () => {
    const data = {
      filename: "test.csv",
      rowCount: 100,
      columnCount: 5,
      columnsAnalyzed: ["name", "age"],
      insightsSummary: "This is a summary.",
      trends: "Upward",
      outliers: "None",
      recommendations: "Keep going",
      csvPreviewJson: [{ name: "John" }],
    };
    const result = safeValidate(SaveReportSchema, data);
    expect(result.success).toBe(true);
  });

  it("applies defaults for optional fields", () => {
    const data = {
      filename: "test.csv",
      insightsSummary: "Summary here.",
    };
    const result = safeValidate(SaveReportSchema, data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rowCount).toBe(0);
      expect(result.data.columnCount).toBe(0);
      expect(result.data.columnsAnalyzed).toEqual([]);
    }
  });

  it("rejects invalid filename format", () => {
    const data = {
      filename: "../../../etc/passwd",
      insightsSummary: "Summary",
    };
    const result = safeValidate(SaveReportSchema, data);
    expect(result.success).toBe(false);
  });

  it("rejects missing insightsSummary", () => {
    const data = {
      filename: "test.csv",
    };
    const result = safeValidate(SaveReportSchema, data);
    expect(result.success).toBe(false);
  });
});

describe("ReportIdSchema", () => {
  it("validates numeric string ID", () => {
    const result = safeValidate(ReportIdSchema, { id: "123" });
    expect(result.success).toBe(true);
  });

  it("rejects non-numeric ID", () => {
    const result = safeValidate(ReportIdSchema, { id: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects SQL injection-like ID", () => {
    const result = safeValidate(ReportIdSchema, { id: "1; DROP TABLE" });
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = safeValidate(ReportIdSchema, { id: "" });
    expect(result.success).toBe(false);
  });
});

describe("UploadFileSchema", () => {
  it("validates correct file metadata", () => {
    const result = safeValidate(UploadFileSchema, {
      filename: "data.csv",
      size: 1024,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-csv filename", () => {
    const result = safeValidate(UploadFileSchema, {
      filename: "data.exe",
      size: 1024,
    });
    expect(result.success).toBe(false);
  });

  it("rejects file exceeding size limit", () => {
    const result = safeValidate(UploadFileSchema, {
      filename: "big.csv",
      size: 11 * 1024 * 1024,
    });
    expect(result.success).toBe(false);
  });
});

describe("safeValidate", () => {
  it("returns success with parsed data for valid input", () => {
    const result = safeValidate(ReportIdSchema, { id: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("42");
    }
  });

  it("returns error message for invalid input", () => {
    const result = safeValidate(ReportIdSchema, { id: "not-a-number" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Report ID must be a number");
    }
  });

  it("handles completely wrong type", () => {
    const result = safeValidate(ReportIdSchema, "not an object");
    expect(result.success).toBe(false);
  });
});
