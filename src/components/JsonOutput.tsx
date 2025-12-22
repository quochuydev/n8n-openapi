'use client';

import type { N8nWorkflow } from '../types';

interface JsonOutputProps {
  workflow: N8nWorkflow;
  onCopyAll: () => void;
}

export function JsonOutput({ workflow, onCopyAll }: JsonOutputProps) {
  const json = JSON.stringify(workflow, null, 2);
  const nodeCount = workflow.nodes.length;

  return (
    <div className="card bg-base-200 h-full flex flex-col">
      <div className="card-body p-4 flex flex-col h-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">
            Output ({nodeCount} node{nodeCount !== 1 ? 's' : ''})
          </h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={onCopyAll}
            disabled={nodeCount === 0}
          >
            Copy All
          </button>
        </div>

        <pre className="bg-base-300 rounded-lg p-4 overflow-auto flex-1 text-xs font-mono">
          {nodeCount > 0 ? json : '{\n  "nodes": [],\n  "connections": {}\n}'}
        </pre>
      </div>
    </div>
  );
}
