import { validate } from '../validate';
import { offsetToPosition } from '../errors';

describe('validate (FR-04, FR-05)', () => {
  it('accepts valid JSON', () => {
    expect(validate('{"a":[1,2,{"b":null}]}')).toEqual({ valid: true, errors: [], warnings: [] });
  });
  it('acceptance: trailing comma reported at line 1, column 8', () => {
    const r = validate('{"a":1,}');
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toMatchObject({ line: 1, column: 8 });
  });
  it('reports line and column on multi-line input', () => {
    const r = validate('{\n  "a": 1\n  "b": 2\n}');
    expect(r.errors[0]).toMatchObject({ message: 'Comma expected', line: 3, column: 3 });
  });
  it('rejects comments, single quotes and unquoted keys', () => {
    expect(validate('{"a":1 // hi\n}').valid).toBe(false);
    expect(validate("{'a':1}").valid).toBe(false);
    expect(validate('{a:1}').errors[0]).toMatchObject({ line: 1, column: 2 });
  });
  it('reports unclosed brackets', () => {
    expect(validate('[1,2').errors.map((e) => e.message)).toContain("Closing ']' expected");
  });
  it('warns on duplicate keys per object only', () => {
    const r = validate('{"a":1,"b":{"a":2},"a":3}');
    expect(r.valid).toBe(true);
    expect(r.warnings).toHaveLength(1);
    expect(r.warnings[0]).toMatchObject({ message: 'Duplicate key "a"', line: 1, column: 20 });
  });
  it('treats empty input as invalid', () => {
    expect(validate('').valid).toBe(false);
  });
  it('offsetToPosition is 1-based', () => {
    expect(offsetToPosition('ab\ncd', 0)).toEqual({ line: 1, column: 1 });
    expect(offsetToPosition('ab\ncd', 4)).toEqual({ line: 2, column: 2 });
  });
});
