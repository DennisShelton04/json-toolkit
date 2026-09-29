import { parseJson } from './parse';

export type Indent = 2 | 4 | '\t';

export function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((k) => [k, sortKeys((value as Record<string, unknown>)[k])]),
    );
  }
  return value;
}

export function beautify(text: string, indent: Indent = 2, sort = false): string {
  const value = parseJson(text);
  return JSON.stringify(sort ? sortKeys(value) : value, null, indent);
}

export function minify(text: string, sort = false): string {
  const value = parseJson(text);
  return JSON.stringify(sort ? sortKeys(value) : value);
}
