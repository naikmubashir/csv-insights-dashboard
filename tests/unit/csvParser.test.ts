import { describe, it, expect } from "vitest";
import { parseCSVString, getNumericColumns, getColumnStats, getPreviewRows } from "@/lib/csvParser";

describe("parseCSVString", () => {
  it("parses valid CSV string", () => {
    const csv = "name,age,city\nJohn,30,NYC\nJane,25,LA";
    const result = parseCSVString(csv);

    expect(result.headers).toEqual(["name", "age", "city"]);
    expect(result.rows).toHaveLength(2);
    expect(result.totalRows).toBe(2);
    expect(result.rows[0]).toEqual({ name: "John", age: "30", city: "NYC" });
  });

  it("handles empty CSV", () => {
    const csv = "";
    const result = parseCSVString(csv);
    expect(result.headers).toEqual([]);
    expect(result.rows).toHaveLength(0);
  });

  it("handles CSV with only headers", () => {
    const csv = "name,age\n";
    const result = parseCSVString(csv);
    expect(result.headers).toEqual(["name", "age"]);
    expect(result.rows).toHaveLength(0);
  });

  it("handles CSV with commas in quoted fields", () => {
    const csv = 'name,address\nJohn,"123 Main St, Apt 4"';
    const result = parseCSVString(csv);
    expect(result.rows[0].address).toBe("123 Main St, Apt 4");
  });

  it("skips empty lines", () => {
    const csv = "name,age\nJohn,30\n\nJane,25\n\n";
    const result = parseCSVString(csv);
    expect(result.rows).toHaveLength(2);
  });

  it("handles single column CSV", () => {
    const csv = "value\n100\n200\n300";
    const result = parseCSVString(csv);
    expect(result.headers).toEqual(["value"]);
    expect(result.rows).toHaveLength(3);
  });
});

describe("getNumericColumns", () => {
  it("identifies numeric columns", () => {
    const data = {
      headers: ["name", "age", "salary"],
      rows: [
        { name: "John", age: "30", salary: "50000" },
        { name: "Jane", age: "25", salary: "60000" },
        { name: "Bob", age: "35", salary: "55000" },
      ],
      totalRows: 3,
    };
    const result = getNumericColumns(data);
    expect(result).toContain("age");
    expect(result).toContain("salary");
    expect(result).not.toContain("name");
  });

  it("returns empty for no numeric columns", () => {
    const data = {
      headers: ["name", "city"],
      rows: [
        { name: "John", city: "NYC" },
        { name: "Jane", city: "LA" },
      ],
      totalRows: 2,
    };
    expect(getNumericColumns(data)).toEqual([]);
  });

  it("returns empty for empty data", () => {
    const data = { headers: ["a"], rows: [], totalRows: 0 };
    expect(getNumericColumns(data)).toEqual([]);
  });

  it("handles mixed numeric and non-numeric values", () => {
    const data = {
      headers: ["value"],
      rows: [
        { value: "10" },
        { value: "20" },
        { value: "30" },
        { value: "N/A" },
      ],
      totalRows: 4,
    };
    // 75% numeric, above 70% threshold
    expect(getNumericColumns(data)).toContain("value");
  });

  it("excludes mostly non-numeric columns", () => {
    const data = {
      headers: ["value"],
      rows: [
        { value: "abc" },
        { value: "def" },
        { value: "30" },
        { value: "ghi" },
      ],
      totalRows: 4,
    };
    // Only 25% numeric, below 70% threshold
    expect(getNumericColumns(data)).not.toContain("value");
  });
});

describe("getColumnStats", () => {
  it("calculates correct statistics", () => {
    const data = {
      headers: ["value"],
      rows: [
        { value: "10" },
        { value: "20" },
        { value: "30" },
        { value: "40" },
        { value: "50" },
      ],
      totalRows: 5,
    };
    const stats = getColumnStats(data, "value");
    expect(stats).not.toBeNull();
    expect(stats!.min).toBe(10);
    expect(stats!.max).toBe(50);
    expect(stats!.mean).toBe(30);
    expect(stats!.count).toBe(5);
  });

  it("returns null for non-numeric column", () => {
    const data = {
      headers: ["name"],
      rows: [{ name: "John" }, { name: "Jane" }],
      totalRows: 2,
    };
    expect(getColumnStats(data, "name")).toBeNull();
  });

  it("handles column with some non-numeric values", () => {
    const data = {
      headers: ["value"],
      rows: [
        { value: "10" },
        { value: "N/A" },
        { value: "30" },
      ],
      totalRows: 3,
    };
    const stats = getColumnStats(data, "value");
    expect(stats).not.toBeNull();
    expect(stats!.count).toBe(2);
    expect(stats!.min).toBe(10);
    expect(stats!.max).toBe(30);
  });

  it("handles empty dataset", () => {
    const data = { headers: ["value"], rows: [], totalRows: 0 };
    expect(getColumnStats(data, "value")).toBeNull();
  });

  it("calculates correct median", () => {
    const data = {
      headers: ["v"],
      rows: [{ v: "1" }, { v: "2" }, { v: "3" }, { v: "4" }, { v: "5" }],
      totalRows: 5,
    };
    const stats = getColumnStats(data, "v");
    expect(stats!.median).toBe(3);
  });
});

describe("getPreviewRows", () => {
  it("returns first N rows", () => {
    const data = {
      headers: ["v"],
      rows: Array.from({ length: 50 }, (_, i) => ({ v: String(i) })),
      totalRows: 50,
    };
    const preview = getPreviewRows(data, 10);
    expect(preview).toHaveLength(10);
    expect(preview[0].v).toBe("0");
    expect(preview[9].v).toBe("9");
  });

  it("returns all rows if fewer than count", () => {
    const data = {
      headers: ["v"],
      rows: [{ v: "1" }, { v: "2" }],
      totalRows: 2,
    };
    const preview = getPreviewRows(data, 10);
    expect(preview).toHaveLength(2);
  });

  it("uses default count of 10", () => {
    const data = {
      headers: ["v"],
      rows: Array.from({ length: 50 }, (_, i) => ({ v: String(i) })),
      totalRows: 50,
    };
    const preview = getPreviewRows(data);
    expect(preview).toHaveLength(10);
  });
});
