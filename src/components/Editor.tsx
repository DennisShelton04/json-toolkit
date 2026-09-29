import { forwardRef, useMemo } from 'react';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { javascript } from '@codemirror/lang-javascript';
import { linter, lintGutter, type Diagnostic } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import { validate } from '../core';
import type { Lang } from '../tools';

const LINT_LIMIT = 2_000_000; // skip live linting on very large inputs to keep typing responsive

const jsonLinter = linter((view) => {
  const text = view.state.doc.toString();
  if (!text.trim() || text.length > LINT_LIMIT) return [];
  const r = validate(text);
  const toDiag =
    (severity: 'error' | 'warning') =>
    (p: { line: number; column: number; message: string }): Diagnostic => {
      const line = view.state.doc.line(Math.min(p.line, view.state.doc.lines));
      const from = Math.min(line.from + p.column - 1, line.to);
      return { from, to: Math.min(from + 1, view.state.doc.length), severity, message: p.message };
    };
  return [...r.errors.map(toDiag('error')), ...r.warnings.map(toDiag('warning'))];
});

interface Props {
  value: string;
  onChange?: (v: string) => void;
  lang: Lang;
  readOnly?: boolean;
  dark: boolean;
  label: string;
  lint?: boolean;
}

export const Editor = forwardRef<ReactCodeMirrorRef, Props>(function Editor(
  { value, onChange, lang, readOnly, dark, label, lint },
  ref,
) {
  const extensions = useMemo(() => {
    const ext = [EditorView.lineWrapping, EditorView.contentAttributes.of({ 'aria-label': label })];
    if (lang === 'json') ext.push(json());
    if (lang === 'yaml') ext.push(yaml());
    if (lang === 'ts') ext.push(javascript({ typescript: true }));
    if (lint && lang === 'json') ext.push(jsonLinter, lintGutter());
    return ext;
  }, [lang, lint, label]);

  return (
    <CodeMirror
      ref={ref}
      className="editor"
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      editable={!readOnly}
      theme={dark ? 'dark' : 'light'}
      extensions={extensions}
      height="100%"
      basicSetup={{ foldGutter: true, highlightActiveLine: !readOnly }}
    />
  );
});
