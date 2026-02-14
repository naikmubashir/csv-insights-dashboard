/**
 * Input Sanitization Utilities
 *
 * Strict sanitization at every input boundary.
 * Prevents injection attacks, XSS, and data corruption.
 */

/**
 * Sanitize a string by stripping potential XSS vectors.
 * Escapes HTML entities for safe rendering.
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitize a filename — allow only safe characters.
 */
export function sanitizeFilename(filename: string): string {
  // Strip directory traversal
  const base = filename.replace(/^.*[/\\]/, "");
  // Allow only alphanumeric, hyphens, underscores, dots, and spaces
  return base.replace(/[^a-zA-Z0-9\-_. ]/g, "_").slice(0, 255);
}

/**
 * Sanitize CSV row data by limiting value length and stripping control chars.
 */
export function sanitizeCSVRow(row: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const safeKey = key.slice(0, 255);
    // Strip control characters except newlines/tabs
    const safeValue = String(value || "")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .slice(0, 10000);
    sanitized[safeKey] = safeValue;
  }
  return sanitized;
}

/**
 * Sanitize an array of CSV rows.
 */
export function sanitizeCSVData(
  rows: Record<string, string>[]
): Record<string, string>[] {
  return rows.map(sanitizeCSVRow);
}

/**
 * Sanitize AI-generated text for safe rendering.
 * Strips HTML/script but preserves markdown-style formatting.
 */
export function sanitizeAIOutput(text: string): string {
  return text
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove event handlers
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
    // Remove HTML tags but keep content
    .replace(/<\/?[^>]+(>|$)/g, "")
    // Remove javascript: URIs
    .replace(/javascript:/gi, "")
    // Remove data: URIs (potential XSS)
    .replace(/data:\s*text\/html/gi, "")
    .trim();
}

/**
 * Sanitize user question for follow-up chat.
 * Prevents prompt injection by stripping special instruction markers.
 */
export function sanitizeUserQuestion(question: string): string {
  return question
    // Strip potential prompt injection markers
    .replace(/\[INST\]|\[\/INST\]|<\|im_start\|>|<\|im_end\|>/gi, "")
    .replace(/```system|```assistant|```user/gi, "")
    // Limit length
    .slice(0, 1000)
    .trim();
}
