import { validateSchema } from '../schema';

const schema = JSON.stringify({
  type: 'object',
  required: ['id', 'name'],
  additionalProperties: false,
  properties: {
    id: { type: 'integer' },
    name: { type: 'string', minLength: 1 },
    role: { enum: ['admin', 'user'] },
    tags: { type: 'array', items: { type: 'string' } },
  },
});

describe('validateSchema (FR-07)', () => {
  it('passes valid data', () => {
    expect(validateSchema('{"id":1,"name":"a","tags":["x"]}', schema)).toEqual({
      valid: true,
      errors: [],
    });
  });
  it('lists every violation with a JSONPath', () => {
    const r = validateSchema('{"id":"1","role":"root","tags":["x",2],"extra":true}', schema);
    expect(r.valid).toBe(false);
    const byPath = Object.fromEntries(r.errors.map((e) => [e.path + ':' + e.message, true]));
    expect(Object.keys(byPath)).toEqual(
      expect.arrayContaining([
        "$:must have required property 'name'",
        '$:must NOT have additional property "extra"',
        '$.id:must be integer',
        '$.role:must be one of ["admin","user"]',
        '$.tags[1]:must be string',
      ]),
    );
  });
  it('supports draft 2020-12', () => {
    const s = JSON.stringify({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      prefixItems: [{ type: 'number' }],
    });
    expect(validateSchema('["x"]', s).errors[0].path).toBe('$[0]');
  });
  it('supports draft 2019-09', () => {
    const s = JSON.stringify({
      $schema: 'https://json-schema.org/draft/2019-09/schema',
      type: 'string',
    });
    expect(validateSchema('1', s).valid).toBe(false);
  });
  it('reports bad schemas clearly', () => {
    expect(() => validateSchema('{}', '[]')).toThrow('Schema must be a JSON object');
    expect(() => validateSchema('{}', '{"type":"nope"}')).toThrow(/Invalid schema/);
    expect(() => validateSchema('{}', '{"type":')).toThrow(/^Schema:/);
  });
});
