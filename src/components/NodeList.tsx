'use client';

import type { N8nNode } from '../types';
import { NodeCard } from './NodeCard';

interface NodeListProps {
  nodes: N8nNode[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onCopy: (node: N8nNode) => void;
}

export function NodeList({ nodes, selectedIds, onToggle, onCopy }: NodeListProps) {
  if (nodes.length === 0) {
    return (
      <div className="text-center text-base-content/50 py-8">
        No nodes generated yet. Parse an OpenAPI spec to get started.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {nodes.map((node) => (
        <NodeCard
          key={node.id}
          node={node}
          selected={selectedIds.has(node.id)}
          onToggle={() => onToggle(node.id)}
          onCopy={() => onCopy(node)}
        />
      ))}
    </div>
  );
}
