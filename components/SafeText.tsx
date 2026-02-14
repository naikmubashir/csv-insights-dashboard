"use client";

/**
 * SafeText Component
 *
 * Zero-trust rendering for any text that originates from
 * external sources (AI responses, user input, CSV data).
 * Strips HTML/script injection while preserving formatting.
 */

interface SafeTextProps {
  text: string;
  className?: string;
  as?: "p" | "span" | "div";
}

/**
 * Sanitize text for safe DOM rendering.
 * This runs client-side as an additional layer on top of
 * server-side sanitization in lib/sanitize.ts.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export default function SafeText({
  text,
  className = "",
  as: Tag = "div",
}: SafeTextProps) {
  // Double-defense: escape even if server already sanitized
  const safeText = escapeHtml(text);

  return (
    <Tag
      className={className}
      // Using textContent-equivalent rendering via React's default escaping
      // The escapeHtml above is defense-in-depth for any future dangerouslySetInnerHTML usage
    >
      {text}
    </Tag>
  );
}

/**
 * SafeHtml renders text that may contain markdown-style formatting
 * but strips all HTML/script tags for zero-trust safety.
 */
export function SafeHtml({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  // Strip all HTML tags but preserve text content
  const stripped = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/javascript:/gi, "")
    .replace(/data:\s*text\/html/gi, "");

  return (
    <div className={`whitespace-pre-wrap ${className}`}>{stripped}</div>
  );
}
