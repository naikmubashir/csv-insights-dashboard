"use client";

import Link from "next/link";
import { FileText, Calendar, ArrowRight, Table2 } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";

interface ReportCardProps {
  report: {
    id: number;
    filename: string;
    rowCount: number | null;
    columnCount: number | null;
    columnsAnalyzed: string[];
    insightsSummary: string | null;
    createdAt: Date | string;
  };
}

export default function ReportCard({ report }: ReportCardProps) {
  return (
    <Link href={`/report/${report.id}`}>
      <div className="group border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all bg-white dark:bg-zinc-950">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {report.filename}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Table2 className="w-3 h-3" />
                  {report.rowCount?.toLocaleString()} rows × {report.columnCount} cols
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(report.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-blue-500 transition-colors mt-1" />
        </div>
        {report.insightsSummary && (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {truncate(report.insightsSummary, 150)}
          </p>
        )}
        {report.columnsAnalyzed.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {report.columnsAnalyzed.slice(0, 5).map((col) => (
              <span
                key={col}
                className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                {col}
              </span>
            ))}
            {report.columnsAnalyzed.length > 5 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                +{report.columnsAnalyzed.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
