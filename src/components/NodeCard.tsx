'use client';

import type { N8nNode } from '../types';

interface NodeCardProps {
  node: N8nNode;
  selected: boolean;
  onToggle: () => void;
  onCopy: () => void;
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

export function NodeCard({ node, selected, onToggle, onCopy }: NodeCardProps) {
  const method = node.parameters.method;
  const url = node.parameters.url;
  const path = url.replace(/^https?:\/\/[^/]+/, '') || url;

  return (
    <div className={`card bg-base-100 shadow-sm border ${selected ? 'border-primary' : 'border-base-300'}`}>
      <div className="card-body p-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="checkbox checkbox-primary checkbox-sm"
            checked={selected}
            onChange={onToggle}
          />
          <span className={`badge ${methodColors[method] || 'badge-ghost'} badge-sm`}>
            {method}
          </span>
        </div>

        <p className="font-mono text-sm truncate" title={path}>
          {path}
        </p>

        <p className="text-xs text-base-content/70 truncate" title={node.name}>
          {node.name}
        </p>

        <div className="card-actions justify-end mt-2">
          <button className="btn btn-ghost btn-xs" onClick={onCopy}>
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
