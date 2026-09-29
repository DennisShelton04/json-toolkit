import { parseJson } from './parse';

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

function pascal(name: string): string {
  const s = name
    .replace(/[^A-Za-z0-9]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ''))
    .replace(/^./, (c) => c.toUpperCase());
  return /^[A-Za-z_]/.test(s) ? s : `T${s}`;
}

function propName(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}

class Generator {
  private interfaces = new Map<string, string>();

  private uniqueName(base: string): string {
    let name = base;
    for (let i = 2; this.interfaces.has(name); i++) name = `${base}${i}`;
    return name;
  }

  /** Builds one interface from several object samples; keys missing in some samples are optional. */
  private objectType(samples: Record<string, unknown>[], name: string): string {
    const typeName = this.uniqueName(pascal(name));
    this.interfaces.set(typeName, ''); // reserve before recursing
    const keys = [...new Set(samples.flatMap((s) => Object.keys(s)))];
    const lines = keys.map((k) => {
      const present = samples.filter((s) => k in s).map((s) => s[k]);
      const optional = present.length < samples.length ? '?' : '';
      return `  ${propName(k)}${optional}: ${this.typeOf(present, k)};`;
    });
    this.interfaces.set(typeName, `export interface ${typeName} {\n${lines.join('\n')}\n}`);
    return typeName;
  }

  private typeOf(values: unknown[], name: string): string {
    const types = new Set<string>();
    const objects = values.filter(isObject);
    const arrays = values.filter(Array.isArray) as unknown[][];
    for (const v of values) {
      if (v === null) types.add('null');
      else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
        types.add(typeof v);
    }
    if (objects.length) types.add(this.objectType(objects, name));
    if (arrays.length) {
      const items = arrays.flat();
      if (items.length === 0) types.add('unknown[]');
      else {
        const singular = name.endsWith('s') && name.length > 1 ? name.slice(0, -1) : `${name}Item`;
        const inner = this.typeOf(items, singular);
        types.add(inner.includes('|') ? `(${inner})[]` : `${inner}[]`);
      }
    }
    return types.size ? [...types].join(' | ') : 'unknown';
  }

  run(value: unknown, rootName: string): string {
    const root = this.typeOf([value], rootName);
    const body = [...this.interfaces.values()];
    if (!isObject(value)) body.unshift(`export type ${pascal(rootName)} = ${root};`);
    return body.join('\n\n') + '\n';
  }
}

export function toTypeScript(text: string, rootName = 'Root'): string {
  return new Generator().run(parseJson(text), rootName);
}
