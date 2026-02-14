import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger, generateRequestId, withTiming } from "@/lib/logger";

describe("logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("outputs structured JSON for info level", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("Test message", { context: "test" });

    expect(spy).toHaveBeenCalledTimes(1);
    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.level).toBe("info");
    expect(output.message).toBe("Test message");
    expect(output.context).toBe("test");
    expect(output.service).toBe("csv-insights-dashboard");
    expect(output.timestamp).toBeDefined();
  });

  it("outputs structured JSON for error level", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const testError = new Error("test error");
    logger.error("Something failed", { error: testError });

    expect(spy).toHaveBeenCalledTimes(1);
    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.level).toBe("error");
    expect(output.error.name).toBe("Error");
    expect(output.error.message).toBe("test error");
  });

  it("outputs structured JSON for warn level", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("Warning message");

    expect(spy).toHaveBeenCalledTimes(1);
    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.level).toBe("warn");
  });

  it("includes requestId when provided", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("With request", { requestId: "req_123" });

    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.requestId).toBe("req_123");
  });

  it("includes metadata when provided", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("With metadata", {
      metadata: { key: "value", count: 42 },
    });

    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.metadata.key).toBe("value");
    expect(output.metadata.count).toBe(42);
  });

  it("includes duration when provided", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("Timed operation", { duration: 150 });

    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.duration).toBe(150);
  });

  it("handles non-Error objects in error field", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("String error", { error: "plain string error" });

    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output.error.name).toBe("UnknownError");
    expect(output.error.message).toBe("plain string error");
  });
});

describe("generateRequestId", () => {
  it("returns a string starting with req_", () => {
    const id = generateRequestId();
    expect(id).toMatch(/^req_/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRequestId()));
    expect(ids.size).toBe(100);
  });
});

describe("withTiming", () => {
  it("returns result and duration", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const { result, duration } = await withTiming(
      "test-op",
      async () => "hello"
    );
    expect(result).toBe("hello");
    expect(typeof duration).toBe("number");
    expect(duration).toBeGreaterThanOrEqual(0);
  });

  it("measures actual execution time", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const { duration } = await withTiming("slow-op", async () => {
      await new Promise((r) => setTimeout(r, 50));
      return "done";
    });
    expect(duration).toBeGreaterThanOrEqual(40); // Allow some tolerance
  });

  it("propagates errors", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    await expect(
      withTiming("error-op", async () => {
        throw new Error("boom");
      })
    ).rejects.toThrow("boom");
  });
});
