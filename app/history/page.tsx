"use client";

import { useEffect, useState } from "react";
import { History, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import ReportCard from "@/components/ReportCard";

interface Report {
  id: number;
  filename: string;
  rowCount: number | null;
  columnCount: number | null;
  columnsAnalyzed: string[];
  insightsSummary: string | null;
  createdAt: string;
}

export default function HistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setReports(data.reports);
        }
      } catch {
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Report History
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Your last 5 saved analysis reports
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          <Upload className="w-4 h-4" />
          New Analysis
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {reports.length === 0 ? (
        <div className="text-center py-16">
          <History className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            No reports yet
          </h3>
          <p className="text-zinc-500 mb-6">
            Upload a CSV and generate your first analysis report.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Upload CSV
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
