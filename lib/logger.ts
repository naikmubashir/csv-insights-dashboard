/**
 * Structured JSON Logger
 *
 * Production-grade logging with structured JSON output.
 * Supports log levels, request context, and metadata.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  context?: string;
  requestId?: string;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === "production" ? "info" : "debug");

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL];
}

function formatError(err: unknown): LogEntry["error"] | undefined {
  if (!err) return undefined;
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };
  }
  return { name: "UnknownError", message: String(err) };
}

function emit(entry: LogEntry): void {
  const output = JSON.stringify(entry);
  if (entry.level === "error") {
    console.error(output);
  } else if (entry.level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

function createLogFn(level: LogLevel) {
  return (
    message: string,
    opts?: {
      context?: string;
      requestId?: string;
      duration?: number;
      error?: unknown;
      metadata?: Record<string, unknown>;
    }
  ): void => {
    if (!shouldLog(level)) return;
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: "csv-insights-dashboard",
    };
    if (opts?.context) entry.context = opts.context;
    if (opts?.requestId) entry.requestId = opts.requestId;
    if (opts?.duration) entry.duration = opts.duration;
    if (opts?.error) entry.error = formatError(opts.error);
    if (opts?.metadata) entry.metadata = opts.metadata;
    emit(entry);
  };
}

export const logger = {
  debug: createLogFn("debug"),
  info: createLogFn("info"),
  warn: createLogFn("warn"),
  error: createLogFn("error"),
};

/**
 * Generate a unique request ID for tracing.
 */
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Measure execution duration of an async function.
 */
export async function withTiming<T>(
  label: string,
  fn: () => Promise<T>,
  context?: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = Math.round(performance.now() - start);
  logger.info(`${label} completed`, { context, duration });
  return { result, duration };
}
