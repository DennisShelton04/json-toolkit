import { dump, load } from 'js-yaml';
import Papa from 'papaparse';
import { JsonToolError } from './errors';
import { parseJson } from './parse';

export function jsonToYaml(text: string): string {
  return dump(parseJson(text), { noRefs: true, lineWidth: -1 });
}

export function yamlToJson(text: string, indent: 2 | 4 | '\t' = 2): string {
  try {
    return JSON.stringify(load(text) ?? null, null, indent);
  } catch (e) {
    const mark = (e as { mark?: { line: number; column: number } }).mark;
    throw new JsonToolError(
      `Invalid YAML: ${(e as Error).message.split('\n')[0]}`,
      mark && mark.line + 1,
      mark && mark.column + 1,
    );
  }
}

/** Flattens nested objects into dotted column names, e.g. {a:{b:1}} → {"a.b":1}. */
export function flatten(
  value: unknown,
  prefix = '',
  out: Record<string, unknown> = {},
): Record<string, unknown> {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0 && prefix) out[prefix] = '{}';
    for (const [k, v] of entries) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else if (Array.isArray(value)) {
    out[prefix] = JSON.stringify(value);
  } else {
    out[prefix] = value;
  }
  return out;
}

export function jsonToCsv(text: string): string {
  const value = parseJson(text);
  const rows = Array.isArray(value) ? value : [value];
  if (rows.some((r) => r === null || typeof r !== 'object' || Array.isArray(r))) {
    throw new JsonToolError('CSV export needs an array of objects (or a single object)');
  }
  const flat = rows.map((r) => flatten(r));
  const columns = [...new Set(flat.flatMap((r) => Object.keys(r)))];
  return Papa.unparse({ fields: columns, data: flat.map((r) => columns.map((c) => r[c] ?? '')) });
}

export function csvToJson(text: string, indent: 2 | 4 | '\t' = 2): string {
  const result = Papa.parse<Record<string, unknown>>(text.trim(), {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  // Single-column CSVs have no delimiter to detect; PapaParse reports that but parses fine.
  const fatal = result.errors.find(
    (e) => e.type !== 'FieldMismatch' && e.code !== 'UndetectableDelimiter',
  );
  if (fatal) throw new JsonToolError(`Invalid CSV: ${fatal.message}`, (fatal.row ?? 0) + 2);
  return JSON.stringify(result.data, null, indent);
}
