/** Appends a key or index to a JSONPath expression, quoting keys that are not identifiers. */
export function childPath(parent: string, key: string | number): string {
  if (typeof key === 'number') return `${parent}[${key}]`;
  return /^[A-Za-z_$][\w$]*$/.test(key)
    ? `${parent}.${key}`
    : `${parent}['${key.replace(/'/g, "\\'")}']`;
}
