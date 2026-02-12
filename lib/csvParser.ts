import Papa from "papaparse";
import { CSVData } from "@/types";

export function parseCSV(file: File): Promise<CSVData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];
        resolve({
          headers,
          rows,
          totalRows: rows.length,
        });
      },
      error: (error: Error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

export function parseCSVString(csvString: string): CSVData {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  const headers = result.meta.fields || [];
  const rows = result.data as Record<string, string>[];

  return {
    headers,
    rows,
    totalRows: rows.length,
  };
}

export function getPreviewRows(
  data: CSVData,
  count: number = 10
): Record<string, string>[] {
  return data.rows.slice(0, count);
}

export function getNumericColumns(data: CSVData): string[] {
  if (data.rows.length === 0) return [];

  return data.headers.filter((header) => {
    const sampleValues = data.rows.slice(0, 20).map((row) => row[header]);
    const numericCount = sampleValues.filter(
      (val) => val !== "" && val !== null && val !== undefined && !isNaN(Number(val))
    ).length;
    return numericCount > sampleValues.length * 0.7;
  });
}

export function getColumnStats(data: CSVData, column: string) {
  const values = data.rows
    .map((row) => Number(row[column]))
    .filter((v) => !isNaN(v));

  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: Math.round(mean * 100) / 100,
    median: sorted[Math.floor(sorted.length / 2)],
    count: values.length,
  };
}
