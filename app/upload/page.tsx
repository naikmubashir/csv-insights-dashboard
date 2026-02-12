"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Save, Download, Loader2, BarChart3 } from "lucide-react";
import CSVUploader from "@/components/CSVUploader";
import DataPreview from "@/components/DataPreview";
import ColumnSelector from "@/components/ColumnSelector";
import InsightsDisplay from "@/components/InsightsDisplay";
import DataChart from "@/components/DataChart";
import FollowUpChat from "@/components/FollowUpChat";
import { CSVData, InsightsResponse } from "@/types";

export default function UploadPage() {
  const router = useRouter();
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDataParsed = (
    data: CSVData,
    name: string,
    previewRows: Record<string, string>[]
  ) => {
    setCsvData(data);
    setFilename(name);
    setPreview(previewRows);
    setSelectedColumns([...data.headers]);
    setInsights(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!csvData) return;

    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headers: csvData.headers,
          rows: csvData.rows,
          selectedColumns:
            selectedColumns.length > 0 ? selectedColumns : undefined,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setInsights(data.insights);
    } catch {
      setError("Failed to connect to the analysis service.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!csvData || !insights) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          rowCount: csvData.totalRows,
          columnCount: csvData.headers.length,
          columnsAnalyzed: selectedColumns,
          insightsSummary: insights.summary,
          trends: insights.trends,
          outliers: insights.outliers,
          recommendations: insights.recommendations,
          csvPreviewJson: preview,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      router.push(`/report/${data.report.id}`);
    } catch {
      setError("Failed to save report.");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!insights) return;

    const report = `# CSV Insights Report — ${filename}
Generated: ${new Date().toLocaleString()}

## Summary
${insights.summary}

## Trends
${insights.trends}

## Outliers
${insights.outliers}

## Recommendations
${insights.recommendations}
`;

    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename.replace(".csv", "")}-insights.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!insights) return;

    const text = `Summary: ${insights.summary}\n\nTrends: ${insights.trends}\n\nOutliers: ${insights.outliers}\n\nRecommendations: ${insights.recommendations}`;
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Upload & Analyze
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Upload a CSV file to get AI-powered insights
        </p>
      </div>

      {/* Step 1: Upload */}
      <div className="mb-8">
        <CSVUploader onDataParsed={handleDataParsed} />
      </div>

      {/* Step 2: Preview + Column Selection */}
      {csvData && (
        <div className="space-y-6 mb-8">
          <DataPreview data={csvData} preview={preview} filename={filename} />

          <ColumnSelector
            data={csvData}
            selectedColumns={selectedColumns}
            onSelectionChange={setSelectedColumns}
          />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || selectedColumns.length === 0}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {analyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {analyzing ? "Analyzing..." : "Generate Insights"}
            </button>

            {csvData && (
              <button
                onClick={() => setShowChart(!showChart)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                {showChart ? "Hide Charts" : "Show Charts"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Charts */}
      {showChart && csvData && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Data Visualization
          </h2>
          <DataChart data={csvData} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Step 3: Insights */}
      {insights && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              AI Insights
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                Copy
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save Report"}
              </button>
            </div>
          </div>

          <InsightsDisplay insights={insights} />

          {/* Follow-up chat */}
          {csvData && (
            <FollowUpChat
              headers={csvData.headers}
              rows={csvData.rows}
              insights={insights}
            />
          )}
        </div>
      )}
    </div>
  );
}
