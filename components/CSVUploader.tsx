"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { parseCSV, getPreviewRows } from "@/lib/csvParser";
import { CSVData } from "@/types";

interface CSVUploaderProps {
  onDataParsed: (data: CSVData, filename: string, preview: Record<string, string>[]) => void;
}

export default function CSVUploader({ onDataParsed }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!file.name.endsWith(".csv")) {
        setError("Please upload a CSV file.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be under 10MB.");
        return;
      }

      setIsLoading(true);
      try {
        const data = await parseCSV(file);
        if (data.rows.length === 0) {
          setError("The CSV file appears to be empty.");
          return;
        }
        const preview = getPreviewRows(data, 10);
        onDataParsed(data, file.name, preview);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse CSV file.");
      } finally {
        setIsLoading(false);
      }
    },
    [onDataParsed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
          ${isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
            : "border-zinc-300 dark:border-zinc-700 hover:border-blue-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          }`}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {isLoading ? "Parsing CSV..." : "Drop your CSV file here"}
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              or click to browse • Max 10MB
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <FileText className="w-4 h-4" />
            <span>Supports .csv files</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
