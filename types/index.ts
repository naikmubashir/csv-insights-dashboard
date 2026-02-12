export interface CSVData {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export interface ParsedCSV {
  data: CSVData;
  filename: string;
  preview: Record<string, string>[];
}

export interface InsightsResponse {
  summary: string;
  trends: string;
  outliers: string;
  recommendations: string;
}

export interface ReportData {
  id?: number;
  filename: string;
  rowCount: number;
  columnCount: number;
  columnsAnalyzed: string[];
  insightsSummary: string;
  trends: string;
  outliers: string;
  recommendations: string;
  csvPreviewJson: Record<string, string>[];
  createdAt?: Date | string;
}

export interface HealthStatus {
  status: "healthy" | "unhealthy";
  database: {
    connected: boolean;
    message: string;
  };
  llm: {
    connected: boolean;
    message: string;
  };
  timestamp: string;
}
