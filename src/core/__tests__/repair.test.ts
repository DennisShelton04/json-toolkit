import { repair } from '../repair';

describe('repair (FR-06)', () => {
  it('acceptance: {a:\'x\',} → {"a":"x"}', () => {
    expect(JSON.parse(repair("{a:'x',}"))).toEqual({ a: 'x' });
  });
  it('removes comments and closes brackets', () => {
    expect(JSON.parse(repair('// c\n{"a": [1, 2 /* x */'))).toEqual({ a: [1, 2] });
  });
  it('converts Python-style constants', () => {
    expect(JSON.parse(repair('{"a": True, "b": None}'))).toEqual({ a: true, b: null });
  });
  it('output is formatted with the requested indent', () => {
    expect(repair('{a:1}', 4)).toBe('{\n    "a": 1\n}');
  });
  it('rejects empty input', () => {
    expect(() => repair('')).toThrow('Input is empty');
  });
});
