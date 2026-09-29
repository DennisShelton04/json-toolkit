import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { EditorSelection } from '@codemirror/state';
import { Editor } from './components/Editor';
import { TreeView } from './components/TreeView';
import { DiffReport, ErrorReport, Problems } from './components/OutputPanel';
import { stats, validate } from './core';
import {
  DEFAULT_OPTIONS,
  FILE_EXT,
  SAMPLE,
  SAMPLE_SCHEMA,
  TOOLS,
  inputLang,
  runTool,
  type ConvertMode,
  type Options,
  type ToolId,
} from './tools';

const LARGE_INPUT = 20 * 1024 * 1024;
const STORAGE_KEY = 'json-toolkit:v1';

interface Saved {
  tool: ToolId;
  input: string;
  schema: string;
  compare: string;
  options: Options;
}

function load(): Saved {
  const fallback: Saved = {
    tool: 'beautify',
    input: SAMPLE,
    schema: SAMPLE_SCHEMA,
    compare: '',
    options: DEFAULT_OPTIONS,
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    return saved
      ? { ...fallback, ...saved, options: { ...DEFAULT_OPTIONS, ...saved.options } }
      : fallback;
  } catch {
    return fallback;
  }
}

function useDarkMode(): boolean {
  const [query] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null,
  );
  const [dark, setDark] = useState(query?.matches ?? false);
  useEffect(() => {
    if (!query) return;
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [query]);
  return dark;
}

