'use client';

import { useState, useEffect } from 'react';
import { InputPanel } from '@/components/InputPanel';
import { BaseUrlSelector } from '@/components/BaseUrlSelector';
import { HistoryTable } from '@/components/HistoryTable';
import { ResultTabs } from '@/components/ResultTabs';
import { parseOpenAPI, getBaseUrl, getServers, type Server } from '@/lib/parser';
import { convertToN8nNodes, createWorkflow } from '@/lib/converter';
import { useHistory } from '@/hooks/useHistory';
import type { N8nNode, OpenAPISpec } from '@/types';

export default function Home() {
  // Parsing state
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [baseUrl, setBaseUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // History state
  const { history, isLoaded, addEntry, removeEntry, updateEntry } = useHistory();
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  // Current view state (from selected history entry)
  const [currentNodes, setCurrentNodes] = useState<N8nNode[]>([]);
  const [currentSelectedIds, setCurrentSelectedIds] = useState<Set<string>>(new Set());

  // Auto-select first history entry on load
  useEffect(() => {
    if (isLoaded && history.length > 0 && !selectedHistoryId) {
      handleSelectHistory(history[0].id);
    }
  }, [isLoaded, history.length]);

  const handleParse = async (content: string) => {
    if (!content.trim()) {
      setError('Please provide OpenAPI spec content');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedSpec = parseOpenAPI(content);
      setSpec(parsedSpec);

      const detectedServers = getServers(parsedSpec);
      setServers(detectedServers);

      const detectedBaseUrl = getBaseUrl(parsedSpec);
      setBaseUrl(detectedBaseUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse OpenAPI spec');
      setSpec(null);
      setServers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = () => {
    if (!spec) return;

    const nodes = convertToN8nNodes(spec, baseUrl);
    const selectedIds = nodes.map(n => n.id);

    const newId = addEntry({
      title: spec.info?.title || 'Untitled',
      baseUrl,
      nodeCount: nodes.length,
      nodes,
      selectedIds,
    });

    // Select the new entry
    handleSelectHistory(newId);

    // Clear parse state
    setSpec(null);
    setServers([]);
    setBaseUrl('');
  };

  const handleSelectHistory = (id: string) => {
    const entry = history.find(h => h.id === id);
    if (entry) {
      setSelectedHistoryId(id);
      setCurrentNodes(entry.nodes);
      setCurrentSelectedIds(new Set(entry.selectedIds));
    }
  };

  const handleDeleteHistory = (id: string) => {
    removeEntry(id);
    if (selectedHistoryId === id) {
      setSelectedHistoryId(null);
      setCurrentNodes([]);
      setCurrentSelectedIds(new Set());
    }
  };

  const handleToggleNode = (nodeId: string) => {
    setCurrentSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }

      // Update history entry
      if (selectedHistoryId) {
        updateEntry(selectedHistoryId, { selectedIds: Array.from(next) });
      }

      return next;
    });
  };

  const handleCopyNode = (node: N8nNode) => {
    const workflow = createWorkflow([node]);
    navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <header className="navbar bg-base-200 px-6">
        <h1 className="text-xl font-bold">OpenAPI → n8n Converter</h1>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Input */}
        <div className="flex flex-col gap-4">
          <InputPanel
            onParse={handleParse}
            loading={loading}
            error={error}
          />

          {/* Show BaseUrlSelector after successful parse */}
          {spec && servers.length > 0 && (
            <div className="card bg-base-200 p-4">
              <BaseUrlSelector
                servers={servers}
                selectedUrl={baseUrl}
                onSelect={setBaseUrl}
              />
              <button
                className="btn btn-primary mt-4 w-full"
                onClick={handleConvert}
              >
                Convert & Save
              </button>
            </div>
          )}

          {/* Show convert button if spec parsed but no servers */}
          {spec && servers.length === 0 && (
            <div className="card bg-base-200 p-4">
              <p className="text-sm text-base-content/70 mb-2">No servers found in spec</p>
              <input
                type="text"
                className="input input-bordered w-full mb-4"
                placeholder="Enter base URL"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
              <button
                className="btn btn-primary w-full"
                onClick={handleConvert}
              >
                Convert & Save
              </button>
            </div>
          )}
        </div>

        {/* Right column - History + Results */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* History Table */}
          <div className="card bg-base-200 p-4">
            <h2 className="font-semibold mb-2">History</h2>
            <HistoryTable
              history={history}
              selectedId={selectedHistoryId}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
            />
          </div>

          {/* Result Tabs */}
          <div className="card bg-base-200 p-4 flex-1">
            <ResultTabs
              nodes={currentNodes}
              selectedIds={currentSelectedIds}
              onToggle={handleToggleNode}
              onCopyNode={handleCopyNode}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
