'use client';

import type { N8nNode } from '../types';

interface NodeListProps {
  nodes: N8nNode[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onCopy: (node: N8nNode) => void;
}

const methodColors: Record<string, string> = {
  GET: 'badge-success',
  POST: 'badge-info',
  PUT: 'badge-warning',
  PATCH: 'badge-warning',
  DELETE: 'badge-error',
  OPTIONS: 'badge-ghost',
  HEAD: 'badge-ghost',
};

export function NodeList({ nodes, selectedIds, onToggle, onCopy }: NodeListProps) {
  if (nodes.length === 0) {
    return (
      <div className="text-center text-base-content/50 py-8">
        No nodes generated yet. Parse an OpenAPI spec to get started.
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {nodes.map((node) => {
        const method = node.parameters.method;
        const url = node.parameters.url;
        const path = url.replace(/^https?:\/\/[^/]+/, '') || url;
        const selected = selectedIds.has(node.id);

        return (
          <li
            key={node.id}
            className={`flex items-center gap-2 p-2 rounded hover:bg-base-300 ${selected ? 'bg-primary/10' : ''}`}
          >
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-sm"
              checked={selected}
              onChange={() => onToggle(node.id)}
            />
            <span className={`badge ${methodColors[method] || 'badge-ghost'} badge-sm w-16 justify-center`}>
              {method}
            </span>
            <span className="font-mono text-sm truncate flex-1" title={path}>
              {path}
            </span>
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => onCopy(node)}
            >
              Copy
            </button>
          </li>
        );
      })}
    </ul>
  );
}
