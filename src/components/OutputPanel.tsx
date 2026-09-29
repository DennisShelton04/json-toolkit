import type { Change } from '../core';
import type { Output, ProblemItem } from '../tools';

const preview = (v: unknown) => {
  const s = JSON.stringify(v);
  return s === undefined ? '' : s.length > 80 ? s.slice(0, 77) + '…' : s;
};

function Location({ p, onJump }: { p: ProblemItem; onJump: (line: number, col: number) => void }) {
  if (p.line) {
    return (
      <button className="loc" onClick={() => onJump(p.line!, p.column ?? 1)}>
        Ln {p.line}, Col {p.column}
      </button>
    );
  }
  return p.path ? <code className="loc">{p.path}</code> : null;
}

export function Problems({
  output,
  onJump,
}: {
  output: Extract<Output, { kind: 'problems' }>;
  onJump: (l: number, c: number) => void;
}) {
  return (
    <div className="report" role="status">
      <p className={`banner ${output.ok ? 'ok' : 'bad'}`}>
        {output.ok ? '✓' : '✕'} {output.summary}
      </p>
      {output.items.length > 0 && (
        <ul className="problems">
          {output.items.map((p, i) => (
            <li key={i} className={p.severity}>
              <span className="sev">{p.severity === 'error' ? 'Error' : 'Warning'}</span>
              <Location p={p} onJump={onJump} />
              <span>{p.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const SYMBOL = { added: '+', removed: '−', changed: '~' } as const;

export function DiffReport({ changes }: { changes: Change[] }) {
  const count = (k: Change['kind']) => changes.filter((c) => c.kind === k).length;
  return (
    <div className="report" role="status">
      <p className={`banner ${changes.length ? 'bad' : 'ok'}`}>
        {changes.length
          ? `${changes.length} difference(s): ${count('added')} added, ${count('removed')} removed, ${count('changed')} changed`
          : '✓ No differences — documents are semantically equal'}
      </p>
      <ul className="diff">
        {changes.map((c, i) => (
          <li key={i} className={c.kind}>
            <span className="sym" aria-label={c.kind}>
              {SYMBOL[c.kind]}
            </span>
            <code>{c.path}</code>
            {c.kind !== 'added' && <span className="before">{preview(c.before)}</span>}
            {c.kind === 'changed' && <span className="arrow">→</span>}
            {c.kind !== 'removed' && <span className="after">{preview(c.after)}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ErrorReport({
  output,
  onJump,
}: {
  output: Extract<Output, { kind: 'error' }>;
  onJump: (l: number, c: number) => void;
}) {
  return (
    <div className="report" role="alert">
      <p className="banner bad">✕ {output.message}</p>
      {output.line && (
        <button className="loc" onClick={() => onJump(output.line!, output.column ?? 1)}>
          Go to Ln {output.line}
          {output.column ? `, Col ${output.column}` : ''}
        </button>
      )}
    </div>
  );
}
