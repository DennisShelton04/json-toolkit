import {
  DEFAULT_OPTIONS,
  SAMPLE,
  SAMPLE_SCHEMA,
  TOOLS,
  inputLang,
  runTool,
  type Options,
} from '../tools';

const o = (patch: Partial<Options> = {}): Options => ({ ...DEFAULT_OPTIONS, ...patch });

describe('tool registry', () => {
  it('every tool runs on the sample without crashing', () => {
    for (const t of TOOLS) {
      const out = runTool(t.id, SAMPLE, t.id === 'schema' ? SAMPLE_SCHEMA : SAMPLE, o());
      expect(out.kind, t.id).not.toBe('error');
    }
  });
  it('asks for the second input when it is empty', () => {
    expect(runTool('diff', '{}', ' ', o())).toMatchObject({
      kind: 'error',
      message: expect.stringMatching(/compare with/),
    });
    expect(runTool('schema', '{}', '', o())).toMatchObject({
      kind: 'error',
      message: expect.stringMatching(/JSON Schema/),
    });
  });
  it('sample validates against the sample schema', () => {
    expect(runTool('schema', SAMPLE, SAMPLE_SCHEMA, o())).toMatchObject({
      kind: 'problems',
      ok: true,
    });
  });
  it('converts errors into an error output with location', () => {
    expect(runTool('beautify', '{\n"a":}', '', o())).toMatchObject({ kind: 'error', line: 2 });
  });
  it('validate summarises errors and warnings', () => {
    expect(runTool('validate', '{"a":1,"a":2}', '', o())).toMatchObject({
      ok: true,
      summary: 'Valid JSON with 1 warning(s)',
    });
    expect(runTool('validate', '{', '', o())).toMatchObject({ ok: false });
  });
  it('convert honours the direction option', () => {
    expect(runTool('convert', 'a: 1', '', o({ convertMode: 'yaml-json' }))).toMatchObject({
      lang: 'json',
      text: '{\n  "a": 1\n}',
    });
    expect(runTool('convert', 'a\n1', '', o({ convertMode: 'csv-json' }))).toMatchObject({
      lang: 'json',
    });
    expect(runTool('convert', '[{"a":1}]', '', o({ convertMode: 'json-csv' }))).toMatchObject({
      lang: 'csv',
    });
  });
  it('escape / unescape', () => {
    expect(runTool('escape', '{"a":1}', '', o())).toMatchObject({ text: '"{\\"a\\":1}"' });
    expect(runTool('escape', '"{\\"a\\":1}"', '', o({ unescape: true }))).toMatchObject({
      text: '{"a":1}',
    });
  });
  it('picks the input language per tool', () => {
    expect(inputLang('convert', o({ convertMode: 'yaml-json' }))).toBe('yaml');
    expect(inputLang('convert', o({ convertMode: 'csv-json' }))).toBe('csv');
    expect(inputLang('escape', o({ unescape: true }))).toBe('text');
    expect(inputLang('beautify', o())).toBe('json');
  });
});
