import { diff } from '../diff';

describe('diff (FR-08)', () => {
  it('acceptance: key order and whitespace are ignored', () => {
    expect(diff('{"a":1,"b":2}', '{ "b": 2,\n "a": 1 }')).toEqual([]);
  });
  it('reports added, removed and changed paths', () => {
    expect(diff('{"a":1,"b":{"c":[1,2]},"d":true}', '{"a":2,"b":{"c":[1]},"e":null}')).toEqual([
      { kind: 'changed', path: '$.a', before: 1, after: 2 },
      { kind: 'removed', path: '$.b.c[1]', before: 2 },
      { kind: 'removed', path: '$.d', before: true },
      { kind: 'added', path: '$.e', after: null },
    ]);
  });
  it('treats type changes as changed', () => {
    expect(diff('{"a":[1]}', '{"a":{"0":1}}')).toEqual([
      { kind: 'changed', path: '$.a', before: [1], after: { 0: 1 } },
    ]);
  });
  it('quotes non-identifier keys', () => {
    expect(diff('{"a b":1}', '{"a b":2}')[0].path).toBe("$['a b']");
  });
  it('reports added array items', () => {
    expect(diff('[1]', '[1,2]')).toEqual([{ kind: 'added', path: '$[1]', after: 2 }]);
  });
});
