import { beautify, minify, sortKeys } from '../format';
import { JsonToolError } from '../errors';

describe('format (FR-01..03)', () => {
  it('beautifies with 2 spaces by default', () => {
    expect(beautify('{"a":1,"b":[1,2]}')).toBe('{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
  });
  it('supports 4 spaces and tabs', () => {
    expect(beautify('{"a":1}', 4)).toBe('{\n    "a": 1\n}');
    expect(beautify('{"a":1}', '\t')).toBe('{\n\t"a": 1\n}');
  });
  it('minifies', () => {
    expect(minify('{\n  "a" : 1 ,\n "b": [ true ]\n}')).toBe('{"a":1,"b":[true]}');
  });
  it('sorts keys recursively, keeping array order', () => {
    expect(sortKeys({ b: 1, a: { d: 1, c: [{ z: 1, y: 2 }] } })).toEqual({
      a: { c: [{ y: 2, z: 1 }], d: 1 },
      b: 1,
    });
    expect(minify('{"b":1,"a":2}', true)).toBe('{"a":2,"b":1}');
    expect(beautify('{"b":1,"a":2}', 2, true)).toBe('{\n  "a": 2,\n  "b": 1\n}');
  });
  it('throws a located error on invalid input', () => {
    try {
      beautify('{\n  "a": 1,\n}');
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(JsonToolError);
      expect((e as JsonToolError).line).toBe(3);
    }
  });
  it('rejects empty input', () => {
    expect(() => minify('   ')).toThrow('Input is empty');
  });
});
