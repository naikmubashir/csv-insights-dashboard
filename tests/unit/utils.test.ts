import { describe, it, expect } from "vitest";
import { cn, formatDate, truncate } from "@/lib/utils";

describe("cn (className merger)", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("handles undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const date = new Date("2025-06-15T10:30:00Z");
    const result = formatDate(date);
    expect(result).toContain("2025");
    expect(result).toContain("Jun");
    expect(result).toContain("15");
  });

  it("formats a date string", () => {
    const result = formatDate("2025-01-01T00:00:00Z");
    expect(result).toContain("2025");
    expect(result).toContain("Jan");
  });

  it("handles ISO string format", () => {
    const result = formatDate("2024-12-25T14:30:00.000Z");
    expect(result).toContain("2024");
    expect(result).toContain("Dec");
  });
});

describe("truncate", () => {
  it("does not truncate short strings", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates long strings with ellipsis", () => {
    const long = "a".repeat(200);
    const result = truncate(long, 100);
    expect(result).toHaveLength(103); // 100 + "..."
    expect(result.endsWith("...")).toBe(true);
  });

  it("does not truncate at exact length", () => {
    const str = "a".repeat(100);
    expect(truncate(str, 100)).toBe(str);
  });

  it("uses default length of 100", () => {
    const str = "a".repeat(150);
    const result = truncate(str);
    expect(result).toHaveLength(103);
  });

  it("handles empty string", () => {
    expect(truncate("")).toBe("");
  });
});
