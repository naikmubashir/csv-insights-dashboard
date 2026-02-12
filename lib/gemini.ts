import { GoogleGenerativeAI } from "@google/generative-ai";
import { InsightsResponse } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function generateInsights(
  headers: string[],
  rows: Record<string, string>[],
  selectedColumns?: string[]
): Promise<InsightsResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      summary: parsed.summary || "No summary generated.",
      trends: parsed.trends || "No trends identified.",
      outliers: parsed.outliers || "No outliers detected.",
      recommendations: parsed.recommendations || "No recommendations available.",
    };
  } catch {
    return {
      summary: text,
      trends: "Could not parse structured trends.",
      outliers: "Could not parse structured outliers.",
      recommendations: "Could not parse structured recommendations.",
    };
  }
}

export async function askFollowUp(
  question: string,
  headers: string[],
  rows: Record<string, string>[],
  previousInsights: InsightsResponse
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const sampleData = rows.slice(0, 30);

  const prompt = `You are a data analyst. You previously analyzed a CSV dataset with these columns: ${headers.join(", ")}

Your previous analysis:
Summary: ${previousInsights.summary}
Trends: ${previousInsights.trends}
Outliers: ${previousInsights.outliers}
Recommendations: ${previousInsights.recommendations}

Sample data:
${JSON.stringify(sampleData, null, 2)}

The user has a follow-up question: "${question}"

Please answer concisely and specifically, referencing the data where possible.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function checkGeminiHealth(): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent("Say OK");
    return !!result.response.text();
  } catch {
    return false;
  }
}
