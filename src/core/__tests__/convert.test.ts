import { csvToJson, flatten, jsonToCsv, jsonToYaml, yamlToJson } from '../convert';

describe('convert (FR-10)', () => {
  it('JSON → YAML → JSON round-trips', () => {
    const json = '{"name":"x","list":[1,"two",null],"nested":{"ok":true}}';
    const yaml = jsonToYaml(json);
    expect(yaml).toContain('name: x');
    expect(JSON.parse(yamlToJson(yaml))).toEqual(JSON.parse(json));
  });
  it('reports YAML errors with a line number', () => {
    try {
      yamlToJson('a: 1\n b: 2\n  - c');
      expect.unreachable();
    } catch (e) {
      expect((e as Error).message).toMatch(/^Invalid YAML/);
      expect((e as { line?: number }).line).toBeGreaterThan(0);
    }
  });
  it('JSON array → CSV with flattened, unioned columns', () => {
    const csv = jsonToCsv('[{"id":1,"user":{"name":"a"}},{"id":2,"tags":["x"],"note":"a,b"}]');
    expect(csv.split(/\r?\n/)).toEqual(['id,user.name,tags,note', '1,a,,', '2,,"[""x""]","a,b"']);
  });
  it('single object → one CSV row', () => {
    expect(jsonToCsv('{"a":1}')).toBe('a\r\n1');
  });
  it('rejects non-object rows for CSV', () => {
    expect(() => jsonToCsv('[1,2]')).toThrow(/array of objects/);
  });
  it('CSV → JSON with typed values', () => {
    expect(JSON.parse(csvToJson('id,name,active\n1,Ann,true\n2,"Bo, Jr",false\n'))).toEqual([
      { id: 1, name: 'Ann', active: true },
      { id: 2, name: 'Bo, Jr', active: false },
    ]);
  });
  it('CSV → JSON with a single column', () => {
    expect(JSON.parse(csvToJson('name\nAnn\nBo'))).toEqual([{ name: 'Ann' }, { name: 'Bo' }]);
  });
  it('flatten keeps empty objects visible', () => {
    expect(flatten({ a: {}, b: { c: 1 } })).toEqual({ a: '{}', 'b.c': 1 });
  });
});
