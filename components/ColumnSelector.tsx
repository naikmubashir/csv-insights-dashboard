"use client";

import { useState } from "react";
import { CSVData } from "@/types";
import { getNumericColumns } from "@/lib/csvParser";

interface ColumnSelectorProps {
  data: CSVData;
  selectedColumns: string[];
  onSelectionChange: (columns: string[]) => void;
}

export default function ColumnSelector({
  data,
  selectedColumns,
  onSelectionChange,
}: ColumnSelectorProps) {
  const [showAll, setShowAll] = useState(false);
  const numericColumns = getNumericColumns(data);
  const displayColumns = showAll ? data.headers : data.headers.slice(0, 15);

  const toggleColumn = (col: string) => {
    if (selectedColumns.includes(col)) {
      onSelectionChange(selectedColumns.filter((c) => c !== col));
    } else {
      onSelectionChange([...selectedColumns, col]);
    }
  };

  const selectAll = () => onSelectionChange([...data.headers]);
  const deselectAll = () => onSelectionChange([]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Select columns to analyze ({selectedColumns.length}/{data.headers.length})
        </p>
        <div className="flex gap-2 text-xs">
          <button onClick={selectAll} className="text-blue-500 hover:underline">
            All
          </button>
          <span className="text-zinc-300">|</span>
          <button onClick={deselectAll} className="text-blue-500 hover:underline">
            None
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {displayColumns.map((col) => (
          <button
            key={col}
            onClick={() => toggleColumn(col)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
              selectedColumns.includes(col)
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-blue-300"
            }`}
          >
            {col}
            {numericColumns.includes(col) && (
              <span className="ml-1 opacity-60">#</span>
            )}
          </button>
        ))}
      </div>
      {data.headers.length > 15 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 text-xs text-blue-500 hover:underline"
        >
          {showAll ? "Show less" : `Show all ${data.headers.length} columns`}
        </button>
      )}
    </div>
  );
}
