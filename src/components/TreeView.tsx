import { useState } from 'react';
import { childPath } from '../core/path';

interface NodeProps {
  name: string | number | null;
  value: unknown;
  path: string;
  depth: number;
  onSelect: (path: string) => void;
}

function Node({ name, value, path, depth, onSelect }: NodeProps) {
  const [open, setOpen] = useState(depth < 2);
  const isArr = Array.isArray(value);
  const isObj = value !== null && typeof value === 'object';
  const label = name === null ? 'root' : String(name);

  if (!isObj) {
    const cls = value === null ? 'null' : typeof value;
    return (
      <li>
        <button className="tree-key" onClick={() => onSelect(path)} title={path}>
          {label}
        </button>
        <span className="tree-sep">: </span>
        <span className={`tree-val ${cls}`}>{JSON.stringify(value)}</span>
      </li>
    );
  }

  const entries: [string | number, unknown][] = isArr
    ? (value as unknown[]).map((v, i) => [i, v])
    : Object.entries(value as Record<string, unknown>);

  return (
    <li>
      <button
        className="tree-toggle"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        aria-label={`Toggle ${label}`}
      >
        {open ? '▾' : '▸'}
      </button>
      <button className="tree-key" onClick={() => onSelect(path)} title={path}>
        {label}
      </button>
      <span className="tree-meta">{isArr ? `[${entries.length}]` : `{${entries.length}}`}</span>
      {open && (
        <ul>
          {entries.map(([k, v]) => (
            <Node
              key={k}
              name={k}
              value={v}
              path={childPath(path, k)}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function TreeView({
  value,
  onSelect,
}: {
  value: unknown;
  onSelect: (path: string) => void;
}) {
  return (
    <ul className="tree" role="tree">
      <Node name={null} value={value} path="$" depth={0} onSelect={onSelect} />
    </ul>
  );
}
