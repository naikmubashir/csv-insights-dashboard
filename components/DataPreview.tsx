"use client";

import { CSVData } from "@/types";

interface DataPreviewProps {
  data: CSVData;
  preview: Record<string, string>[];
  filename: string;
}

export default function DataPreview({ data, preview, filename }: DataPreviewProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {filename}
          </h3>
          <p className="text-sm text-zinc-500">
            {data.totalRows.toLocaleString()} rows × {data.headers.length} columns
            {preview.length < data.totalRows && (
              <span className="ml-1">• Showing first {preview.length} rows</span>
            )}
          </p>
        </div>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0">
              <tr className="bg-zinc-100 dark:bg-zinc-800">
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300 text-xs border-b border-zinc-200 dark:border-zinc-700">
                  #
                </th>
                {data.headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300 text-xs border-b border-zinc-200 dark:border-zinc-700 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <td className="px-4 py-2 text-zinc-400 text-xs">{i + 1}</td>
                  {data.headers.map((header) => (
                    <td
                      key={header}
                      className="px-4 py-2 text-zinc-700 dark:text-zinc-300 whitespace-nowrap max-w-[200px] truncate"
                      title={row[header]}
                    >
                      {row[header] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