const formatBytes = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1024 ** 2
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1024 ** 2).toFixed(1)} MB`;

export default function App() {
  const initial = useMemo(load, []);
  const [tool, setTool] = useState<ToolId>(initial.tool);
  const [input, setInput] = useState(initial.input);
  const [schema, setSchema] = useState(initial.schema);
  const [compare, setCompare] = useState(initial.compare);
  const [options, setOptions] = useState<Options>(initial.options);
  const [view, setView] = useState<'text' | 'tree'>('text');
  const [toast, setToast] = useState('');
  const dark = useDarkMode();
  const inputRef = useRef<ReactCodeMirrorRef>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const def = TOOLS.find((t) => t.id === tool)!;
  const lang = inputLang(tool, options);
  const second = tool === 'schema' ? schema : compare;
  const setSecond = tool === 'schema' ? setSchema : setCompare;
  const deferredInput = useDeferredValue(input);
  const deferredSecond = useDeferredValue(second);

  const output = useMemo(
    () => (deferredInput.trim() ? runTool(tool, deferredInput, deferredSecond, options) : null),
    [tool, deferredInput, deferredSecond, options],
  );

  const inputInfo = useMemo(() => {
    if (lang !== 'json' || !deferredInput.trim()) return null;
    const r = validate(deferredInput);
    if (!r.valid) return { valid: false, text: `${r.errors.length} syntax error(s)` };
    const s = stats(JSON.parse(deferredInput), deferredInput);
    return {
      valid: true,
      text: `Valid · ${formatBytes(s.bytes)} · depth ${s.depth} · ${s.keys} keys · ${s.nodes} nodes`,
    };
  }, [deferredInput, lang]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tool, input, schema, compare, options }));
    } catch {
      /* storage unavailable or full — persistence is best-effort */
    }
  }, [tool, input, schema, compare, options]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const setOpt = <K extends keyof Options>(k: K, v: Options[K]) =>
    setOptions((o) => ({ ...o, [k]: v }));

  const jumpTo = useCallback((line: number, column: number) => {
    const view = inputRef.current?.view;
    if (!view) return;
    const l = view.state.doc.line(Math.min(Math.max(line, 1), view.state.doc.lines));
    const pos = Math.min(l.from + column - 1, l.to);
    view.dispatch({ selection: EditorSelection.cursor(pos), scrollIntoView: true });
    view.focus();
  }, []);

  const textOut = output?.kind === 'text' ? output : null;
  const treeValue = useMemo(() => {
    if (view !== 'tree' || textOut?.lang !== 'json') return undefined;
    try {
      return JSON.parse(textOut.text) as unknown;
    } catch {
      return undefined;
    }
  }, [view, textOut]);

  const copy = async (text: string, what = 'Output') => {
    try {
      await navigator.clipboard.writeText(text);
      setToast(`${what} copied`);
    } catch {
      setToast('Clipboard not available');
    }
  };

  const download = () => {
    if (!textOut) return;
    const url = URL.createObjectURL(new Blob([textOut.text], { type: 'text/plain' }));
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `output.${FILE_EXT[textOut.lang]}`,
    });
    a.click();
    URL.revokeObjectURL(url);
  };

  const openFile = async (file: File | undefined) => {
    if (!file) return;
    if (
      file.size > LARGE_INPUT &&
      !confirm(`${file.name} is ${formatBytes(file.size)}. Large files may be slow. Continue?`)
    )
      return;
    setInput(await file.text());
    setToast(`Loaded ${file.name}`);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>
          <span className="logo" aria-hidden>
            {'{ }'}
          </span>{' '}
          JSON Toolkit
        </h1>
        <p className="tagline">
          Everything runs in your browser — your data never leaves this device.
        </p>
        <div className="actions">
          <button onClick={() => setInput(SAMPLE)}>Sample</button>
          <button onClick={() => fileRef.current?.click()}>Open file</button>
          <input
            ref={fileRef}
            type="file"
            hidden
            accept=".json,.yaml,.yml,.csv,.txt,application/json"
            onChange={(e) => {
              void openFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button onClick={() => setInput('')}>Clear</button>
        </div>
      </header>

      <nav className="tabs" role="tablist" aria-label="Tools">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === tool}
            title={t.hint}
            onClick={() => setTool(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="options" aria-label="Options">
        <span className="hint">{def.hint}</span>
        {['beautify', 'repair', 'query', 'convert'].includes(tool) && (
          <label>
            Indent
            <select
              value={options.indent === '\t' ? 'tab' : String(options.indent)}
              onChange={(e) =>
                setOpt(
                  'indent',
                  e.target.value === 'tab' ? '\t' : (Number(e.target.value) as 2 | 4),
                )
              }
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tab</option>
            </select>
          </label>
        )}
        {(tool === 'beautify' || tool === 'minify') && (
          <label>
            <input
              type="checkbox"
              checked={options.sortKeys}
              onChange={(e) => setOpt('sortKeys', e.target.checked)}
            />{' '}
            Sort keys
          </label>
        )}
        {tool === 'query' && (
          <label className="grow">
            JSONPath
            <input
              className="mono"
              value={options.jsonPath}
              onChange={(e) => setOpt('jsonPath', e.target.value)}
              placeholder="$.store.books[?(@.price > 10)].title"
              spellCheck={false}
            />
          </label>
        )}
        {tool === 'convert' && (
          <label>
            Direction
            <select
              value={options.convertMode}
              onChange={(e) => setOpt('convertMode', e.target.value as ConvertMode)}
            >
              <option value="json-yaml">JSON → YAML</option>
              <option value="yaml-json">YAML → JSON</option>
              <option value="json-csv">JSON → CSV</option>
              <option value="csv-json">CSV → JSON</option>
            </select>
          </label>
        )}
        {tool === 'types' && (
          <label>
            Root name
            <input
              className="mono"
              value={options.rootName}
              onChange={(e) => setOpt('rootName', e.target.value)}
            />
          </label>
        )}
        {tool === 'escape' && (
          <label>
            <input
              type="checkbox"
              checked={options.unescape}
              onChange={(e) => setOpt('unescape', e.target.checked)}
            />{' '}
            Unescape
          </label>
        )}
      </section>

      {input.length > LARGE_INPUT && (
        <p className="warn">Large input ({formatBytes(input.length)}) — processing may be slow.</p>
      )}

      <main className="panes">
        <section
          className="pane"
          aria-label="Input"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            if (e.dataTransfer.files.length) {
              e.preventDefault();
              void openFile(e.dataTransfer.files[0]);
            }
          }}
        >
          <div className="pane-head">
            <h2>Input{lang !== 'json' ? ` (${lang.toUpperCase()})` : ''}</h2>
            {inputInfo && (
              <span className={`pill ${inputInfo.valid ? 'ok' : 'bad'}`}>{inputInfo.text}</span>
            )}
          </div>
          <div className={def.secondInput ? 'stack' : 'single'}>
            <Editor
              ref={inputRef}
              value={input}
              onChange={setInput}
              lang={lang}
              dark={dark}
              label="Input"
              lint
            />
            {def.secondInput && (
              <>
                <div className="pane-head sub">
                  <h2>{def.secondInput}</h2>
                </div>
                <Editor
                  key={tool}
                  value={second}
                  onChange={setSecond}
                  lang="json"
                  dark={dark}
                  label={def.secondInput}
                  lint
                />
              </>
            )}
          </div>
        </section>

        <section className="pane" aria-label="Output">
          <div className="pane-head">
            <h2>Output</h2>
            {textOut && (
              <div className="out-actions">
                {textOut.lang === 'json' && (
                  <div className="seg" role="group" aria-label="View">
                    <button aria-pressed={view === 'text'} onClick={() => setView('text')}>
                      Text
                    </button>
                    <button aria-pressed={view === 'tree'} onClick={() => setView('tree')}>
                      Tree
                    </button>
                  </div>
                )}
                <button onClick={() => void copy(textOut.text)}>Copy</button>
                <button onClick={download}>Download</button>
                {textOut.lang === 'json' && (
                  <button onClick={() => setInput(textOut.text)}>Use as input</button>
                )}
              </div>
            )}
          </div>
          <div className="single output">
            {!output && (
              <p className="empty">Paste JSON, drop a file, or load the sample to get started.</p>
            )}
            {textOut &&
              (treeValue !== undefined ? (
                <div className="tree-wrap">
                  <TreeView value={treeValue} onSelect={(p) => void copy(p, `Path ${p}`)} />
                </div>
              ) : (
                <Editor
                  value={textOut.text}
                  lang={textOut.lang}
                  readOnly
                  dark={dark}
                  label="Output"
                />
              ))}
            {output?.kind === 'problems' && <Problems output={output} onJump={jumpTo} />}
            {output?.kind === 'diff' && <DiffReport changes={output.changes} />}
            {output?.kind === 'error' && <ErrorReport output={output} onJump={jumpTo} />}
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>JSON Toolkit v{__APP_VERSION__}</span>
        <span>Tip: click a key in Tree view to copy its JSONPath</span>
      </footer>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
