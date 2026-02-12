"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CSVData } from "@/types";
import { getNumericColumns } from "@/lib/csvParser";

interface DataChartProps {
  data: CSVData;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function DataChart({ data }: DataChartProps) {
  const numericColumns = useMemo(() => getNumericColumns(data), [data]);

  const chartData = useMemo(() => {
    if (numericColumns.length === 0) return [];
    return data.rows.slice(0, 20).map((row, i) => {
      const entry: Record<string, string | number> = { index: i + 1 };
      numericColumns.slice(0, 3).forEach((col) => {
        entry[col] = Number(row[col]) || 0;
      });
      return entry;
    });
  }, [data, numericColumns]);

  if (numericColumns.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm">
        No numeric columns found for charting.
      </div>
    );
  }

  const columnsToChart = numericColumns.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
          Bar Chart — First {Math.min(20, data.rows.length)} rows
        </h4>
        <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="index" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              {columnsToChart.map((col, i) => (
                <Bar
                  key={col}
                  dataKey={col}
                  fill={COLORS[i]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
          Line Chart — Trend View
        </h4>
        <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="index" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              {columnsToChart.map((col, i) => (
                <Line
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={COLORS[i]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {columnsToChart.map((col, i) => (
          <div key={col} className="flex items-center gap-2 text-xs text-zinc-500">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: COLORS[i] }}
            />
            {col}
          </div>
        ))}
      </div>
    </div>
  );
}
