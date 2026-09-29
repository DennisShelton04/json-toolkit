import * as core from './core';
import type { Change } from './core';

export type ToolId =
  | 'beautify'
  | 'minify'
  | 'validate'
  | 'repair'
  | 'schema'
  | 'diff'
  | 'query'
  | 'convert'
  | 'types'
  | 'escape';

export type Lang = 'json' | 'yaml' | 'csv' | 'ts' | 'text';
export type ConvertMode = 'json-yaml' | 'yaml-json' | 'json-csv' | 'csv-json';

export interface Options {
  indent: core.Indent;
  sortKeys: boolean;
  jsonPath: string;
  convertMode: ConvertMode;
  rootName: string;
  unescape: boolean;
}

export interface ProblemItem {
  severity: 'error' | 'warning';
  message: string;
  line?: number;
  column?: number;
  path?: string;
}

export type Output =
  | { kind: 'text'; text: string; lang: Lang }
  | { kind: 'problems'; ok: boolean; summary: string; items: ProblemItem[] }
  | { kind: 'diff'; changes: Change[] }
  | { kind: 'error'; message: string; line?: number; column?: number };

export interface ToolDef {
  id: ToolId;
  label: string;
  hint: string;
  /** Label for the second input, when the tool needs one. */
  secondInput?: string;
}

export const TOOLS: ToolDef[] = [
  { id: 'beautify', label: 'Beautify', hint: 'Pretty-print with the chosen indent' },
  { id: 'minify', label: 'Minify', hint: 'Remove all whitespace' },
  { id: 'validate', label: 'Validate', hint: 'Check syntax and duplicate keys' },
  {
    id: 'repair',
    label: 'Repair',
    hint: 'Fix trailing commas, quotes, comments, missing brackets',
  },
  {
    id: 'schema',
    label: 'Schema',
    hint: 'Validate against a JSON Schema',
    secondInput: 'JSON Schema',
  },
  {
    id: 'diff',
    label: 'Diff',
    hint: 'Compare two documents (ignores key order)',
    secondInput: 'Compare with',
  },
  { id: 'query', label: 'Query', hint: 'Extract data with JSONPath' },
  { id: 'convert', label: 'Convert', hint: 'JSON ⇄ YAML / CSV' },
  { id: 'types', label: 'Types', hint: 'Generate TypeScript interfaces' },
  { id: 'escape', label: 'Escape', hint: 'Escape / unescape as a string literal' },
];

export const DEFAULT_OPTIONS: Options = {
  indent: 2,
  sortKeys: false,
  jsonPath: '$..*',
  convertMode: 'json-yaml',
  rootName: 'Root',
  unescape: false,
};

export function inputLang(tool: ToolId, opts: Options): Lang {
  if (tool === 'convert' && opts.convertMode === 'yaml-json') return 'yaml';
  if (tool === 'convert' && opts.convertMode === 'csv-json') return 'csv';
  if (tool === 'escape' && opts.unescape) return 'text';
  return 'json';
}

export function runTool(tool: ToolId, input: string, second: string, o: Options): Output {
  const secondLabel = TOOLS.find((t) => t.id === tool)?.secondInput;
  if (secondLabel && !second.trim()) {
    return {
      kind: 'error',
      message: `Enter the ${secondLabel === 'JSON Schema' ? 'JSON Schema' : 'document to compare with'} in the second editor`,
    };
  }
  try {
    switch (tool) {
      case 'beautify':
        return { kind: 'text', lang: 'json', text: core.beautify(input, o.indent, o.sortKeys) };
      case 'minify':
        return { kind: 'text', lang: 'json', text: core.minify(input, o.sortKeys) };
      case 'validate': {
        const r = core.validate(input);
        const items: ProblemItem[] = [
          ...r.errors.map((e) => ({ severity: 'error' as const, ...e })),
          ...r.warnings.map((w) => ({ severity: 'warning' as const, ...w })),
        ];
        const summary = r.valid
          ? `Valid JSON${r.warnings.length ? ` with ${r.warnings.length} warning(s)` : ''}`
          : `${r.errors.length} error(s) found`;
        return { kind: 'problems', ok: r.valid, summary, items };
      }
      case 'repair':
        return { kind: 'text', lang: 'json', text: core.repair(input, o.indent) };
      case 'schema': {
        const r = core.validateSchema(input, second);
        return {
          kind: 'problems',
          ok: r.valid,
          summary: r.valid
            ? 'Document matches the schema'
            : `${r.errors.length} schema violation(s)`,
          items: r.errors.map((e) => ({ severity: 'error', message: e.message, path: e.path })),
        };
      }
      case 'diff':
        return { kind: 'diff', changes: core.diff(input, second) };
      case 'query':
        return {
          kind: 'text',
          lang: 'json',
          text: JSON.stringify(core.query(input, o.jsonPath), null, o.indent),
        };
      case 'convert':
        switch (o.convertMode) {
          case 'json-yaml':
            return { kind: 'text', lang: 'yaml', text: core.jsonToYaml(input) };
          case 'yaml-json':
            return { kind: 'text', lang: 'json', text: core.yamlToJson(input, o.indent) };
          case 'json-csv':
            return { kind: 'text', lang: 'csv', text: core.jsonToCsv(input) };
          case 'csv-json':
            return { kind: 'text', lang: 'json', text: core.csvToJson(input, o.indent) };
        }
        break;
      case 'types':
        return { kind: 'text', lang: 'ts', text: core.toTypeScript(input, o.rootName || 'Root') };
      case 'escape':
        return o.unescape
          ? { kind: 'text', lang: 'json', text: core.unescapeJson(input) }
          : { kind: 'text', lang: 'text', text: core.escapeJson(input) };
    }
    return { kind: 'error', message: `Unknown tool: ${tool}` };
  } catch (e) {
    const err = e as core.JsonToolError;
    return { kind: 'error', message: err.message, line: err.line, column: err.column };
  }
}

export const FILE_EXT: Record<Lang, string> = {
  json: 'json',
  yaml: 'yaml',
  csv: 'csv',
  ts: 'ts',
  text: 'txt',
};

export const SAMPLE = `{
  "id": 1024,
  "name": "JSON Toolkit",
  "active": true,
  "tags": ["json", "formatter", "validator"],
  "owner": { "name": "Ada", "email": "ada@example.com" },
  "releases": [
    { "version": "0.1.0", "date": "2026-09-29", "notes": null },
    { "version": "0.2.0", "date": "2026-11-01", "beta": true }
  ]
}`;

export const SAMPLE_SCHEMA = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id", "name", "owner"],
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "tags": { "type": "array", "items": { "type": "string" } },
    "owner": {
      "type": "object",
      "required": ["email"],
      "properties": { "email": { "type": "string", "pattern": "^\\\\S+@\\\\S+$" } }
    }
  }
}`;
