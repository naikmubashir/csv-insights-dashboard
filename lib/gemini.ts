import { GoogleGenerativeAI } from "@google/generative-ai";
import { InsightsResponse } from "@/types";
import { InsightsResponseSchema, safeValidate } from "@/lib/validation";
import { sanitizeAIOutput, sanitizeUserQuestion } from "@/lib/sanitize";
import { logger, withTiming } from "@/lib/logger";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// ─── Retry Configuration ─────────────────────────────────────────────

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * Retry with exponential backoff.
 * Handles transient API failures gracefully.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  context: string,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      logger.warn(`Attempt ${attempt}/${maxRetries} failed for ${context}`, {
        context: "gemini",
        error: err,
        metadata: { attempt, maxRetries },
      });
      if (attempt < maxRetries) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Parse and validate AI JSON response with repair attempt.
 * If initial parse fails, sends a repair prompt to the LLM.
 */
async function parseAndValidateInsights(
  rawText: string,
  repairAttempt: number = 0
): Promise<InsightsResponse> {
  // Clean markdown code fences
  const cleaned = rawText
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    logger.warn("Failed to parse AI response as JSON", {
      context: "gemini",
      metadata: { repairAttempt, rawLength: rawText.length },
    });

    // Attempt repair via LLM if not already retried
    if (repairAttempt < 2) {
      const repaired = await repairJsonOutput(rawText);
      return parseAndValidateInsights(repaired, repairAttempt + 1);
    }

    // Final fallback: return raw text as summary
    return {
      summary: sanitizeAIOutput(rawText),
      trends: "Could not parse structured trends from AI response.",
      outliers: "Could not parse structured outliers from AI response.",
      recommendations: "Could not parse structured recommendations from AI response.",
    };
  }

  // Validate with Zod schema
  const validation = safeValidate(InsightsResponseSchema, parsed);
  if (validation.success) {
    return {
      summary: sanitizeAIOutput(validation.data.summary),
      trends: sanitizeAIOutput(validation.data.trends),
      outliers: sanitizeAIOutput(validation.data.outliers),
      recommendations: sanitizeAIOutput(validation.data.recommendations),
    };
  }

  logger.warn("AI response failed Zod validation", {
    context: "gemini",
    metadata: { validationError: validation.error, repairAttempt },
  });

  // Attempt repair if validation fails
  if (repairAttempt < 2) {
    const repaired = await repairJsonOutput(
      rawText,
      `Validation errors: ${validation.error}`
    );
    return parseAndValidateInsights(repaired, repairAttempt + 1);
  }

  // Graceful fallback
  const fallback = parsed as Record<string, string>;
  return {
    summary: sanitizeAIOutput(fallback?.summary || rawText),
    trends: sanitizeAIOutput(fallback?.trends || "No trends identified."),
    outliers: sanitizeAIOutput(fallback?.outliers || "No outliers detected."),
    recommendations: sanitizeAIOutput(fallback?.recommendations || "No recommendations available."),
  };
}

/**
 * Repair malformed JSON output by asking the LLM to fix it.
 */
async function repairJsonOutput(
  malformedText: string,
  hint?: string
): Promise<string> {
  logger.info("Attempting AI response repair", { context: "gemini" });
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const repairPrompt = `The following text was supposed to be valid JSON with exactly these fields:
- summary (string)
- trends (string)
- outliers (string)  
- recommendations (string)

${hint ? `Issue: ${hint}\n` : ""}
Please fix and return ONLY valid JSON (no markdown, no code blocks):

${malformedText.slice(0, 3000)}`;

  const result = await model.generateContent(repairPrompt);
  return result.response.text();
}

// ─── Public API ───────────────────────────────────────────────────────

export async function generateInsights(
  headers: string[],
  rows: Record<string, string>[],
  selectedColumns?: string[]
): Promise<InsightsResponse> {
  const columnsToAnalyze = selectedColumns || headers;
  const sampleData = rows.slice(0, 50);

  const filteredData = sampleData.map((row) => {
    const filtered: Record<string, string> = {};
    columnsToAnalyze.forEach((col) => {
      if (row[col] !== undefined) filtered[col] = row[col];
    });
    return filtered;
  });

  const prompt = `You are a data analyst. Analyze this CSV dataset and provide insights.

Dataset has ${rows.length} total rows and these columns being analyzed: ${columnsToAnalyze.join(", ")}

Sample data (first ${filteredData.length} rows):
${JSON.stringify(filteredData, null, 2)}

Provide your analysis in the following JSON format ONLY (no markdown, no code blocks):
{
  "summary": "A comprehensive 2-3 paragraph summary of the dataset and key findings",
  "trends": "Notable trends and patterns found in the data (2-3 paragraphs)",
  "outliers": "Any outliers, anomalies, or unusual data points (1-2 paragraphs)", 
  "recommendations": "Actionable recommendations based on the analysis (3-5 bullet points as a single string)"
}

Be specific and reference actual column names and values from the data.`;

  const { result: insights } = await withTiming(
    "generateInsights",
    async () => {
      const rawText = await withRetry(async () => {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent(prompt);
        return result.response.text();
      }, "generateInsights");

      return parseAndValidateInsights(rawText);
    },
    "gemini"
  );

  logger.info("Insights generated successfully", {
    context: "gemini",
    metadata: {
      columns: columnsToAnalyze.length,
      rows: rows.length,
    },
  });

  return insights;
}

export async function askFollowUp(
  question: string,
  headers: string[],
  rows: Record<string, string>[],
  previousInsights: InsightsResponse
): Promise<string> {
  const sanitizedQuestion = sanitizeUserQuestion(question);
  const sampleData = rows.slice(0, 30);

  const prompt = `You are a data analyst. You previously analyzed a CSV dataset with these columns: ${headers.join(", ")}

Your previous analysis:
Summary: ${previousInsights.summary}
Trends: ${previousInsights.trends}
Outliers: ${previousInsights.outliers}
Recommendations: ${previousInsights.recommendations}

Sample data:
${JSON.stringify(sampleData, null, 2)}

The user has a follow-up question: "${sanitizedQuestion}"

Please answer concisely and specifically, referencing the data where possible.`;

  const { result: answer } = await withTiming(
    "askFollowUp",
    async () => {
      return withRetry(async () => {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent(prompt);
        return sanitizeAIOutput(result.response.text());
      }, "askFollowUp");
    },
    "gemini"
  );

  return answer;
}

export async function checkGeminiHealth(): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent("Say OK");
    return !!result.response.text();
  } catch (err) {
    logger.error("Gemini health check failed", {
      context: "gemini",
      error: err,
    });
    return false;
  }
}
