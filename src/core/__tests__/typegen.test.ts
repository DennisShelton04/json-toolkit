import { toTypeScript } from '../typegen';

describe('toTypeScript (FR-11)', () => {
  it('acceptance: simple object', () => {
    expect(toTypeScript('{"id":1,"tags":["x"]}')).toBe(
      'export interface Root {\n  id: number;\n  tags: string[];\n}\n',
    );
  });
  it('creates nested interfaces and optional fields from array samples', () => {
    const ts = toTypeScript('{"users":[{"id":1,"address":{"city":"X"}},{"id":2,"email":null}]}');
    expect(ts).toContain('export interface Root {\n  users: User[];\n}');
    expect(ts).toContain(
      'export interface User {\n  id: number;\n  address?: Address;\n  email?: null;\n}',
    );
    expect(ts).toContain('export interface Address {\n  city: string;\n}');
  });
  it('produces unions for mixed arrays and quotes odd keys', () => {
    const ts = toTypeScript('{"mix":[1,"a"],"empty":[],"my-key":true}');
    expect(ts).toContain('mix: (number | string)[];');
    expect(ts).toContain('empty: unknown[];');
    expect(ts).toContain('"my-key": boolean;');
  });
  it('handles a top-level array and custom root name', () => {
    expect(toTypeScript('[{"a":1}]', 'items')).toBe(
      'export type Items = Item[];\n\nexport interface Item {\n  a: number;\n}\n',
    );
  });
  it('avoids interface name collisions', () => {
    const ts = toTypeScript('{"a":{"data":{"x":1}},"b":{"data":{"y":1}}}');
    expect(ts).toContain('export interface Data {');
    expect(ts).toContain('export interface Data2 {');
  });
});
