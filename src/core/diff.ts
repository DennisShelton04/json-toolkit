import { parseJson } from './parse';
import { childPath } from './path';

export type ChangeKind = 'added' | 'removed' | 'changed';

export interface Change {
  kind: ChangeKind;
  path: string;
  before?: unknown;
  after?: unknown;
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

function walk(a: unknown, b: unknown, path: string, out: Change[]): void {
  if (Array.isArray(a) && Array.isArray(b)) {
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const p = childPath(path, i);
      if (i >= a.length) out.push({ kind: 'added', path: p, after: b[i] });
      else if (i >= b.length) out.push({ kind: 'removed', path: p, before: a[i] });
      else walk(a[i], b[i], p, out);
    }
    return;
  }
  if (isObject(a) && isObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of [...keys].sort()) {
      const p = childPath(path, k);
      if (!(k in a)) out.push({ kind: 'added', path: p, after: b[k] });
      else if (!(k in b)) out.push({ kind: 'removed', path: p, before: a[k] });
      else walk(a[k], b[k], p, out);
    }
    return;
  }
  if (a !== b) out.push({ kind: 'changed', path, before: a, after: b });
}

/** Semantic diff: ignores whitespace and key order; arrays are compared by index. */
export function diff(leftText: string, rightText: string): Change[] {
  const out: Change[] = [];
  walk(parseJson(leftText), parseJson(rightText), '$', out);
  return out;
}
