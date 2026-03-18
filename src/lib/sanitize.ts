// Sanitize user-provided text content
// Used in contenteditable onBlur handlers to strip dangerous content

const MAX_CONTENT_LENGTH = 50_000
const MAX_TITLE_LENGTH = 200
const MAX_FIELD_LENGTH = 500

/**
 * Sanitize plain text content from contenteditable elements.
 * Since we read via textContent (not innerHTML), HTML is already stripped —
 * this adds length limits and removes null bytes.
 */
export function sanitizeContent(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .replace(/\0/g, '')           // Remove null bytes
    .replace(/\r\n/g, '\n')       // Normalize line endings
    .replace(/\r/g, '\n')
    .slice(0, MAX_CONTENT_LENGTH)
}

export function sanitizeTitle(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .replace(/\0/g, '')
    .replace(/[\r\n\t]/g, ' ')    // No multiline in titles
    .trim()
    .slice(0, MAX_TITLE_LENGTH)
}

export function sanitizeField(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .replace(/\0/g, '')
    .replace(/[\r\n\t]/g, ' ')
    .trim()
    .slice(0, MAX_FIELD_LENGTH)
}

/**
 * Sanitize HTML for safe display (used in ebooks formatContent).
 * Only allows a safe subset of HTML tags.
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
}

/**
 * Prevent prototype pollution in JSON parsing
 */
export function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    const parsed = JSON.parse(raw)
    if (parsed !== null && typeof parsed === 'object') {
      // Block prototype pollution
      if ('__proto__' in parsed || 'constructor' in parsed || 'prototype' in parsed) {
        return fallback
      }
    }
    return parsed as T
  } catch {
    return fallback
  }
}
