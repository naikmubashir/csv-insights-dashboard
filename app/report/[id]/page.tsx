"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Copy,
  Calendar,
  Table2,
  Check,
  Loader2,
} from "lucide-react";
import InsightsDisplay from "@/components/InsightsDisplay";
import { ReportData } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${id}`);
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setReport(data.report);
        }
      } catch {
        setError("Failed to load report.");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  const handleCopy = async () => {
    if (!report) return;
    const text = `Summary: ${report.insightsSummary}\n\nTrends: ${report.trends}\n\nOutliers: ${report.outliers}\n\nRecommendations: ${report.recommendations}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!report) return;
    const markdown = `# CSV Insights Report — ${report.filename}
Generated: ${report.createdAt ? formatDate(report.createdAt) : "N/A"}

## Summary
${report.insightsSummary}

## Trends
${report.trends}

## Outliers
${report.outliers}

## Recommendations
${report.recommendations}
`;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.filename.replace(".csv", "")}-report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Report Not Found
          </h2>
          <p className="text-zinc-500 mb-6">{error || "The requested report doesn't exist."}</p>
          <button
            onClick={() => router.push("/history")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {report.filename}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
            <span className="flex items-center gap-1">
              <Table2 className="w-4 h-4" />
              {report.rowCount?.toLocaleString()} rows × {report.columnCount} columns
            </span>
            {report.createdAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(report.createdAt)}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Columns analyzed */}
      {report.columnsAnalyzed && report.columnsAnalyzed.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            Columns Analyzed
          </h3>
          <div className="flex flex-wrap gap-2">
            {report.columnsAnalyzed.map((col) => (
              <span
                key={col}
                className="px-3 py-1 text-xs rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
              >
                {col}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CSV Preview */}
      {report.csvPreviewJson && Array.isArray(report.csvPreviewJson) && report.csvPreviewJson.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-3">
            Data Preview
          </h3>
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0">
                  <tr className="bg-zinc-100 dark:bg-zinc-800">
                    {Object.keys(report.csvPreviewJson[0] as Record<string, unknown>).map((key) => (
                      <th
                        key={key}
                        className="px-4 py-2 text-left font-medium text-zinc-600 dark:text-zinc-300 text-xs border-b border-zinc-200 dark:border-zinc-700 whitespace-nowrap"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(report.csvPreviewJson as Record<string, string>[]).map((row, i) => (
                    <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                      {Object.values(row).map((val, j) => (
                        <td
                          key={j}
                          className="px-4 py-2 text-zinc-700 dark:text-zinc-300 whitespace-nowrap text-xs"
                        >
                          {val || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <InsightsDisplay
        insights={{
          summary: report.insightsSummary || "",
          trends: report.trends || "",
          outliers: report.outliers || "",
          recommendations: report.recommendations || "",
        }}
      />
    </div>
  );
}
