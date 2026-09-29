import { stats } from '../stats';
import { escapeJson, unescapeJson } from '../escape';
import { parseJson } from '../parse';

describe('stats (FR-13)', () => {
  it('counts depth, keys and nodes', () => {
    expect(stats({ a: [1, { b: 2 }], c: 'é' })).toEqual({ bytes: 26, depth: 3, keys: 3, nodes: 6 });
    expect(stats(1, '1')).toEqual({ bytes: 1, depth: 0, keys: 0, nodes: 1 });
  });
});

describe('escape (FR-15)', () => {
  it('round-trips', () => {
    const s = '{"a":"line\nbreak"}';
    expect(escapeJson(s)).toBe('"{\\"a\\":\\"line\\nbreak\\"}"');
    expect(unescapeJson(escapeJson(s))).toBe(s);
  });
  it('accepts input without surrounding quotes', () => {
    expect(unescapeJson('{\\"a\\":1}')).toBe('{"a":1}');
  });
  it('rejects bad escapes', () => {
    expect(() => unescapeJson('"\\x"')).toThrow(/not a valid escaped/);
  });
});

describe('parseJson', () => {
  it('parses valid JSON', () => {
    expect(parseJson('[1]')).toEqual([1]);
  });
});
