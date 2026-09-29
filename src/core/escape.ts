import { JsonToolError } from './errors';

/** Turns text into a JSON string literal, e.g. {"a":1} → "{\"a\":1}". */
export function escapeJson(text: string): string {
  return JSON.stringify(text);
}

/** Reverses escapeJson. Accepts the literal with or without surrounding quotes. */
export function unescapeJson(text: string): string {
  const t = text.trim();
  const literal = t.startsWith('"') && t.endsWith('"') && t.length >= 2 ? t : `"${t}"`;
  try {
    const out = JSON.parse(literal);
    if (typeof out !== 'string') throw new Error('not a string');
    return out;
  } catch {
    throw new JsonToolError('Input is not a valid escaped JSON string');
  }
}
