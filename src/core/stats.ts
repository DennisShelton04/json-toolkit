export interface Stats {
  bytes: number;
  depth: number;
  keys: number;
  nodes: number;
}

export function stats(value: unknown, text?: string): Stats {
  let keys = 0;
  let nodes = 0;
  const walk = (v: unknown, d: number): number => {
    nodes++;
    if (Array.isArray(v)) return v.reduce<number>((m, x) => Math.max(m, walk(x, d + 1)), d);
    if (v !== null && typeof v === 'object') {
      const entries = Object.values(v as Record<string, unknown>);
      keys += entries.length;
      return entries.reduce<number>((m, x) => Math.max(m, walk(x, d + 1)), d);
    }
    return d;
  };
  const depth = walk(value, 0);
  const bytes = new TextEncoder().encode(text ?? JSON.stringify(value)).length;
  return { bytes, depth, keys, nodes };
}
